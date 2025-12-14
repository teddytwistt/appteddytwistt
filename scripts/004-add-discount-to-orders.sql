-- Add discount columns to orders table if they don't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS discount_code TEXT,
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER,
ADD COLUMN IF NOT EXISTS original_amount INTEGER;

-- Add index for discount code queries
CREATE INDEX IF NOT EXISTS idx_orders_discount_code ON orders(discount_code);

-- Update discount codes usage when order is paid
CREATE OR REPLACE FUNCTION increment_discount_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increment when payment status changes to 'aprobado'
  IF NEW.estado_pago = 'aprobado' AND OLD.estado_pago != 'aprobado' AND NEW.discount_code IS NOT NULL THEN
    UPDATE discount_codes
    SET times_used = times_used + 1
    WHERE code = NEW.discount_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-increment discount usage
DROP TRIGGER IF EXISTS trigger_increment_discount_usage ON orders;
CREATE TRIGGER trigger_increment_discount_usage
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION increment_discount_usage();
