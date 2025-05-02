// PostgreSQL table reference - not used directly with ORM
// This serves as a reference for table structure

const ProductTable = {
    name: 'products',
    columns: {
        id: 'uuid primary key default uuid_generate_v4()',
        name: 'text not null',
        price: 'numeric not null',
        image: 'text not null',
        images: 'text[]',                      // Added images array field
        description: 'text not null',
        category: 'text not null',
        subcategory: 'text', // Added subcategory
        stock: 'integer not null default 0',
        rating: 'numeric default 0',          // Added rating
        benefits: 'jsonb',                     // Added benefits
        ingredients: 'jsonb',                  // Added ingredients
        shades: 'jsonb',                       // Added shades
        notes: 'jsonb',                        // Added notes
        paletteTheme: 'text',                  // Keep camelCase to match database column
        created_at: 'timestamptz default now()',  // Fixed missing closing quote
        updated_at: 'timestamptz default now()',
    }
};

// Helper for validation before inserting to Supabase
const validateProduct = (product) => {
    // Include subcategory in validation if needed, but basic validation remains the same
    const { name, price, image, description, category, stock } = product;

    if (!name || !price || !image || !description || !category) {
        return { valid: false, error: 'All required fields (name, price, image, description, category) must be provided' };
    }

    return { valid: true };
};

export { ProductTable, validateProduct };
