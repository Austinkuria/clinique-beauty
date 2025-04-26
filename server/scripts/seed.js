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

    // Delete existing products to avoid duplicates (optional)
    console.log('Deleting existing products...');
    const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
        console.error('Error deleting existing products:', deleteError);
        return;
    }
    console.log('Existing products deleted.');

    // --- Upload Placeholder Image ---
    console.log(`\nAttempting to upload placeholder image from: ${localPlaceholderImagePath} to ${placeholderStoragePath}`);
    const placeholderUrl = await uploadImage(localPlaceholderImagePath, placeholderStoragePath);

    if (!placeholderUrl) {
        console.error(`\nFATAL: Could not upload placeholder image (${placeholderImageName}). Seeding cannot proceed reliably without a fallback image.`);
        process.exit(1); // Exit if placeholder fails
    }
    console.log(`Placeholder image uploaded successfully. URL: ${placeholderUrl}`);
    // --- End Placeholder Upload ---

    // Prepare products for insertion, including subcategory
    const productsToInsert = mockProducts.map(product => ({
        // id: product.id, // REMOVE THIS LINE - Let Supabase generate the UUID
        name: product.name,
        price: Math.round(product.price * USD_TO_KES_RATE), // Convert price to KES
        image: product.image, // Keep the mock image path for now
        description: product.description,
        category: product.category, // Main category
        subcategory: product.subcategory, // Subcategory
        stock: product.stock,
        rating: product.rating || 0,
        benefits: product.benefits ? JSON.stringify(product.benefits) : null,
        ingredients: product.ingredients ? JSON.stringify(product.ingredients) : null,
        shades: product.shades ? JSON.stringify(product.shades) : null,
        notes: product.notes ? JSON.stringify(product.notes) : null,
        palettetheme: product.paletteTheme || null,
    }));

    console.log(`Inserting ${productsToInsert.length} products...`);

    // Insert new products
    const { data, error: insertError } = await supabase
        .from('products')
        .insert(productsToInsert)
        .select(); // Select to confirm insertion

    if (insertError) {
        console.error('Error inserting products:', insertError);
    } else {
        console.log(`Successfully inserted ${data.length} products.`);
    }

    console.log('Database seeding finished.');
}

// --- Execute Seeding ---
seedDatabase().catch(err => {
    console.error('\nUnhandled error during seeding process:', err);
    process.exit(1);
});
