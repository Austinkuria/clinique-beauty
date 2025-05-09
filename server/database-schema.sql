-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    image TEXT NOT NULL,
    images TEXT[], -- Add the images array field to store multiple images
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    rating NUMERIC DEFAULT 0,
    benefits JSONB,
    ingredients JSONB,
    shades JSONB,
    notes JSONB,
    paletteTheme TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    total_price NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    shipping_address JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add the cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster cart lookups
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);

-- Create a system_settings table for configuration values
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the admin setup code
INSERT INTO system_settings (key, value, description)
VALUES ('admin_setup_code', '', 'Code used for setting up admin accounts')
ON CONFLICT (key) DO NOTHING;

-- Insert the admin setup code with a default value
INSERT INTO system_settings (key, value, description)
VALUES ('admin_setup_code', 'clinique-beauty-admin-2023', 'Code used for setting up admin accounts')
ON CONFLICT (key) DO UPDATE SET value = 'clinique-beauty-admin-2023';

-- Create a function to sync clerk metadata role to database roles
CREATE OR REPLACE FUNCTION sync_clerk_role_to_database(
    p_clerk_id TEXT,
    p_metadata JSONB
) RETURNS BOOLEAN AS $$
DECLARE
    v_role TEXT;
    v_updated BOOLEAN := FALSE;
BEGIN
    -- Extract the role from the metadata JSON
    v_role := p_metadata->'role';
    
    -- If no role found, check for role in unsafeMetadata path
    IF v_role IS NULL THEN
        v_role := p_metadata->'unsafeMetadata'->'role';
    END IF;
    
    -- If still not found, check privateMetadata
    IF v_role IS NULL THEN
        v_role := p_metadata->'privateMetadata'->'role';
    END IF;
    
    -- If still not found, check publicMetadata
    IF v_role IS NULL THEN
        v_role := p_metadata->'publicMetadata'->'role';
    END IF;
    
    -- If we have a valid role string and it's 'admin', update both tables
    IF v_role IS NOT NULL AND v_role::TEXT = '"admin"' THEN
        -- Use the existing update_user_role function
        v_updated := update_user_role(p_clerk_id, 'admin');
        
        -- Log the update operation
        INSERT INTO system_settings (key, value, description)
        VALUES ('last_admin_sync', NOW()::TEXT, 'Last time admin role was synced from Clerk metadata')
        ON CONFLICT (key) DO UPDATE SET value = NOW()::TEXT, updated_at = NOW();
    END IF;
    
    RETURN v_updated;
END;
$$ LANGUAGE plpgsql;

-- Add a trigger to sync roles on user profile update
CREATE OR REPLACE FUNCTION sync_user_on_update()
RETURNS TRIGGER AS $$
BEGIN
    -- If the user record exists in both tables but roles don't match,
    -- ensure they are synchronized
    IF EXISTS (
        SELECT 1 FROM users u
        JOIN user_profiles up ON u.clerk_id = up.clerk_id
        WHERE up.id = NEW.id AND u.role != NEW.role
    ) THEN
        UPDATE users
        SET role = NEW.role, 
            updated_at = NOW()
        WHERE clerk_id = NEW.clerk_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace existing trigger to use more comprehensive role sync logic
DROP TRIGGER IF EXISTS sync_user_profiles_update ON user_profiles;
CREATE TRIGGER sync_user_profiles_update
AFTER UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION sync_user_on_update();

-- Create function to update user role safely
CREATE OR REPLACE FUNCTION update_user_role(
    p_clerk_id TEXT,
    p_role TEXT DEFAULT 'admin'
) RETURNS BOOLEAN AS $$
DECLARE
    v_updated_count INTEGER := 0;
BEGIN
    -- Update user_profiles table
    UPDATE user_profiles
    SET 
        role = p_role,
        updated_at = NOW()
    WHERE clerk_id = p_clerk_id;
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    
    -- Update users table to keep in sync
    UPDATE users
    SET 
        role = p_role,
        updated_at = NOW()
    WHERE clerk_id = p_clerk_id;
    
    -- Return true if any rows were updated
    RETURN v_updated_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to keep roles in sync between tables
CREATE OR REPLACE FUNCTION sync_user_roles()
RETURNS TRIGGER AS $$
BEGIN
    -- When a role is updated in the users table
    IF TG_TABLE_NAME = 'users' THEN
        -- Update the corresponding record in user_profiles
        UPDATE user_profiles
        SET role = NEW.role, updated_at = NOW()
        WHERE clerk_id = NEW.clerk_id;
    -- When a role is updated in the user_profiles table
    ELSIF TG_TABLE_NAME = 'user_profiles' THEN
        -- Update the corresponding record in users
        UPDATE users
        SET role = NEW.role, updated_at = NOW()
        WHERE clerk_id = NEW.clerk_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers on both tables
DROP TRIGGER IF EXISTS sync_users_role ON users;
CREATE TRIGGER sync_users_role
AFTER UPDATE OF role ON users
FOR EACH ROW
EXECUTE FUNCTION sync_user_roles();

DROP TRIGGER IF EXISTS sync_user_profiles_role ON user_profiles;
CREATE TRIGGER sync_user_profiles_role
AFTER UPDATE OF role ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION sync_user_roles();

-- Add admin settings to system_settings table
INSERT INTO system_settings (key, value, description)
VALUES 
    ('admin_role_default', 'admin', 'Default role name for administrators'),
    ('admin_role_sync_enabled', 'true', 'Whether to automatically sync roles between systems')
ON CONFLICT (key) DO NOTHING;

-- Create user_profiles table to match our code
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
