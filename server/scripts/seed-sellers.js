import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { mockSellers } from '../../client/src/data/mockSellersData.js';

// Load environment variables from .env file
dotenv.config();

// --- Configuration ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log(`Attempting to initialize Supabase client with:`);
console.log(`  URL: ${supabaseUrl}`);
console.log(`  Service Key Loaded: ${supabaseServiceKey ? 'Yes (starts with ' + supabaseServiceKey.substring(0, 10) + '...)' : 'NO'}`);

// --- Initialization ---
if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the .env file.');
    process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
console.log('Supabase client initialized.');

// Helper function to generate a UUID without external dependencies
function generateUUID() {
    // This is a simple implementation and not for production use
    // In production, you should use the uuid package
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// --- Seeding Logic ---
async function seedSellersData() {
    console.log('Starting sellers database seeding...');

    try {
        // Check if table exists with a simple query
        console.log('Checking if sellers table exists...');
        const { data: checkData, error: checkError } = await supabase
            .from('sellers')
            .select('id')
            .limit(1);

        if (checkError) {
            console.error('Error: Sellers table does not exist or cannot be accessed:', checkError);
            console.log('Please run the SQL from create-sellers-table.sql in the Supabase dashboard SQL editor first.');
            process.exit(1);
        }

        console.log('Sellers table exists. Proceeding with data seeding.');

        // Delete existing data
        console.log('Deleting existing sellers...');
        const { error: deleteError } = await supabase
            .from('sellers')
            .delete()
            .filter('id', 'not.is', null);

        if (deleteError) {
            console.error('Error deleting existing sellers:', deleteError);
            process.exit(1);
        }
        console.log('Existing sellers deleted successfully.');

        // Transform and insert seller data
        const sellersToInsert = mockSellers.map(seller => ({
            id: generateUUID(), // Generate new UUID for each seller
            business_name: seller.businessName,
            contact_name: seller.contactName,
            email: seller.email,
            phone: seller.phone,
            location: seller.location,
            registration_date: seller.registrationDate,
            status: seller.status,
            verification_date: seller.verificationDate || null,
            product_categories: seller.productCategories ? JSON.stringify(seller.productCategories) : null,
            rating: seller.rating,
            sales_count: seller.salesCount || 0,
            rejection_reason: seller.rejectionReason || null
        }));

        console.log(`Inserting ${sellersToInsert.length} sellers into database...`);

        // Insert in batches to avoid potential payload limitations
        const batchSize = 5;
        for (let i = 0; i < sellersToInsert.length; i += batchSize) {
            const batch = sellersToInsert.slice(i, i + batchSize);
            console.log(`Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(sellersToInsert.length/batchSize)}`);
            
            const { data: insertedData, error: insertError } = await supabase
                .from('sellers')
                .insert(batch)
                .select('id, business_name');

            if (insertError) {
                console.error(`Error inserting sellers batch ${Math.floor(i/batchSize) + 1}:`, insertError);
            } else {
                console.log(`Successfully inserted ${insertedData.length} sellers in batch ${Math.floor(i/batchSize) + 1}.`);
                console.log(`First inserted seller in this batch: ${insertedData[0]?.business_name || 'unknown'}`);
            }
        }

        console.log('Sellers database seeding completed successfully.');
    } catch (error) {
        console.error('Unexpected error during seller seeding:', error);
        process.exit(1);
    }
}

// --- Execute Seeding ---
seedSellersData().catch(err => {
    console.error('Unhandled error during seeding process:', err);
    process.exit(1);
});
