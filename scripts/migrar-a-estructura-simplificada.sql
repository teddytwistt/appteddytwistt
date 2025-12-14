-- =====================================================
-- SCRIPT DE MIGRACIÓN A ESTRUCTURA SIMPLIFICADA
-- =====================================================
-- Este script migra los datos existentes a la nueva estructura
-- IMPORTANTE: Ejecutar DESPUÉS de nueva-estructura-simplificada.sql
-- =====================================================

-- PASO 1: Migrar datos de clientes desde pedidos
-- =====================================================

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

-- PASO 2: Migrar pedidos con relación a clientes
-- =====================================================

INSERT INTO pedidos (
  id_producto,
  id_cliente,
  id_codigo_descuento,
  numero_serie,
  preference_id,
  payment_id,
  zona,
  monto_original,
  porcentaje_descuento,
  monto_descuento,
  monto_final,
  estado_pago,
  estado_envio,
  comentarios,
  mp_response,
  fecha_creacion,
  fecha_pago,
  fecha_envio,
  fecha_entrega
)
SELECT
  pb.id_producto,
  -- Buscar el cliente correspondiente
  (
    SELECT c.id
    FROM clientes c
    WHERE c.email = COALESCE(pb.email, 'sin-email-' || pb.id || '@temporal.com')
    LIMIT 1
  ) as id_cliente,
  pb.id_codigo_descuento,
  COALESCE(pb.numero_serie, ROW_NUMBER() OVER (PARTITION BY pb.id_producto ORDER BY pb.fecha_creacion)),
  pb.preference_id,
  pb.payment_id,
  pb.zona,
  pb.monto_original,
  pb.porcentaje_descuento,
  pb.monto_descuento,
  pb.monto_final,
  pb.estado_pago,
  pb.estado_envio,
  pb.comentarios,
  pb.mp_response,
  pb.fecha_creacion,
  pb.fecha_pago,
  pb.fecha_envio,
  pb.fecha_entrega
FROM pedidos_backup pb;

-- =====================================================
-- PASO 3: Actualizar secuencias
-- =====================================================

-- Actualizar secuencia de pedidos
SELECT setval('pedidos_id_seq', (SELECT MAX(id) FROM pedidos), true);

-- Actualizar secuencia de clientes
SELECT setval('clientes_id_seq', (SELECT MAX(id) FROM clientes), true);

-- =====================================================
-- PASO 4: Limpiar tabla temporal
-- =====================================================

DROP TABLE IF EXISTS pedidos_backup;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

SELECT
  'Migración completada' as status,
  (SELECT COUNT(*) FROM clientes) as total_clientes,
  (SELECT COUNT(*) FROM pedidos) as total_pedidos,
  (SELECT COUNT(*) FROM productos) as total_productos,
  (SELECT COUNT(*) FROM codigos_descuento) as total_descuentos;
