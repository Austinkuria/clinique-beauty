import { supabase } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const migration = async () => {
  console.log('Starting categories column migration...');
  
  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../migrations/add_categories_column.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSql });
    
    if (error) {
      throw error;
    }
    
    console.log('Migration executed successfully.');
    
    // Check if we can query the sellers table with categories
    const { data: testData, error: testError } = await supabase
      .from('sellers')
      .select('id, categories, product_categories')
      .limit(1);
    
    if (testError) {
      console.log('Error testing the migration:', testError.message);
    } else {
      console.log('Test query successful.');
      console.log('Sample data:', testData);
    }
    
    // Copy data from product_categories to categories if needed
    const { data: updateResult, error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE sellers 
        SET categories = product_categories 
        WHERE categories IS NULL AND product_categories IS NOT NULL;
      `
    });
    
    if (updateError) {
      console.log('Error updating data:', updateError.message);
    } else {
      console.log('Updated categories column with existing product_categories data.');
    }
    
    // Add comment to the table column for documentation
    await supabase.rpc('exec_sql', {
      sql: `COMMENT ON COLUMN IF EXISTS sellers.categories IS 'JSON array of product categories this seller is interested in';`
    });
    
    console.log('Migration completed successfully.');
    
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
};

// Run the migration
migration();
