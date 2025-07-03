-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial categories
INSERT INTO categories (id, name) VALUES 
    (1, 'Skincare'),
    (2, 'Makeup'),
    (3, 'Fragrance'),
    (4, 'Hair'),
    (5, 'Body')
ON CONFLICT (id) DO NOTHING;

-- Insert initial tags
INSERT INTO tags (id, name) VALUES 
    (1, 'New Arrival'),
    (2, 'Best Seller'),
    (3, 'Limited Edition'),
    (4, 'Sale'),
    (5, 'Organic'),
    (6, 'Vegan')
ON CONFLICT (id) DO NOTHING;

-- Reset sequences to continue from the highest ID
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('tags_id_seq', (SELECT MAX(id) FROM tags));