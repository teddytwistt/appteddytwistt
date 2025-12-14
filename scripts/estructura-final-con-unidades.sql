-- =====================================================
-- ESTRUCTURA FINAL CON UNIDADES_PRODUCTO
-- =====================================================
-- Cada unidad física del producto tiene su propio registro
-- con número de serie y estado (disponible/vendido)
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

CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_dni ON clientes(dni);

-- =====================================================
-- PASO 3: ACTUALIZAR TABLA PRODUCTOS
-- =====================================================

ALTER TABLE productos DROP COLUMN IF EXISTS imagen_url;

ALTER TABLE productos
  ALTER COLUMN nombre TYPE VARCHAR(255),
  ALTER COLUMN precio_cba TYPE DECIMAL(10,2),
  ALTER COLUMN precio_interior TYPE DECIMAL(10,2),
  ALTER COLUMN stock_inicial SET DEFAULT 900,
  ALTER COLUMN activo SET DEFAULT true;

-- =====================================================
-- PASO 4: CREAR TABLA UNIDADES_PRODUCTO (NUEVA!)
-- =====================================================

CREATE TABLE IF NOT EXISTS unidades_producto (
  id SERIAL PRIMARY KEY,
  id_producto INTEGER NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
  numero_serie INTEGER NOT NULL,
  estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'reservado', 'vendido', 'cancelado')),
  fecha_venta TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(id_producto, numero_serie)
);

CREATE INDEX IF NOT EXISTS idx_unidades_producto ON unidades_producto(id_producto);
CREATE INDEX IF NOT EXISTS idx_unidades_estado ON unidades_producto(estado);
CREATE INDEX IF NOT EXISTS idx_unidades_numero_serie ON unidades_producto(numero_serie);

COMMENT ON TABLE unidades_producto IS 'Cada registro representa una unidad física del producto con su número de serie único';
COMMENT ON COLUMN unidades_producto.numero_serie IS 'Número de serie de la unidad física (1-900 para Buzzy Twist)';
COMMENT ON COLUMN unidades_producto.estado IS 'disponible: en stock, reservado: en proceso de compra, vendido: vendido, cancelado: compra cancelada';

-- =====================================================
-- PASO 5: RECREAR TABLA PEDIDOS CON ID_UNIDAD
-- =====================================================

-- Guardar datos existentes
CREATE TEMP TABLE pedidos_backup AS
SELECT * FROM pedidos;

-- Eliminar y recrear
DROP TABLE IF EXISTS pedidos CASCADE;

