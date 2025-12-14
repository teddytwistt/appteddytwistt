-- =====================================================
-- SCRIPT CONSOLIDADO - EJECUTAR TODO DE UNA VEZ
-- =====================================================
-- Este script contiene TODA la migración en un solo archivo
-- Solo necesitas copiar y pegar esto en Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PASO 1: CREAR NUEVA ESTRUCTURA
-- =====================================================

-- TABLA DE PRODUCTOS
CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio_cba DECIMAL(10, 2) NOT NULL,
  precio_interior DECIMAL(10, 2) NOT NULL,
  stock_inicial INTEGER NOT NULL DEFAULT 900,
  stock_actual INTEGER NOT NULL DEFAULT 900,
  activo BOOLEAN DEFAULT TRUE,
  imagen_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO productos (nombre, descripcion, precio_cba, precio_interior, stock_inicial, stock_actual, activo)
VALUES (
  'Buzzy Twist',
  'Edición limitada - Buzzy Twist',
  27000.00,
  32000.00,
  900,
  900,
  true
) ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);

-- TABLA DE CÓDIGOS DE DESCUENTO
CREATE TABLE IF NOT EXISTS codigos_descuento (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  porcentaje_descuento INTEGER NOT NULL CHECK (porcentaje_descuento > 0 AND porcentaje_descuento <= 100),
  activo BOOLEAN DEFAULT TRUE,
  usos_maximos INTEGER,
  veces_usado INTEGER DEFAULT 0,
  valido_desde TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valido_hasta TIMESTAMP WITH TIME ZONE,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO codigos_descuento (codigo, porcentaje_descuento, activo, usos_maximos, descripcion)
VALUES
  ('BUZZY10', 10, true, 100, 'Descuento del 10% para primeros compradores'),
  ('BUZZY20', 20, true, 50, 'Descuento especial del 20%'),
  ('TEDDYTWIST15', 15, true, 75, 'Descuento exclusivo del 15%')
ON CONFLICT (codigo) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_codigos_descuento_codigo ON codigos_descuento(codigo);
CREATE INDEX IF NOT EXISTS idx_codigos_descuento_activo ON codigos_descuento(activo);

-- TABLA DE NÚMEROS DE SERIE
CREATE TABLE IF NOT EXISTS numeros_serie (
  id SERIAL PRIMARY KEY,
  numero_serie INTEGER UNIQUE NOT NULL,
  id_pedido UUID,
  estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'reservado', 'asignado')),
  reservado_en TIMESTAMP WITH TIME ZONE,
  asignado_en TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO numeros_serie (numero_serie, estado)
SELECT
  generate_series(1, 900),
  'disponible'
ON CONFLICT (numero_serie) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_numeros_serie_estado ON numeros_serie(estado);
CREATE INDEX IF NOT EXISTS idx_numeros_serie_pedido ON numeros_serie(id_pedido);

-- TABLA DE PEDIDOS
CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  id_interno UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  id_producto INTEGER NOT NULL,
  id_codigo_descuento INTEGER,
  numero_serie INTEGER,
  preference_id TEXT,
  payment_id TEXT,
  zona VARCHAR(20) NOT NULL CHECK (zona IN ('cba', 'interior')),
  monto_original DECIMAL(10, 2) NOT NULL,
  porcentaje_descuento INTEGER DEFAULT 0,
  monto_descuento DECIMAL(10, 2) DEFAULT 0,
  monto_final DECIMAL(10, 2) NOT NULL,
  estado_pago VARCHAR(20) NOT NULL DEFAULT 'pendiente'
    CHECK (estado_pago IN ('pendiente', 'pagado', 'fallido', 'reembolsado')),
  estado_envio VARCHAR(20) DEFAULT 'pendiente'
    CHECK (estado_envio IN ('pendiente', 'enviado', 'entregado')),
  status_detail TEXT,
  nombre_apellido VARCHAR(255),
  email VARCHAR(255),
  telefono VARCHAR(50),
  dni VARCHAR(20),
  provincia VARCHAR(100),
  ciudad VARCHAR(100),
  direccion_completa TEXT,
  comentarios TEXT,
  comprobante_url TEXT,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_pago TIMESTAMP WITH TIME ZONE,
  fecha_envio TIMESTAMP WITH TIME ZONE,
  fecha_entrega TIMESTAMP WITH TIME ZONE,
  mp_response JSONB,
  form_completado BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_pedido_producto FOREIGN KEY (id_producto)
    REFERENCES productos(id) ON DELETE RESTRICT,
  CONSTRAINT fk_pedido_descuento FOREIGN KEY (id_codigo_descuento)
    REFERENCES codigos_descuento(id) ON DELETE SET NULL,
  CONSTRAINT fk_pedido_numero_serie FOREIGN KEY (numero_serie)
    REFERENCES numeros_serie(numero_serie) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pedidos_id_interno ON pedidos(id_interno);
