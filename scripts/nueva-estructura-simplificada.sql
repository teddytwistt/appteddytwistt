-- =====================================================
-- ESTRUCTURA SIMPLIFICADA DE BASE DE DATOS
-- =====================================================
-- Este script crea la estructura optimizada eliminando:
-- - Vistas innecesarias
-- - Tabla numeros_serie (ahora es un campo en pedidos)
-- - Campo id_interno (usamos el id nativo)
-- - Campos redundantes
-- Y agregando:
-- - Tabla clientes (separada de pedidos)
-- =====================================================

-- PASO 1: ELIMINAR VISTAS Y TABLAS ANTIGUAS
-- =====================================================

DROP VIEW IF EXISTS vista_stock_productos CASCADE;
DROP VIEW IF EXISTS vista_uso_descuentos CASCADE;
DROP TABLE IF EXISTS numeros_serie CASCADE;

-- =====================================================
-- PASO 2: CREAR TABLA DE CLIENTES
-- =====================================================

CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nombre_apellido VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(50) NOT NULL,
  dni VARCHAR(50) NOT NULL,
  provincia VARCHAR(100),
  ciudad VARCHAR(100),
  direccion_completa TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_dni ON clientes(dni);

-- =====================================================
-- PASO 3: ACTUALIZAR TABLA PRODUCTOS (simplificada)
-- =====================================================

-- Eliminar campos innecesarios si existen
ALTER TABLE productos DROP COLUMN IF EXISTS imagen_url;

-- Asegurar que los campos esenciales existan
ALTER TABLE productos
  ALTER COLUMN nombre TYPE VARCHAR(255),
  ALTER COLUMN precio_cba TYPE DECIMAL(10,2),
  ALTER COLUMN precio_interior TYPE DECIMAL(10,2),
  ALTER COLUMN stock_inicial SET DEFAULT 900,
  ALTER COLUMN activo SET DEFAULT true;

-- =====================================================
-- PASO 4: RECREAR TABLA PEDIDOS (simplificada)
-- =====================================================

-- Guardar datos existentes temporalmente
CREATE TEMP TABLE pedidos_backup AS
SELECT * FROM pedidos;

-- Eliminar tabla actual
DROP TABLE IF EXISTS pedidos CASCADE;

-- Crear nueva tabla simplificada
CREATE TABLE pedidos (
  id SERIAL PRIMARY KEY,
  id_producto INTEGER NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
  id_cliente INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
  id_codigo_descuento INTEGER REFERENCES codigos_descuento(id) ON DELETE SET NULL,
  numero_serie INTEGER NOT NULL,

  -- Mercado Pago
  preference_id VARCHAR(255) UNIQUE,
  payment_id VARCHAR(255),

  -- Detalles del pedido
  zona VARCHAR(20) NOT NULL CHECK (zona IN ('cba', 'interior')),
  monto_original DECIMAL(10,2) NOT NULL,
  porcentaje_descuento INTEGER DEFAULT 0,
  monto_descuento DECIMAL(10,2) DEFAULT 0,
  monto_final DECIMAL(10,2) NOT NULL,

  -- Estados
  estado_pago VARCHAR(20) DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'pagado', 'fallido', 'reembolsado')),
  estado_envio VARCHAR(20) DEFAULT 'pendiente' CHECK (estado_envio IN ('pendiente', 'enviado', 'entregado')),

  -- Adicional
  comentarios TEXT,
  mp_response JSONB,

  -- Timestamps
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_pago TIMESTAMP WITH TIME ZONE,
  fecha_envio TIMESTAMP WITH TIME ZONE,
  fecha_entrega TIMESTAMP WITH TIME ZONE
);

-- Índices importantes
CREATE INDEX idx_pedidos_producto ON pedidos(id_producto);
CREATE INDEX idx_pedidos_cliente ON pedidos(id_cliente);
CREATE INDEX idx_pedidos_estado_pago ON pedidos(estado_pago);
CREATE INDEX idx_pedidos_preference_id ON pedidos(preference_id);
CREATE INDEX idx_pedidos_numero_serie ON pedidos(numero_serie);
CREATE INDEX idx_pedidos_fecha_creacion ON pedidos(fecha_creacion);

-- =====================================================
-- PASO 5: ACTUALIZAR TABLA CODIGOS_DESCUENTO
-- =====================================================

ALTER TABLE codigos_descuento
  ALTER COLUMN porcentaje_descuento TYPE INTEGER,
  ALTER COLUMN activo SET DEFAULT true,
  ALTER COLUMN veces_usado SET DEFAULT 0;

-- =====================================================
-- PASO 6: FUNCIONES ÚTILES
-- =====================================================

-- Eliminar funciones antiguas si existen
DROP FUNCTION IF EXISTS asignar_numero_serie(UUID);
DROP FUNCTION IF EXISTS asignar_numero_serie(INTEGER);

