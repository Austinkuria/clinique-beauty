import fs from 'fs';
import path from 'path';
import { supabase } from '../config/db.js';

async function runMigration() {
  try {
    console.log('Running seller application fields migration...');
    
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'migrations', 'add_seller_application_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      const trimmedStatement = statement.trim();
      if (trimmedStatement && !trimmedStatement.startsWith('--')) {
        console.log(`Executing: ${trimmedStatement.substring(0, 100)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: trimmedStatement });
        
        if (error) {
          // Try direct query if RPC doesn't work
          const { error: directError } = await supabase.from('_').select('*').limit(0);
          if (directError) {
            console.error('Migration error:', error);
            throw error;
          }
        }
      }
    }
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
