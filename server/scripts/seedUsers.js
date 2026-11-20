import { supabase } from '../config/db.js';

const mockUsersToSeed = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'customer',
    password: 'mock_password_hash_1'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'customer',
    password: 'mock_password_hash_2'
  },
  {
    name: 'Robert Johnson',
    email: 'robert@example.com',
    role: 'seller',
    password: 'mock_password_hash_3'
  },
  {
    name: 'Emily Davis',
    email: 'emily@example.com',
    role: 'customer',
    password: 'mock_password_hash_4'
  },
  {
    name: 'Michael Wilson',
    email: 'michael@example.com',
    role: 'admin',
    password: 'mock_password_hash_5'
  },
  {
    name: 'Sarah Brown',
    email: 'sarah@example.com',
    role: 'customer',
    password: 'mock_password_hash_6'
  },
  {
    name: 'David Miller',
    email: 'david@example.com',
    role: 'customer',
    password: 'mock_password_hash_7'
  },
  {
    name: 'Jennifer Lee',
    email: 'jennifer@example.com',
    role: 'seller',
    password: 'mock_password_hash_8'
  }
];

async function seed() {
  console.log('Seeding users into Supabase...');
  for (const user of mockUsersToSeed) {
    const { data: existing, error: findError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', user.email)
      .maybeSingle();

    if (findError) {
      console.error(`Error querying user ${user.email}:`, findError.message);
      continue;
    }

    if (!existing) {
      const { data, error } = await supabase.from('users').insert(user).select();
      if (error) {
        console.error(`Error inserting ${user.email}:`, error.message);
      } else {
        console.log(`Inserted user: ${user.name} (${user.email}) -> ID: ${data?.[0]?.id}`);
      }
    } else {
      console.log(`User already exists: ${user.email} -> ID: ${existing.id}`);
    }
  }

  const { count } = await supabase.from('users').select('*', { count: 'exact', head: true });
  console.log(`Total users in DB now: ${count}`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed script error:', err);
  process.exit(1);
});
