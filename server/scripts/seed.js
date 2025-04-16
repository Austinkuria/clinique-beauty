import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs-extra'; // Use fs-extra for ensureFile and pathExists
import path from 'path';
import { fileURLToPath } from 'url';
import mockProducts from '../../client/src/data/mockProducts.js'; // Adjust path as needed

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// --- Configuration ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Key for admin tasks
const imageBucketName = 'product-images'; // Your Supabase storage bucket name
const placeholderImageName = 'placeholder.webp'; // Name of your placeholder image file
const placeholderStoragePath = 'placeholder.webp'; // Path to store placeholder in the bucket
const USD_TO_KES_RATE = 130; // Define the exchange rate (adjust as needed)

// *** Add verbose logging before client creation ***
console.log(`Attempting to initialize Supabase client with:`);
console.log(`  URL: ${supabaseUrl}`);
// Log only a prefix of the key for security, but confirm it's loaded
console.log(`  Service Key Loaded: ${supabaseServiceKey ? 'Yes (starts with ' + supabaseServiceKey.substring(0, 10) + '...)' : 'NO'}`);

// --- Initialization ---
if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the .env file.');
    process.exit(1);
}

// Revert to the simplest initialization form, relying on service key defaults
// Now that 'public' schema is exposed in API settings, this should work.
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
    // Remove global headers and db.schema options
});
console.log('Supabase client initialized (simple config - expecting public schema exposed in API settings).');

// Derive __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Correctly resolve the base path for images relative to the project root
// Assuming the script is run from the 'server' directory or project root where .env is
const projectRoot = path.resolve(__dirname, '..', '..'); // Go up two levels from server/scripts
const localImagesBasePath = path.join(projectRoot, 'client', 'src', 'assets', 'images', 'products');
const localPlaceholderImagePath = path.join(projectRoot, 'client', 'src', 'assets', 'images', placeholderImageName); // Path to local placeholder

console.log(`Local images base path: ${localImagesBasePath}`);
console.log(`Local placeholder image path: ${localPlaceholderImagePath}`);

