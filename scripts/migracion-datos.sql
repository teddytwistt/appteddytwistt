-- =====================================================
-- SCRIPT DE MIGRACIÓN DE DATOS
-- =====================================================
-- Este script migra los datos de las tablas antiguas a la nueva estructura
-- IMPORTANTE: Ejecutar DESPUÉS de nueva-estructura.sql

-- =====================================================
-- PASO 1: Migrar códigos de descuento
-- =====================================================
-- Migrar de discount_codes a codigos_descuento
INSERT INTO codigos_descuento (
  codigo,
  porcentaje_descuento,
  activo,
  usos_maximos,
  veces_usado,
  valido_desde,
  valido_hasta,
  created_at
)
SELECT
  code,
  discount_percentage,
  active,
  max_uses,
  times_used,
  valid_from,
  valid_until,
  created_at
FROM discount_codes
ON CONFLICT (codigo) DO UPDATE SET
  porcentaje_descuento = EXCLUDED.porcentaje_descuento,
  activo = EXCLUDED.activo,
  usos_maximos = EXCLUDED.usos_maximos,
  veces_usado = EXCLUDED.veces_usado,
  valido_desde = EXCLUDED.valido_desde,
  valido_hasta = EXCLUDED.valido_hasta;

-- =====================================================
-- PASO 2: Asegurar que existe el producto Buzzy Twist
-- =====================================================
-- Ya se insertó en nueva-estructura.sql, pero por si acaso
INSERT INTO productos (nombre, descripcion, precio_cba, precio_interior, stock_inicial, stock_actual, activo)
VALUES (
  'Buzzy Twist',
  'Edición limitada - Buzzy Twist',
  27000.00,
  32000.00,
  900,
  900,
  true
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- PASO 3: Migrar pedidos (orders a pedidos)
-- =====================================================
INSERT INTO pedidos (
  id_interno,
  id_producto,
  id_codigo_descuento,
  preference_id,
  payment_id,
  zona,
  monto_original,
  porcentaje_descuento,
  monto_descuento,
  monto_final,
  estado_pago,
  estado_envio,
  status_detail,
  nombre_apellido,
  email,
  telefono,
  dni,
  provincia,
  ciudad,
  direccion_completa,
  comentarios,
  comprobante_url,
  fecha_creacion,
  fecha_pago,
  mp_response,
  form_completado
)
SELECT
  o.id_interno,
  1, -- id_producto (asumimos que todos son Buzzy Twist, ID 1)
  cd.id, -- Buscar el ID del código de descuento en la nueva tabla
  o.preference_id,
  o.payment_id,
  o.zona,
  -- Si tiene descuento, calcular monto original, sino usar el monto como original
  CASE
    WHEN o.discount_percentage IS NOT NULL AND o.discount_percentage > 0
      THEN ROUND(o.monto / (1 - o.discount_percentage::DECIMAL / 100), 2)
    ELSE o.monto
  END as monto_original,
  COALESCE(o.discount_percentage, 0),
  CASE
    WHEN o.discount_percentage IS NOT NULL AND o.discount_percentage > 0
      THEN ROUND(o.monto / (1 - o.discount_percentage::DECIMAL / 100), 2) - o.monto
    ELSE 0
  END as monto_descuento,
  o.monto as monto_final,
  o.estado_pago,
  COALESCE(o.estado_envio, 'pendiente'),
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
ON CONFLICT (id_interno) DO UPDATE SET
  preference_id = EXCLUDED.preference_id,
  payment_id = EXCLUDED.payment_id,
  monto_original = EXCLUDED.monto_original,
  porcentaje_descuento = EXCLUDED.porcentaje_descuento,
  monto_descuento = EXCLUDED.monto_descuento,
  monto_final = EXCLUDED.monto_final,
  estado_pago = EXCLUDED.estado_pago,
  estado_envio = EXCLUDED.estado_envio,
  nombre_apellido = EXCLUDED.nombre_apellido,
  email = EXCLUDED.email,
  telefono = EXCLUDED.telefono,
  dni = EXCLUDED.dni,
  provincia = EXCLUDED.provincia,
  ciudad = EXCLUDED.ciudad,
  direccion_completa = EXCLUDED.direccion_completa,
  fecha_pago = EXCLUDED.fecha_pago;

-- =====================================================
-- PASO 4: Migrar números de serie si existen
-- =====================================================
-- Intentar migrar desde serial_numbers si la tabla existe
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'serial_numbers') THEN
    -- Migrar números de serie existentes
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
      estado = EXCLUDED.estado,
      reservado_en = EXCLUDED.reservado_en;

    -- Actualizar pedidos con sus números de serie
    UPDATE pedidos p
    SET numero_serie = ns.numero_serie
    FROM numeros_serie ns
    WHERE ns.id_pedido = p.id_interno AND p.numero_serie IS NULL;
  END IF;
END $$;

-- =====================================================
-- PASO 5: Actualizar stock actual del producto
-- =====================================================
-- Calcular cuántos pedidos pagados hay y actualizar el stock
UPDATE productos
SET stock_actual = stock_inicial - (
  SELECT COUNT(*)
  FROM pedidos
  WHERE estado_pago = 'pagado' AND id_producto = productos.id
)
WHERE id = 1;

-- =====================================================
-- PASO 6: Verificación de datos migrados
-- =====================================================
-- Mostrar resumen de la migración
DO $$
DECLARE
  v_productos_count INTEGER;
  v_pedidos_count INTEGER;
  v_descuentos_count INTEGER;
  v_series_count INTEGER;
  v_stock_actual INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_productos_count FROM productos;
  SELECT COUNT(*) INTO v_pedidos_count FROM pedidos;
  SELECT COUNT(*) INTO v_descuentos_count FROM codigos_descuento;
  SELECT COUNT(*) INTO v_series_count FROM numeros_serie WHERE estado = 'asignado';
  SELECT stock_actual INTO v_stock_actual FROM productos WHERE id = 1;

  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'RESUMEN DE MIGRACIÓN:';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Productos migrados: %', v_productos_count;
  RAISE NOTICE 'Pedidos migrados: %', v_pedidos_count;
  RAISE NOTICE 'Códigos de descuento migrados: %', v_descuentos_count;
  RAISE NOTICE 'Números de serie asignados: %', v_series_count;
  RAISE NOTICE 'Stock actual de Buzzy Twist: %', v_stock_actual;
  RAISE NOTICE '=====================================================';
END $$;

-- =====================================================
-- NOTA IMPORTANTE:
-- =====================================================
-- Después de ejecutar esta migración, las tablas antiguas
-- (orders, discount_codes, serial_numbers, stock_config)
-- pueden ser eliminadas o renombradas como respaldo.
--
-- Para renombrar como respaldo:
-- ALTER TABLE orders RENAME TO orders_backup;
-- ALTER TABLE discount_codes RENAME TO discount_codes_backup;
-- ALTER TABLE serial_numbers RENAME TO serial_numbers_backup;
-- ALTER TABLE stock_config RENAME TO stock_config_backup;
--
-- Para eliminar (¡CUIDADO! No se puede deshacer):
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS discount_codes CASCADE;
-- DROP TABLE IF EXISTS serial_numbers CASCADE;
-- DROP TABLE IF EXISTS stock_config CASCADE;
-- =====================================================