CREATE INDEX IF NOT EXISTS idx_pedidos_preference_id ON pedidos(preference_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_payment_id ON pedidos(payment_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado_pago ON pedidos(estado_pago);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado_envio ON pedidos(estado_envio);
CREATE INDEX IF NOT EXISTS idx_pedidos_producto ON pedidos(id_producto);
CREATE INDEX IF NOT EXISTS idx_pedidos_descuento ON pedidos(id_codigo_descuento);
CREATE INDEX IF NOT EXISTS idx_pedidos_email ON pedidos(email);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha_creacion ON pedidos(fecha_creacion);

-- VISTAS
CREATE OR REPLACE VIEW vista_stock_productos AS
SELECT
  p.id,
  p.nombre,
  p.stock_inicial,
  COALESCE(COUNT(pe.id) FILTER (WHERE pe.estado_pago = 'pagado'), 0) as vendidos,
  p.stock_inicial - COALESCE(COUNT(pe.id) FILTER (WHERE pe.estado_pago = 'pagado'), 0) as disponibles,
  p.activo
FROM productos p
LEFT JOIN pedidos pe ON pe.id_producto = p.id
GROUP BY p.id, p.nombre, p.stock_inicial, p.activo;

CREATE OR REPLACE VIEW vista_uso_descuentos AS
SELECT
  cd.id,
  cd.codigo,
  cd.porcentaje_descuento,
  cd.activo,
  cd.usos_maximos,
  cd.veces_usado,
  COALESCE(COUNT(p.id) FILTER (WHERE p.estado_pago = 'pagado'), 0) as usos_confirmados,
  CASE
    WHEN cd.usos_maximos IS NOT NULL THEN cd.usos_maximos - cd.veces_usado
    ELSE NULL
  END as usos_restantes,
  cd.valido_desde,
  cd.valido_hasta,
  CASE
    WHEN cd.activo = false THEN 'Inactivo'
    WHEN cd.valido_hasta IS NOT NULL AND cd.valido_hasta < NOW() THEN 'Vencido'
    WHEN cd.usos_maximos IS NOT NULL AND cd.veces_usado >= cd.usos_maximos THEN 'Agotado'
    ELSE 'Disponible'
  END as estado
FROM codigos_descuento cd
LEFT JOIN pedidos p ON p.id_codigo_descuento = cd.id
GROUP BY cd.id, cd.codigo, cd.porcentaje_descuento, cd.activo,
         cd.usos_maximos, cd.veces_usado, cd.valido_desde, cd.valido_hasta;

-- FUNCIONES
CREATE OR REPLACE FUNCTION obtener_siguiente_numero_serie()
RETURNS INTEGER AS $$
DECLARE
  v_numero_serie INTEGER;
BEGIN
  SELECT numero_serie INTO v_numero_serie
  FROM numeros_serie
  WHERE estado = 'disponible'
  ORDER BY numero_serie
  LIMIT 1;

  RETURN v_numero_serie;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION asignar_numero_serie(p_id_pedido UUID)
RETURNS INTEGER AS $$
DECLARE
  v_numero_serie INTEGER;
BEGIN
  UPDATE numeros_serie
  SET
    id_pedido = p_id_pedido,
    estado = 'reservado',
    reservado_en = NOW()
  WHERE numero_serie = (
    SELECT numero_serie
    FROM numeros_serie
    WHERE estado = 'disponible'
    ORDER BY numero_serie
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  RETURNING numero_serie INTO v_numero_serie;

  IF v_numero_serie IS NOT NULL THEN
    UPDATE pedidos
    SET numero_serie = v_numero_serie
    WHERE id_interno = p_id_pedido;
  END IF;

  RETURN v_numero_serie;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION confirmar_numero_serie(p_numero_serie INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE numeros_serie
  SET
    estado = 'asignado',
    asignado_en = NOW()
  WHERE numero_serie = p_numero_serie;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validar_codigo_descuento(p_codigo VARCHAR(50))
RETURNS TABLE (
  valido BOOLEAN,
  id_descuento INTEGER,
  porcentaje INTEGER,
  mensaje TEXT
) AS $$
DECLARE
  v_descuento RECORD;
BEGIN
  SELECT * INTO v_descuento
  FROM codigos_descuento
  WHERE codigo = p_codigo;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::INTEGER, NULL::INTEGER, 'Código de descuento no válido'::TEXT;
    RETURN;
  END IF;

  IF v_descuento.activo = false THEN
    RETURN QUERY SELECT false, NULL::INTEGER, NULL::INTEGER, 'Código de descuento inactivo'::TEXT;
    RETURN;
  END IF;

  IF v_descuento.valido_hasta IS NOT NULL AND v_descuento.valido_hasta < NOW() THEN
    RETURN QUERY SELECT false, NULL::INTEGER, NULL::INTEGER, 'Código de descuento vencido'::TEXT;
    RETURN;
  END IF;

  IF v_descuento.valido_desde IS NOT NULL AND v_descuento.valido_desde > NOW() THEN
    RETURN QUERY SELECT false, NULL::INTEGER, NULL::INTEGER, 'Código de descuento aún no válido'::TEXT;
    RETURN;
  END IF;

  IF v_descuento.usos_maximos IS NOT NULL AND v_descuento.veces_usado >= v_descuento.usos_maximos THEN
    RETURN QUERY SELECT false, NULL::INTEGER, NULL::INTEGER, 'Código de descuento agotado'::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT
    true,
    v_descuento.id,
    v_descuento.porcentaje_descuento,
    'Código de descuento válido'::TEXT;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION actualizar_stock_producto()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado_pago = 'pagado' AND (OLD.estado_pago IS NULL OR OLD.estado_pago != 'pagado') THEN
    UPDATE productos
    SET stock_actual = stock_actual - 1
    WHERE id = NEW.id_producto AND stock_actual > 0;

    IF NEW.numero_serie IS NOT NULL THEN
      PERFORM confirmar_numero_serie(NEW.numero_serie);
    END IF;
  END IF;

  IF NEW.estado_pago = 'reembolsado' AND OLD.estado_pago = 'pagado' THEN
    UPDATE productos
    SET stock_actual = stock_actual + 1
    WHERE id = NEW.id_producto;

    IF NEW.numero_serie IS NOT NULL THEN
      UPDATE numeros_serie
      SET
        estado = 'disponible',
        id_pedido = NULL,
        reservado_en = NULL,
        asignado_en = NULL
      WHERE numero_serie = NEW.numero_serie;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION incrementar_uso_descuento()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado_pago = 'pagado' AND
     (OLD.estado_pago IS NULL OR OLD.estado_pago != 'pagado') AND
     NEW.id_codigo_descuento IS NOT NULL THEN
    UPDATE codigos_descuento
    SET
      veces_usado = veces_usado + 1,
      updated_at = NOW()
    WHERE id = NEW.id_codigo_descuento;
  END IF;

  IF NEW.estado_pago = 'reembolsado' AND
     OLD.estado_pago = 'pagado' AND
     NEW.id_codigo_descuento IS NOT NULL THEN
    UPDATE codigos_descuento
    SET
      veces_usado = GREATEST(0, veces_usado - 1),
      updated_at = NOW()
    WHERE id = NEW.id_codigo_descuento;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS
DROP TRIGGER IF EXISTS trigger_actualizar_stock ON pedidos;
CREATE TRIGGER trigger_actualizar_stock
  AFTER INSERT OR UPDATE OF estado_pago ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_stock_producto();

DROP TRIGGER IF EXISTS trigger_incrementar_uso_descuento ON pedidos;
CREATE TRIGGER trigger_incrementar_uso_descuento
  AFTER INSERT OR UPDATE OF estado_pago ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION incrementar_uso_descuento();

DROP TRIGGER IF EXISTS trigger_productos_updated_at ON productos;
CREATE TRIGGER trigger_productos_updated_at
  BEFORE UPDATE ON productos
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();

DROP TRIGGER IF EXISTS trigger_descuentos_updated_at ON codigos_descuento;
CREATE TRIGGER trigger_descuentos_updated_at
  BEFORE UPDATE ON codigos_descuento
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();

-- =====================================================
-- PASO 2: MIGRAR DATOS EXISTENTES (SI HAY)
-- =====================================================

-- Migrar códigos de descuento
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'discount_codes') THEN
    INSERT INTO codigos_descuento (
      codigo, porcentaje_descuento, activo, usos_maximos, veces_usado,
      valido_desde, valido_hasta, created_at
    )
    SELECT
      code, discount_percentage, active, max_uses, times_used,
      valid_from, valid_until, created_at
    FROM discount_codes
    ON CONFLICT (codigo) DO UPDATE SET
      porcentaje_descuento = EXCLUDED.porcentaje_descuento,
      activo = EXCLUDED.activo,
      usos_maximos = EXCLUDED.usos_maximos,
      veces_usado = EXCLUDED.veces_usado;
  END IF;
END $$;

-- Migrar pedidos
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') THEN
    INSERT INTO pedidos (
      id_interno, id_producto, id_codigo_descuento, preference_id, payment_id,
      zona, monto_original, porcentaje_descuento, monto_descuento, monto_final,
      estado_pago, estado_envio, status_detail, nombre_apellido, email, telefono,
      dni, provincia, ciudad, direccion_completa, comentarios, comprobante_url,
      fecha_creacion, fecha_pago, mp_response, form_completado
    )
    SELECT
      o.id_interno,
      1,
      cd.id,
      o.preference_id,
      o.payment_id,
      o.zona,
      CASE
        WHEN o.discount_percentage IS NOT NULL AND o.discount_percentage > 0
          THEN ROUND(o.monto / (1 - o.discount_percentage::DECIMAL / 100), 2)
        ELSE o.monto
      END,
      COALESCE(o.discount_percentage, 0),
      CASE
        WHEN o.discount_percentage IS NOT NULL AND o.discount_percentage > 0
          THEN ROUND(o.monto / (1 - o.discount_percentage::DECIMAL / 100), 2) - o.monto
        ELSE 0
      END,
      o.monto,
      o.estado_pago,
      LOWER(COALESCE(o.estado_envio, 'pendiente')),
      o.status_detail,
      o.nombre_apellido,
      o.email,
      o.telefono,
      o.dni,
      o.provincia,
      o.ciudad,
      o.direccion_completa,
      o.comentarios,
      o.comprobante_url,
      o.fecha_creacion,
      o.fecha_pago,
      o.mp_response,
      o.form_completed
    FROM orders o
    LEFT JOIN codigos_descuento cd ON cd.codigo = o.discount_code
    ON CONFLICT (id_interno) DO NOTHING;
  END IF;
END $$;

-- Migrar números de serie si existen
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'serial_numbers') THEN
    INSERT INTO numeros_serie (numero_serie, id_pedido, estado, reservado_en)
    SELECT
      serial_number,
      order_id,
      CASE
        WHEN status = 'available' THEN 'disponible'
        WHEN status = 'reserved' THEN 'reservado'
        ELSE 'asignado'
      END,
      reserved_at
    FROM serial_numbers
    ON CONFLICT (numero_serie) DO UPDATE SET
      id_pedido = EXCLUDED.id_pedido,
      estado = EXCLUDED.estado;

    UPDATE pedidos p
    SET numero_serie = ns.numero_serie
    FROM numeros_serie ns
    WHERE ns.id_pedido = p.id_interno AND p.numero_serie IS NULL;
  END IF;
END $$;

-- Actualizar stock actual del producto
UPDATE productos
SET stock_actual = stock_inicial - (
  SELECT COUNT(*)
  FROM pedidos
  WHERE estado_pago = 'pagado' AND id_producto = productos.id
)
WHERE id = 1;

-- =====================================================
-- PASO 3: RENOMBRAR TABLAS ANTIGUAS COMO BACKUP
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') THEN
    ALTER TABLE orders RENAME TO orders_backup;
    RAISE NOTICE 'Tabla orders renombrada a orders_backup';
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'discount_codes') THEN
    ALTER TABLE discount_codes RENAME TO discount_codes_backup;
    RAISE NOTICE 'Tabla discount_codes renombrada a discount_codes_backup';
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'serial_numbers') THEN
    ALTER TABLE serial_numbers RENAME TO serial_numbers_backup;
    RAISE NOTICE 'Tabla serial_numbers renombrada a serial_numbers_backup';
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'stock_config') THEN
    ALTER TABLE stock_config RENAME TO stock_config_backup;
    RAISE NOTICE 'Tabla stock_config renombrada a stock_config_backup';
  END IF;

  IF EXISTS (SELECT FROM information_schema.views WHERE table_name = 'stock_status') THEN
    DROP VIEW IF EXISTS stock_status;
    RAISE NOTICE 'Vista stock_status eliminada';
  END IF;

  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'MIGRACIÓN COMPLETADA EXITOSAMENTE';
  RAISE NOTICE '=====================================================';
END $$;

-- Verificar resultados
SELECT 'Productos' as tabla, COUNT(*) as registros FROM productos
UNION ALL
SELECT 'Códigos de descuento', COUNT(*) FROM codigos_descuento
UNION ALL
SELECT 'Pedidos', COUNT(*) FROM pedidos
UNION ALL
SELECT 'Números de serie disponibles', COUNT(*) FROM numeros_serie WHERE estado = 'disponible';

SELECT '✅ MIGRACIÓN COMPLETADA - Revisa los resultados arriba' as estado;
