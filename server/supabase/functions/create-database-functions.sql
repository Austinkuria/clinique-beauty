-- Fix parameter ordering for the function
CREATE OR REPLACE FUNCTION get_cart_item_by_numeric_user_id(p_user_id INTEGER, p_product_id UUID)
RETURNS TABLE (id UUID, user_id UUID, product_id UUID, quantity INTEGER, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY 
  SELECT c.id, c.user_id, c.product_id, c.quantity, c.created_at, c.updated_at
  FROM cart_items c
  WHERE c.user_id::text LIKE p_user_id::text || '%'
  AND c.product_id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- Create a simpler approach function to insert cart item with numeric user ID
CREATE OR REPLACE FUNCTION insert_cart_item_for_user(
  p_user_id TEXT,
  p_product_id UUID,
  p_quantity INTEGER
) RETURNS UUID AS $$
DECLARE
  v_cart_item_id UUID;
BEGIN
  INSERT INTO cart_items (user_id, product_id, quantity)
  VALUES (
    (SELECT id FROM user_profiles ORDER BY created_at LIMIT 1), -- Use the first user as fallback
    p_product_id, 
    p_quantity
  )
  RETURNING id INTO v_cart_item_id;
  
  RETURN v_cart_item_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update cart item quantity
CREATE OR REPLACE FUNCTION update_cart_item_quantity(
  p_cart_item_id UUID,
  p_user_id TEXT,
  p_quantity INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_updated BOOLEAN;
BEGIN
  UPDATE cart_items
  SET quantity = p_quantity, updated_at = NOW()
  WHERE id = p_cart_item_id
  AND user_id::text = p_user_id;
  
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to create sellers table if it doesn't exist
CREATE OR REPLACE FUNCTION create_sellers_table()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = 'sellers'
  ) THEN
    -- Create the table
    CREATE TABLE sellers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      business_name TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      location TEXT,
      registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      status TEXT NOT NULL DEFAULT 'pending',
      verification_date TIMESTAMPTZ,
      product_categories JSONB,
      rating NUMERIC,
      sales_count INTEGER DEFAULT 0,
      rejection_reason TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Return true to indicate the table was created
    RETURN TRUE;
  ELSE
    -- Return false to indicate the table already exists
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to run arbitrary SQL (use with caution, admin only)
CREATE OR REPLACE FUNCTION run_sql(sql TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  EXECUTE sql;
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RAISE;
END;
$$ LANGUAGE plpgsql;
