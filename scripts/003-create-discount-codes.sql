-- Create discount codes table
CREATE TABLE IF NOT EXISTS discount_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  active BOOLEAN DEFAULT true,
  max_uses INTEGER,
  times_used INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some example discount codes
INSERT INTO discount_codes (code, discount_percentage, active, max_uses)
VALUES 
  ('BUZZY10', 10, true, 100),
  ('BUZZY20', 20, true, 50),
  ('TEDDYTWIST15', 15, true, 75)
ON CONFLICT (code) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