// --- Helper Functions ---
async function uploadImage(localImagePath, storagePath) {
    try {
        const fileExists = await fs.pathExists(localImagePath);
        if (!fileExists) {
            console.warn(`Warning: Image file not found: ${localImagePath}`);
            return null;
        }

        const fileBuffer = await fs.readFile(localImagePath);
        const { data, error } = await supabase.storage
            .from(imageBucketName)
            .upload(storagePath, fileBuffer, {
                cacheControl: '3600',
                upsert: true, // Overwrite if exists
                contentType: `image/${path.extname(localImagePath).substring(1)}` // Dynamically set content type
            });

        if (error) {
            console.error(`Error uploading image ${storagePath}:`, error.message);
            return null;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(imageBucketName)
            .getPublicUrl(storagePath);

        console.log(`Successfully uploaded ${storagePath}. Public URL: ${urlData.publicUrl}`);
        return urlData.publicUrl;

    } catch (err) {
        console.error(`Exception during image upload for ${localImagePath}:`, err);
        return null;
    }
}

// --- Seeding Logic ---
async function seedDatabase() {
    console.log('Starting database seeding...');

    // --- Upload Placeholder Image ---
    console.log(`\nAttempting to upload placeholder image from: ${localPlaceholderImagePath} to ${placeholderStoragePath}`);
    const placeholderUrl = await uploadImage(localPlaceholderImagePath, placeholderStoragePath);

    if (!placeholderUrl) {
        console.error(`\nFATAL: Could not upload placeholder image (${placeholderImageName}). Seeding cannot proceed reliably without a fallback image.`);
        process.exit(1); // Exit if placeholder fails
    }
    console.log(`Placeholder image uploaded successfully. URL: ${placeholderUrl}`);
    // --- End Placeholder Upload ---

    for (const product of mockProducts) {
        try {
            console.log(`\nProcessing product: ${product.name}`);

            // 1. Check if product already exists (by name for idempotency)
            const { data: existingProduct, error: checkError } = await supabase
                .from('products')
                .select('id, name')
                .eq('name', product.name)
                .maybeSingle(); // Use maybeSingle to handle 0 or 1 result without error

            if (checkError) {
                console.error(`Error checking for product ${product.name}:`, checkError.message);
                continue; // Skip this product on error
            }

            if (existingProduct) {
                console.log(`Product "${product.name}" already exists. Skipping.`);
                continue; // Skip if product exists
            }

            // 2. Handle Image Upload (with placeholder fallback)
            let imageUrl = null; // Initialize imageUrl
            if (product.image) {
                // Construct local path from the relative web path in mock data
                // Remove leading '/' if present
                const relativeImagePath = product.image.startsWith('/') ? product.image.substring(1) : product.image;
                // Split path and reconstruct for storage path (e.g., 'skincare/moisturizer.jpg')
                const imagePathParts = relativeImagePath.split('/').slice(1); // Remove 'images' part
                const localImagePath = path.join(localImagesBasePath, ...imagePathParts);
                const storagePath = imagePathParts.join('/'); // e.g., 'skincare/moisturizer.jpg'

                console.log(`Attempting to upload image from: ${localImagePath} to ${storagePath}`);
                imageUrl = await uploadImage(localImagePath, storagePath);

                // *** Use placeholder if specific image upload failed ***
                if (imageUrl === null) {
                    console.warn(`Using placeholder image for ${product.name} as specific image was not found or failed to upload.`);
                    imageUrl = placeholderUrl;
                }
            } else {
                // If no image is specified in mock data, use the placeholder
                console.log(`No image specified for ${product.name}. Using placeholder.`);
                imageUrl = placeholderUrl;
            }

            // *** Remove the previous skip logic ***
            // The 'if (product.image && imageUrl === null)' block is removed.

            // 3. Prepare Product Data for Insertion - Include all fields
            const productData = {
                name: product.name,
                price: Math.round(product.price * USD_TO_KES_RATE), // Convert price to KES
                description: product.description,
                category: product.category,
                rating: product.rating || 0, // Include rating (ensure column exists)
                stock: product.stock || 0,
                image: imageUrl,
                // Include fields previously commented out or missing (ensure columns exist)
                benefits: product.benefits || null,         // Assuming JSONB or text[] column
                ingredients: product.ingredients || null,   // Assuming JSONB or text[] column
                shades: product.shades || null,             // Assuming JSONB column
                notes: product.notes || null,               // Assuming JSONB or text[] column
                palettetheme: product.paletteTheme || null, // Assuming text column
                // Add created_at, updated_at if your table doesn't auto-set them
            };

            // 4. Insert Product into Database
            const { data: newProduct, error: insertError } = await supabase
                .from('products')
                .insert(productData)
                .select()
                .single(); // Get the inserted product back

            if (insertError) {
                console.error(`Error inserting product ${product.name}:`, insertError.message);
                // Attempt to remove uploaded image if insert failed - ONLY if it wasn't the placeholder
                if (imageUrl && imageUrl !== placeholderUrl && product.image) {
                    // Construct storage path again for removal
                    const relativeImagePath = product.image.startsWith('/') ? product.image.substring(1) : product.image;
                    const imagePathParts = relativeImagePath.split('/').slice(1);
                    const storagePath = imagePathParts.length > 1 ? imagePathParts.join('/') : path.basename(relativeImagePath); // Use relativeImagePath here
                    console.log(`Attempting to remove orphaned image: ${storagePath}`);
                    await supabase.storage.from(imageBucketName).remove([storagePath]);
                }
            } else {
                console.log(`Successfully inserted product: ${newProduct.name} (ID: ${newProduct.id})`);
            }

        } catch (err) {
            console.error(`Unexpected error processing product ${product.name}:`, err);
        }
    }

    console.log('\nDatabase seeding finished.');
}

// --- Execute Seeding ---
seedDatabase().catch(err => {
    console.error('\nUnhandled error during seeding process:', err);
    process.exit(1);
});
