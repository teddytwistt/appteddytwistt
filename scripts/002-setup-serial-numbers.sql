-- Create or update serial_numbers table to track which serial numbers are assigned
-- The table already exists, so we just need to ensure it has data

-- Ensure all serial numbers 1-900 exist
INSERT INTO serial_numbers (serial_number, status, created_at)
SELECT 
  generate_series(001, 900),
  'available',
  NOW()
ON CONFLICT (serial_number) DO NOTHING;

-- Function to get the next available serial number
CREATE OR REPLACE FUNCTION get_next_serial_number()
RETURNS TABLE (next_serial INT, total_stock INT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(MIN(serial_number), 001) as next_serial,
    900 as total_stock
  FROM serial_numbers
  WHERE status = 'available' OR status IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to assign a serial number to an order
CREATE OR REPLACE FUNCTION assign_serial_number(p_order_id UUID)
RETURNS INT AS $$
DECLARE
  v_serial_number INT;
BEGIN
  -- Get the next available serial number and mark it as reserved
  UPDATE serial_numbers
  SET 
    order_id = p_order_id,
    reserved_at = NOW(),
    status = 'reserved'
  WHERE serial_number = (
    SELECT MIN(serial_number)
    FROM serial_numbers
    WHERE status = 'available' OR status IS NULL
  )
  RETURNING serial_number INTO v_serial_number;
  
  RETURN v_serial_number;
END;
$$ LANGUAGE plpgsql;
