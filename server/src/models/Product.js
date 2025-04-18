// PostgreSQL table reference - not used directly with ORM
// This serves as a reference for table structure

const ProductTable = {
    name: 'products',
    columns: {
        id: 'uuid primary key default uuid_generate_v4()',
        name: 'text not null',
        price: 'numeric not null',
        image: 'text not null',
        description: 'text not null',
        category: 'text not null',
        stock: 'integer not null default 0',
        rating: 'numeric default 0',          // Added rating
        benefits: 'jsonb',                     // Added benefits
        ingredients: 'jsonb',                  // Added ingredients
        shades: 'jsonb',                       // Added shades
        notes: 'jsonb',                        // Added notes
        palettetheme: 'text',                  // Changed to lowercase 'palettetheme'
        created_at: 'timestamptz default now()',
        updated_at: 'timestamptz default now()',
    }
};

// Helper for validation before inserting to Supabase
const validateProduct = (product) => {
    const { name, price, image, description, category, stock } = product;

    if (!name || !price || !image || !description || !category) {
        return { valid: false, error: 'All fields are required' };
    }

    return { valid: true };
};

export { ProductTable, validateProduct };
