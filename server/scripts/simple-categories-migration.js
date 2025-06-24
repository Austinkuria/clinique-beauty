import { supabase } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runSQLDirectly() {
  console.log('Starting categories column migration...');
  
  try {
    // Check if product_categories exists
    const { data: columnsInfo, error: columnsError } = await supabase
      .from('sellers')
      .select('product_categories')
      .limit(1);
    
    if (columnsError) {
      console.log('Error checking product_categories column:', columnsError.message);
    } else {
      console.log('product_categories column exists');
    }
    
    // Check if categories exists
    const { data: categoriesInfo, error: categoriesError } = await supabase
      .from('sellers')
      .select('categories')
      .limit(1);
    
    if (categoriesError && categoriesError.message.includes('column')) {
      console.log('categories column does not exist, will create it');
      
      // Add categories column
      const { error: addColumnError } = await supabase.rpc(
        'execute_sql',
        { sql_query: 'ALTER TABLE sellers ADD COLUMN IF NOT EXISTS categories JSONB;' }
      );
      
      if (addColumnError) {
        console.log('Error creating categories column:', addColumnError.message);
        
        // Alternative approach using raw REST API if RPC fails
        console.log('Trying alternative approach...');
        const response = await fetch(`${supabase.supabaseUrl}/rest/v1/rpc/execute_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`
          },
          body: JSON.stringify({
            sql_query: 'ALTER TABLE sellers ADD COLUMN IF NOT EXISTS categories JSONB;'
          })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to execute SQL: ${await response.text()}`);
        }
        
        console.log('Categories column added successfully');
      } else {
        console.log('Categories column added');
      }
      
      // Update data to copy from product_categories to categories
      if (!categoriesError && !columnsError) {
        const { error: updateError } = await supabase.rpc(
          'execute_sql',
          { sql_query: 'UPDATE sellers SET categories = product_categories WHERE categories IS NULL AND product_categories IS NOT NULL;' }
        );
        
        if (updateError) {
          console.log('Error copying data to categories column:', updateError.message);
        } else {
          console.log('Data copied from product_categories to categories');
        }
      }
    } else {
      console.log('categories column already exists');
    }
    
    console.log('Migration completed. Please run the SQL file directly in the Supabase SQL Editor if this script did not work.');
    
  } catch (error) {
    console.error('Migration failed:', error.message);
    console.log('Please run the add_categories_column.sql file directly in the Supabase SQL Editor.');
  }
}

// Run the migration
runSQLDirectly();
