import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Use service key for full access
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Upload a single image to Supabase storage
 * @param {string} filePath - Local path to the image file
 * @param {string} productId - UUID of the product
 * @param {string} filename - Name to use for the file in storage
 * @returns {Promise<string>} - The URL of the uploaded image
 */
async function uploadImage(filePath, productId, filename) {
    try {
        // Read the file
        const fileBuffer = fs.readFileSync(filePath);
        
        // Create the storage path
        const storagePath = `${productId}/${filename}`;
        
        // Upload to Supabase
        const { data, error } = await supabase.storage
            .from('product-images')
            .upload(storagePath, fileBuffer, {
                contentType: 'image/webp', // Adjust based on your file type
                upsert: true // Overwrite if file exists
            });
            
        if (error) {
            console.error('Error uploading image:', error);
            return null;
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(storagePath);
            
        console.log(`Uploaded image: ${storagePath}`);
        return urlData.publicUrl;
    } catch (error) {
        console.error('Error in uploadImage:', error);
        return null;
    }
}

/**
 * Upload multiple images for a product and update the database
 * @param {string} productId - UUID of the product
 * @param {Array<string>} imagePaths - Array of local paths to image files
 */
async function uploadProductImages(productId, imagePaths) {
    // Validate input
    if (!productId || !Array.isArray(imagePaths) || imagePaths.length === 0) {
        console.error('Invalid input for uploadProductImages');
        return;
    }
    
    try {
        // Upload main image first
        const mainImagePath = imagePaths[0];
        const mainImageFilename = path.basename(mainImagePath);
        const mainImageUrl = await uploadImage(mainImagePath, productId, `main_${mainImageFilename}`);
        
        if (!mainImageUrl) {
            throw new Error('Failed to upload main image');
        }
        
        // Upload additional images
        const additionalImageUrls = [];
        for (let i = 1; i < imagePaths.length; i++) {
            const imagePath = imagePaths[i];
            const filename = path.basename(imagePath);
            const imageUrl = await uploadImage(imagePath, productId, `additional_${i}_${filename}`);
            if (imageUrl) {
                additionalImageUrls.push(imageUrl);
            }
        }
        
        // Update product in database with image URLs
        const { error } = await supabase
            .from('products')
            .update({
                image: mainImageUrl,
                images: additionalImageUrls,
                updated_at: new Date()
            })
            .eq('id', productId);
            
        if (error) {
            console.error('Error updating product with image URLs:', error);
            return;
        }
        
        console.log(`Successfully updated product ${productId} with ${1 + additionalImageUrls.length} images`);
    } catch (error) {
        console.error('Error in uploadProductImages:', error);
    }
}

// Example usage (uncomment to use)
// const productId = '00000000-0000-0000-0000-000000000000'; // Replace with actual product ID
// const imagePaths = [
//     path.join(__dirname, '../uploads/main.webp'),
//     path.join(__dirname, '../uploads/angle.webp'),
//     path.join(__dirname, '../uploads/detail.webp')
// ];
// uploadProductImages(productId, imagePaths);

export { uploadImage, uploadProductImages };
