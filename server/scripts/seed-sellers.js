import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { mockSellers } from '../../client/src/data/mockSellersData.js';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// --- Configuration ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// *** Verbose logging for initialization ***
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

// --- Seeding Logic ---
async function seedSellersData() {
    console.log('Starting sellers database seeding...');

    // Check if sellers table exists directly by trying to query it
    console.log('Checking if sellers table exists...');
    
    try {
        // Try to create the sellers table directly with SQL
        // Note: This requires that your service role has permission to create tables
        const createTableSQL = `
        CREATE TABLE IF NOT EXISTS sellers (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            business_name TEXT NOT NULL,
            contact_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone TEXT,
            location TEXT,
            registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            status TEXT NOT NULL DEFAULT 'pending',
            verification_date TIMESTAMPTZ,
            product_categories JSONB,
            rating NUMERIC,
            sales_count INTEGER DEFAULT 0,
            rejection_reason TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_sellers_status ON sellers(status);
        CREATE INDEX IF NOT EXISTS idx_sellers_email ON sellers(email);
        `;
        
        // Use the SQL query directly with Postgres API if available
        const { error: createError } = await supabase.rpc('pgexec_sql', { sql: createTableSQL });
        
        if (createError) {
            console.log('Unable to create table with pgexec_sql:', createError);
            console.log('Checking if table already exists before proceeding...');
            
            // Check if the table already exists by performing a simple query
            const { error: checkError } = await supabase
                .from('sellers')
                .select('count(*)')
                .limit(1);
                
            if (checkError) {
                if (checkError.code === '42P01') { // Relation does not exist
                    console.error('Sellers table does not exist and cannot be created automatically.');
                    console.error('Please create the sellers table manually using the SQL in database-schema.sql');
                    process.exit(1);
                } else {
                    console.error('Error checking sellers table:', checkError);
                }
            } else {
                console.log('Sellers table exists, continuing with seed.');
            }
        } else {
            console.log('Sellers table created successfully.');
        }
    } catch (error) {
        console.error('Unexpected error checking/creating sellers table:', error);
        console.log('Trying to continue anyway...');
    }

    // Delete existing sellers to avoid duplicates
    console.log('Deleting existing sellers...');
    try {
        const { error: deleteError } = await supabase
            .from('sellers')
            .delete()
            .not('id', 'is', null); // Delete all records

        if (deleteError) {
            console.error('Error deleting existing sellers:', deleteError);
            // If relation doesn't exist, exit
            if (deleteError.code === '42P01') {
                console.error('Sellers table does not exist. Please create it first.');
                process.exit(1);
            }
        } else {
            console.log('Existing sellers deleted.');
        }
    } catch (error) {
        console.error('Unexpected error deleting sellers:', error);
        process.exit(1);
    }

    // Transform seller data to match database schema
    const sellersToInsert = mockSellers.map(seller => ({
        id: seller.id ? seller.id : crypto.randomUUID(), // Use existing ID or generate new UUID
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

    // Split into chunks to avoid potential payload size limitations
    const chunkSize = 10;
    for (let i = 0; i < sellersToInsert.length; i += chunkSize) {
        const chunk = sellersToInsert.slice(i, i + chunkSize);
        console.log(`Processing chunk ${i/chunkSize + 1} of ${Math.ceil(sellersToInsert.length/chunkSize)}`);
        
        try {
            const { data, error: insertError } = await supabase
                .from('sellers')
                .insert(chunk)
                .select('id, business_name');

            if (insertError) {
                console.error(`Error inserting sellers chunk ${i/chunkSize + 1}:`, insertError);
            } else {
                console.log(`Successfully inserted ${data.length} sellers in chunk ${i/chunkSize + 1}.`);
            }
        } catch (error) {
            console.error(`Unexpected error inserting sellers chunk ${i/chunkSize + 1}:`, error);
        }
    }

    console.log('\nSellers database seeding finished.');
}

// --- Execute Seeding ---
seedSellersData().catch(err => {
    console.error('\nUnhandled error during seeding process:', err);
    process.exit(1);
});
