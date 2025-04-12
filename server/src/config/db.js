import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const connectDB = async () => {
    try {
        // Test the connection
        const { data, error } = await supabase.from('products').select('count');
        if (error) throw error;
        console.log('Supabase PostgreSQL connected');
        return supabase;
    } catch (error) {
        console.error('Supabase connection error:', error);
        process.exit(1);
    }
};

export { supabase, connectDB as default };
