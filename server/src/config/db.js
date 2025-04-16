import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
// Use the Service Role Key on the server for elevated privileges
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("FATAL ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables.");
    process.exit(1);
}

// Initialize Supabase client with Service Role Key
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        // Optional: configure autoRefreshToken, persistSession if needed,
        // but typically not required for service role usage.
        autoRefreshToken: false,
        persistSession: false
    }
});

const connectDB = async () => {
    try {
        // Test the connection using a simple query
        const { error } = await supabase.from('users').select('id', { count: 'exact', head: true }); // Use a table you know exists
        if (error) throw error;
        console.log('Supabase PostgreSQL connected using Service Role Key');
        return supabase;
    } catch (error) {
        console.error('Supabase connection error:', error.message);
        process.exit(1);
    }
};

export { supabase, connectDB as default };
