import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure server/.env is loaded even if imported before server.js initializes dotenv
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate credentials
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not found in environment variables');
  console.error('Make sure SUPABASE_URL and SUPABASE_ANON_KEY/SUPABASE_SERVICE_ROLE_KEY are set in .env file');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl || 'https://placeholder-url.supabase.co', supabaseKey || 'placeholder_key', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Function to test database connection
const connectDB = async () => {
  try {
    const { data, error } = await supabase.from('products').select('count').limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('Connected to Supabase successfully');
    return true;
  } catch (error) {
    console.error('Failed to connect to Supabase:', error);
    return false;
  }
};

export default connectDB;