CREATE TABLE pedidos (
  id SERIAL PRIMARY KEY,
  id_producto INTEGER NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
  id_cliente INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
  id_codigo_descuento INTEGER REFERENCES codigos_descuento(id) ON DELETE SET NULL,
  id_unidad INTEGER REFERENCES unidades_producto(id) ON DELETE SET NULL,

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

CREATE INDEX IF NOT EXISTS idx_pedidos_producto ON pedidos(id_producto);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(id_cliente);
CREATE INDEX IF NOT EXISTS idx_pedidos_unidad ON pedidos(id_unidad);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado_pago ON pedidos(estado_pago);
CREATE INDEX IF NOT EXISTS idx_pedidos_preference_id ON pedidos(preference_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha_creacion ON pedidos(fecha_creacion);

COMMENT ON TABLE pedidos IS 'Pedidos de clientes vinculados a una unidad específica del producto';
COMMENT ON COLUMN pedidos.id_unidad IS 'FK a unidades_producto - identifica la unidad física vendida';

-- =====================================================
-- PASO 6: ACTUALIZAR TABLA CODIGOS_DESCUENTO
-- =====================================================

ALTER TABLE codigos_descuento
  ALTER COLUMN porcentaje_descuento TYPE INTEGER,
  ALTER COLUMN activo SET DEFAULT true,
  ALTER COLUMN veces_usado SET DEFAULT 0;

-- =====================================================
-- PASO 7: FUNCIONES ÚTILES
-- =====================================================

-- Eliminar funciones antiguas (con todas las firmas posibles)
DROP FUNCTION IF EXISTS asignar_numero_serie(UUID);
DROP FUNCTION IF EXISTS asignar_numero_serie(INTEGER);
DROP FUNCTION IF EXISTS obtener_siguiente_numero_serie(INTEGER);
DROP FUNCTION IF EXISTS obtener_stock_disponible(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS validar_codigo_descuento(VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS reservar_unidad_disponible(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS marcar_unidad_vendida(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS liberar_unidad(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS inicializar_unidades_producto(INTEGER, INTEGER) CASCADE;

-- Función para obtener el stock disponible
CREATE FUNCTION obtener_stock_disponible(p_id_producto INTEGER)
RETURNS TABLE (
  stock_inicial INTEGER,
  vendidos BIGINT,
  disponibles BIGINT,
  reservados BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.stock_inicial,
    COALESCE(COUNT(u.id) FILTER (WHERE u.estado = 'vendido'), 0) as vendidos,
    COALESCE(COUNT(u.id) FILTER (WHERE u.estado = 'disponible'), 0) as disponibles,
    COALESCE(COUNT(u.id) FILTER (WHERE u.estado = 'reservado'), 0) as reservados
  FROM productos p
  LEFT JOIN unidades_producto u ON u.id_producto = p.id
  WHERE p.id = p_id_producto
  GROUP BY p.id, p.stock_inicial;
END;
$$ LANGUAGE plpgsql;

-- Función para reservar una unidad disponible
CREATE FUNCTION reservar_unidad_disponible(p_id_producto INTEGER)
RETURNS TABLE (
  id_unidad INTEGER,
  numero_serie INTEGER
) AS $$
DECLARE
  v_unidad RECORD;
BEGIN
  -- Buscar una unidad disponible y marcarla como reservada
  SELECT u.id, u.numero_serie INTO v_unidad
  FROM unidades_producto u
  WHERE u.id_producto = p_id_producto
    AND u.estado = 'disponible'
  ORDER BY u.numero_serie
  LIMIT 1
  FOR UPDATE SKIP LOCKED; -- Evita race conditions

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No hay unidades disponibles para el producto %', p_id_producto;
  END IF;

  -- Marcar como reservada
  UPDATE unidades_producto
  SET estado = 'reservado'
  WHERE id = v_unidad.id;

  RETURN QUERY SELECT v_unidad.id, v_unidad.numero_serie;
END;
$$ LANGUAGE plpgsql;

-- Función para marcar unidad como vendida
CREATE FUNCTION marcar_unidad_vendida(p_id_unidad INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE unidades_producto
  SET estado = 'vendido', fecha_venta = NOW()
  WHERE id = p_id_unidad AND estado IN ('reservado', 'disponible');

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Función para liberar unidad (cancelar reserva)
CREATE FUNCTION liberar_unidad(p_id_unidad INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE unidades_producto
  SET estado = 'disponible'
  WHERE id = p_id_unidad AND estado = 'reservado';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Función para validar código de descuento
CREATE FUNCTION validar_codigo_descuento(p_codigo VARCHAR)
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
  SELECT * INTO v_descuento
  FROM codigos_descuento
  WHERE codigo = UPPER(p_codigo);

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::INTEGER, NULL::INTEGER, 'Código no válido'::TEXT;
    RETURN;
  END IF;

  IF NOT v_descuento.activo THEN
    RETURN QUERY SELECT false, NULL::INTEGER, NULL::INTEGER, 'Código inactivo'::TEXT;
    RETURN;
  END IF;

  IF v_descuento.valido_desde > NOW() THEN
    RETURN QUERY SELECT false, NULL::INTEGER, NULL::INTEGER, 'Código aún no vigente'::TEXT;
    RETURN;
  END IF;

  IF v_descuento.valido_hasta IS NOT NULL AND v_descuento.valido_hasta < NOW() THEN
    RETURN QUERY SELECT false, NULL::INTEGER, NULL::INTEGER, 'Código vencido'::TEXT;
    RETURN;
  END IF;

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

  RETURN QUERY SELECT
    true,
    v_descuento.id,
    v_descuento.porcentaje_descuento,
    'Código válido'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Función para inicializar unidades de un producto
CREATE FUNCTION inicializar_unidades_producto(
  p_id_producto INTEGER,
  p_cantidad INTEGER DEFAULT 900
)
RETURNS INTEGER AS $$
DECLARE
  v_insertadas INTEGER;
BEGIN
  -- Verificar que no existan ya unidades para este producto
  IF EXISTS (SELECT 1 FROM unidades_producto WHERE id_producto = p_id_producto LIMIT 1) THEN
    RAISE EXCEPTION 'Ya existen unidades para el producto %', p_id_producto;
  END IF;

  -- Insertar las unidades
  INSERT INTO unidades_producto (id_producto, numero_serie, estado)
  SELECT p_id_producto, generate_series(1, p_cantidad), 'disponible';

  GET DIAGNOSTICS v_insertadas = ROW_COUNT;

  RETURN v_insertadas;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PASO 8: TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
-- PASO 9: DATOS INICIALES
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

-- Inicializar 900 unidades del producto Buzzy Twist
-- Solo si no existen ya
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM unidades_producto WHERE id_producto = 1 LIMIT 1) THEN
    PERFORM inicializar_unidades_producto(1, 900);
    RAISE NOTICE '✅ 900 unidades inicializadas para Buzzy Twist';
  ELSE
    RAISE NOTICE 'ℹ️  Las unidades ya existen, no se inicializan nuevamente';
  END IF;
END $$;

-- =====================================================
-- PASO 10: MIGRAR DATOS EXISTENTES
-- =====================================================

DO $$
DECLARE
  v_pedido RECORD;
  v_cliente_id INTEGER;
  v_unidad_id INTEGER;
  v_numero_serie INTEGER;
  v_tiene_columnas_cliente BOOLEAN;
  v_pedidos_migrados INTEGER := 0;
  v_clientes_migrados INTEGER := 0;
BEGIN
  -- Verificar si la tabla backup tiene columnas de cliente
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pedidos_backup'
    AND column_name = 'nombre_apellido'
  ) INTO v_tiene_columnas_cliente;

  -- Migrar clientes SOLO si existen las columnas
  IF v_tiene_columnas_cliente THEN
    RAISE NOTICE '📋 Migrando clientes de pedidos antiguos...';

    INSERT INTO clientes (nombre_apellido, email, telefono, dni, provincia, ciudad, direccion_completa)
    SELECT DISTINCT
      COALESCE(nombre_apellido, 'Cliente Sin Datos'),
      COALESCE(email, 'sin-email-' || id || '@temporal.com'),
      COALESCE(telefono, 'Sin teléfono'),
      COALESCE(dni, 'Sin DNI'),
      provincia,
      ciudad,
      direccion_completa
    FROM pedidos_backup
    WHERE nombre_apellido IS NOT NULL
      OR email IS NOT NULL
      OR telefono IS NOT NULL
      OR dni IS NOT NULL
    ON CONFLICT DO NOTHING;

    GET DIAGNOSTICS v_clientes_migrados = ROW_COUNT;
    RAISE NOTICE '✅ % clientes migrados', v_clientes_migrados;
  ELSE
    RAISE NOTICE 'ℹ️  No hay columnas de cliente para migrar (estructura ya actualizada)';
  END IF;

  -- Migrar pedidos existentes
  RAISE NOTICE '📋 Migrando pedidos...';

  FOR v_pedido IN SELECT * FROM pedidos_backup LOOP
    -- Buscar cliente (solo si hay columnas de cliente)
    v_cliente_id := NULL;
    IF v_tiene_columnas_cliente THEN
      BEGIN
        EXECUTE format('SELECT id FROM clientes WHERE email = %L LIMIT 1',
          COALESCE(
            (SELECT email FROM pedidos_backup WHERE id = v_pedido.id),
            'sin-email-' || v_pedido.id || '@temporal.com'
          )
        ) INTO v_cliente_id;
      EXCEPTION WHEN OTHERS THEN
        v_cliente_id := NULL;
      END;
    END IF;

    -- Determinar número de serie
    BEGIN
      v_numero_serie := COALESCE(
        (SELECT numero_serie FROM pedidos_backup WHERE id = v_pedido.id),
        v_pedido.id
      );
    EXCEPTION WHEN OTHERS THEN
      v_numero_serie := v_pedido.id;
    END;

    -- Buscar o crear unidad con el número de serie
    SELECT id INTO v_unidad_id
    FROM unidades_producto
    WHERE id_producto = v_pedido.id_producto
      AND numero_serie = v_numero_serie;

    -- Si no existe la unidad, crear una nueva
    IF v_unidad_id IS NULL THEN
      INSERT INTO unidades_producto (id_producto, numero_serie, estado)
      VALUES (
        v_pedido.id_producto,
        v_numero_serie,
        CASE WHEN v_pedido.estado_pago = 'pagado' THEN 'vendido' ELSE 'disponible' END
      )
      ON CONFLICT (id_producto, numero_serie) DO UPDATE SET estado = EXCLUDED.estado
      RETURNING id INTO v_unidad_id;
    END IF;

    -- Insertar pedido
    INSERT INTO pedidos (
      id_producto, id_cliente, id_codigo_descuento, id_unidad,
      preference_id, payment_id, zona,
      monto_original, porcentaje_descuento, monto_descuento, monto_final,
      estado_pago, estado_envio, comentarios, mp_response,
      fecha_creacion, fecha_pago, fecha_envio, fecha_entrega
    ) VALUES (
      v_pedido.id_producto,
      v_cliente_id,
      v_pedido.id_codigo_descuento,
      v_unidad_id,
      v_pedido.preference_id,
      v_pedido.payment_id,
      v_pedido.zona,
      v_pedido.monto_original,
      v_pedido.porcentaje_descuento,
      v_pedido.monto_descuento,
      v_pedido.monto_final,
      v_pedido.estado_pago,
      v_pedido.estado_envio,
      v_pedido.comentarios,
      v_pedido.mp_response,
      v_pedido.fecha_creacion,
      v_pedido.fecha_pago,
      v_pedido.fecha_envio,
      v_pedido.fecha_entrega
    );

    v_pedidos_migrados := v_pedidos_migrados + 1;
  END LOOP;

  RAISE NOTICE '✅ % pedidos migrados exitosamente', v_pedidos_migrados;
END $$;

-- Actualizar secuencias
SELECT setval('pedidos_id_seq', (SELECT COALESCE(MAX(id), 1) FROM pedidos), true);
SELECT setval('clientes_id_seq', (SELECT COALESCE(MAX(id), 1) FROM clientes), true);
SELECT setval('unidades_producto_id_seq', (SELECT COALESCE(MAX(id), 1) FROM unidades_producto), true);

-- Limpiar tabla temporal
DROP TABLE IF EXISTS pedidos_backup;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

DO $$
DECLARE
  v_clientes INTEGER;
  v_pedidos INTEGER;
  v_unidades_total INTEGER;
  v_unidades_disponibles INTEGER;
  v_unidades_vendidas INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_clientes FROM clientes;
  SELECT COUNT(*) INTO v_pedidos FROM pedidos;
  SELECT COUNT(*) INTO v_unidades_total FROM unidades_producto;
  SELECT COUNT(*) INTO v_unidades_disponibles FROM unidades_producto WHERE estado = 'disponible';
  SELECT COUNT(*) INTO v_unidades_vendidas FROM unidades_producto WHERE estado = 'vendido';

  RAISE NOTICE '╔════════════════════════════════════════════╗';
  RAISE NOTICE '║  ✅ MIGRACIÓN COMPLETADA EXITOSAMENTE     ║';
  RAISE NOTICE '╚════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Resumen:';
  RAISE NOTICE '   👥 Clientes: %', v_clientes;
  RAISE NOTICE '   🛒 Pedidos: %', v_pedidos;
  RAISE NOTICE '   📦 Unidades totales: %', v_unidades_total;
  RAISE NOTICE '   ✅ Unidades disponibles: %', v_unidades_disponibles;
  RAISE NOTICE '   💰 Unidades vendidas: %', v_unidades_vendidas;
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Próximos pasos:';
  RAISE NOTICE '   1. Reiniciar servidor: npm run dev';
  RAISE NOTICE '   2. Probar flujo de compra completo';
  RAISE NOTICE '';
END $$;

SELECT 'Estructura final con unidades_producto creada exitosamente' AS status;
