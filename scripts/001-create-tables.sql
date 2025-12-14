-- Create stock configuration table
CREATE TABLE IF NOT EXISTS stock_config (
  id SERIAL PRIMARY KEY,
  stock_inicial INT NOT NULL DEFAULT 900,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial stock
INSERT INTO stock_config (stock_inicial) VALUES (900);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  id_interno UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  preference_id TEXT,
  payment_id TEXT,
  zona TEXT NOT NULL CHECK (zona IN ('cba', 'interior')),
  monto DECIMAL(10, 2) NOT NULL,
  estado_pago TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'pagado', 'fallido', 'reembolsado')),
  status_detail TEXT,
  
  -- Datos del comprador
  nombre_apellido TEXT,
  email TEXT,
  telefono TEXT,
  dni TEXT,
  provincia TEXT,
  ciudad TEXT,
  direccion_completa TEXT,
  comentarios TEXT,
  comprobante_url TEXT,
  
  -- Control de envío
  estado_envio TEXT DEFAULT 'Pendiente' CHECK (estado_envio IN ('Pendiente', 'Enviado', 'Entregado')),
  
  -- Timestamps
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_pago TIMESTAMP WITH TIME ZONE,
  fecha_envio_completado TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  mp_response JSONB,
  form_completed BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_preference_id ON orders(preference_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_estado_pago ON orders(estado_pago);
CREATE INDEX IF NOT EXISTS idx_orders_id_interno ON orders(id_interno);

-- Fixed the view to handle NULL cases and correct logic
-- Create a view for sold units count
CREATE OR REPLACE VIEW stock_status AS
SELECT 
  COALESCE((SELECT stock_inicial FROM stock_config LIMIT 1), 900) as stock_inicial,
  COALESCE(COUNT(*) FILTER (WHERE estado_pago = 'pagado'), 0) as vendidos,
  COALESCE((SELECT stock_inicial FROM stock_config LIMIT 1), 900) - COALESCE(COUNT(*) FILTER (WHERE estado_pago = 'pagado'), 0) as disponibles
FROM orders;