-- Función para obtener el stock disponible
CREATE OR REPLACE FUNCTION obtener_stock_disponible(p_id_producto INTEGER)
RETURNS TABLE (
  stock_inicial INTEGER,
  vendidos BIGINT,
  disponibles BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.stock_inicial,
    COALESCE(COUNT(pe.id) FILTER (WHERE pe.estado_pago = 'pagado'), 0) as vendidos,
    p.stock_inicial - COALESCE(COUNT(pe.id) FILTER (WHERE pe.estado_pago = 'pagado'), 0) as disponibles
  FROM productos p
  LEFT JOIN pedidos pe ON pe.id_producto = p.id
  WHERE p.id = p_id_producto
  GROUP BY p.id, p.stock_inicial;
END;
$$ LANGUAGE plpgsql;

-- Función para validar código de descuento
CREATE OR REPLACE FUNCTION validar_codigo_descuento(p_codigo VARCHAR)
RETURNS TABLE (
  valido BOOLEAN,
  id_descuento INTEGER,
  porcentaje INTEGER,
  mensaje TEXT
) AS $$
DECLARE
  v_descuento RECORD;
  v_usos_actuales BIGINT;
BEGIN
  -- Buscar el código
  SELECT * INTO v_descuento
  FROM codigos_descuento
  WHERE codigo = UPPER(p_codigo);

  -- Código no existe
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::INTEGER, NULL::INTEGER, 'Código no válido'::TEXT;
    RETURN;
  END IF;

  -- Verificar si está activo
  IF NOT v_descuento.activo THEN
    RETURN QUERY SELECT false, NULL::INTEGER, NULL::INTEGER, 'Código inactivo'::TEXT;
    RETURN;
  END IF;

  -- Verificar fecha de inicio
  IF v_descuento.valido_desde > NOW() THEN
    RETURN QUERY SELECT false, NULL::INTEGER, NULL::INTEGER, 'Código aún no vigente'::TEXT;
    RETURN;
  END IF;

  -- Verificar fecha de fin
  IF v_descuento.valido_hasta IS NOT NULL AND v_descuento.valido_hasta < NOW() THEN
    RETURN QUERY SELECT false, NULL::INTEGER, NULL::INTEGER, 'Código vencido'::TEXT;
    RETURN;
  END IF;

  -- Verificar usos máximos
  IF v_descuento.usos_maximos IS NOT NULL THEN
    SELECT COUNT(*) INTO v_usos_actuales
    FROM pedidos
    WHERE id_codigo_descuento = v_descuento.id
    AND estado_pago = 'pagado';

    IF v_usos_actuales >= v_descuento.usos_maximos THEN
      RETURN QUERY SELECT false, NULL::INTEGER, NULL::INTEGER, 'Código agotado'::TEXT;
      RETURN;
    END IF;
  END IF;

  -- Código válido
  RETURN QUERY SELECT
    true,
    v_descuento.id,
    v_descuento.porcentaje_descuento,
    'Código válido'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener el siguiente número de serie
CREATE OR REPLACE FUNCTION obtener_siguiente_numero_serie(p_id_producto INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_max_serie INTEGER;
  v_stock_inicial INTEGER;
BEGIN
  -- Obtener el stock inicial del producto
  SELECT stock_inicial INTO v_stock_inicial
  FROM productos
  WHERE id = p_id_producto;

  -- Obtener el máximo número de serie usado
  SELECT COALESCE(MAX(numero_serie), 0) INTO v_max_serie
  FROM pedidos
  WHERE id_producto = p_id_producto;

  -- Retornar el siguiente número
  IF v_max_serie >= v_stock_inicial THEN
    RAISE EXCEPTION 'No hay más números de serie disponibles';
  END IF;

  RETURN v_max_serie + 1;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PASO 7: TRIGGERS
-- =====================================================

-- Trigger para actualizar updated_at en clientes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar triggers si existen y recrear
DROP TRIGGER IF EXISTS trigger_clientes_updated_at ON clientes;
CREATE TRIGGER trigger_clientes_updated_at
BEFORE UPDATE ON clientes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_productos_updated_at ON productos;
CREATE TRIGGER trigger_productos_updated_at
BEFORE UPDATE ON productos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_codigos_descuento_updated_at ON codigos_descuento;
CREATE TRIGGER trigger_codigos_descuento_updated_at
BEFORE UPDATE ON codigos_descuento
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PASO 8: DATOS INICIALES
-- =====================================================

-- Insertar producto Buzzy Twist si no existe
INSERT INTO productos (id, nombre, descripcion, precio_cba, precio_interior, stock_inicial, activo)
VALUES (1, 'Buzzy Twist', 'Edición Limitada - Colaboración BUZZY × TEDDYTWIST', 5.00, 5.00, 900, true)
ON CONFLICT (id) DO UPDATE SET
  precio_cba = EXCLUDED.precio_cba,
  precio_interior = EXCLUDED.precio_interior;

-- Insertar códigos de descuento si no existen
INSERT INTO codigos_descuento (codigo, porcentaje_descuento, activo, usos_maximos, valido_desde, descripcion)
VALUES
  ('BUZZY10', 10, true, 100, NOW(), 'Descuento del 10%'),
  ('BUZZY20', 20, true, 50, NOW(), 'Descuento del 20%'),
  ('TEDDYTWIST15', 15, true, 75, NOW(), 'Descuento del 15%')
ON CONFLICT (codigo) DO NOTHING;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

COMMENT ON TABLE clientes IS 'Tabla de clientes con información personal y de contacto';
COMMENT ON TABLE pedidos IS 'Tabla de pedidos vinculando productos y clientes';
COMMENT ON TABLE productos IS 'Catálogo de productos disponibles';
COMMENT ON TABLE codigos_descuento IS 'Códigos de descuento disponibles';

COMMENT ON FUNCTION obtener_stock_disponible(INTEGER) IS 'Retorna el stock actual de un producto';
COMMENT ON FUNCTION validar_codigo_descuento(VARCHAR) IS 'Valida si un código de descuento es válido';
COMMENT ON FUNCTION obtener_siguiente_numero_serie(INTEGER) IS 'Retorna el siguiente número de serie disponible';

SELECT 'Estructura simplificada creada exitosamente' AS status;
