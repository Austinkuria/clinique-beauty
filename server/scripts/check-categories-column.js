import { supabase } from '../config/db.js';

async function addCategoriesIfMissing() {
  console.log('Checking for categories column in sellers table...');
  
  try {
    // First check if the sellers table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'sellers')
      .eq('table_schema', 'public')
      .single();
    
    if (tableError) {
      console.log('Error checking if sellers table exists:', tableError.message);
      return false;
    }
    
    // Try to fetch a record with categories to see if the column exists
    const { data: record, error } = await supabase
      .from('sellers')
      .select('id, categories')
      .limit(1)
      .single();
      
    if (!error) {
      console.log('Categories column already exists');
      return true;
    }
    
    if (!error.message.includes('categories')) {
      console.log('Error occurred but not related to missing column:', error.message);
      return false;
    }
    
    console.log('Categories column is missing, fetching a sample seller record');
    
    // Fetch a seller record to update
    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .select('id, product_categories')
      .limit(1)
      .single();
    
    if (sellerError) {
      console.log('Error fetching seller:', sellerError.message);
      return false;
    }
    
    // Alert the user about the needed change
    console.log('\n================================================');
    console.log('MANUAL ACTION REQUIRED:');
    console.log('Please run the following SQL in the Supabase SQL Editor:');
    console.log('\nALTER TABLE sellers ADD COLUMN IF NOT EXISTS categories JSONB;');
    console.log('UPDATE sellers SET categories = product_categories WHERE product_categories IS NOT NULL;');
    console.log('CREATE INDEX IF NOT EXISTS idx_sellers_categories ON sellers USING GIN(categories);');
    console.log('================================================\n');
    
    return false;
  } catch (error) {
    console.error('Error in addCategoriesIfMissing:', error.message);
    return false;
  }
}

// Run the check
addCategoriesIfMissing().then(result => {
  if (result) {
    console.log('Categories column check completed successfully');
  } else {
    console.log('Please run the migration SQL manually in the Supabase SQL Editor');
  }
});
