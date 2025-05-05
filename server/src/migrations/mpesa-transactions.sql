-- Table for tracking M-Pesa transactions
CREATE TABLE mpesa_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id),
  order_id UUID,
  checkout_request_id VARCHAR(255) NOT NULL,
  merchant_request_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'PENDING', 'COMPLETED', 'FAILED'
  transaction_type VARCHAR(50) NOT NULL,
  mpesa_receipt VARCHAR(50),
  transaction_date VARCHAR(50),
  result_code VARCHAR(10),
  result_desc TEXT,
  request_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE,
  
  -- Add index on checkout_request_id for faster lookups
  CONSTRAINT mpesa_transactions_checkout_request_id_idx UNIQUE (checkout_request_id)
);

-- Update orders table to include payment details
ALTER TABLE orders ADD COLUMN payment_provider VARCHAR(50);
ALTER TABLE orders ADD COLUMN payment_reference VARCHAR(100);
ALTER TABLE orders ADD COLUMN payment_status VARCHAR(20) DEFAULT 'PENDING';
ALTER TABLE orders ADD COLUMN payment_date TIMESTAMP WITH TIME ZONE;
