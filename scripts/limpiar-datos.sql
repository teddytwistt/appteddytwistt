-- =====================================================
-- SCRIPT PARA LIMPIAR DATOS
-- =====================================================
-- Este script:
-- 1. Limpia la tabla pedidos
-- 2. Limpia la tabla clientes
-- 3. Actualiza unidades_producto para dejar todo disponible excepto id 3
-- =====================================================

BEGIN;

-- PASO 1: Limpiar tabla pedidos
DELETE FROM pedidos;
SELECT 'Tabla pedidos limpiada' AS resultado;

-- PASO 2: Limpiar tabla clientes
DELETE FROM clientes;
SELECT 'Tabla clientes limpiada' AS resultado;

-- PASO 3: Actualizar unidades_producto
-- Dejar todo disponible excepto id 3
UPDATE unidades_producto
SET estado = 'disponible', fecha_venta = NULL
WHERE id != 3;

SELECT 'Unidades actualizadas (excepto id 3)' AS resultado;

-- PASO 4: Reiniciar las secuencias
ALTER SEQUENCE pedidos_id_seq RESTART WITH 1;
ALTER SEQUENCE clientes_id_seq RESTART WITH 1;

-- VERIFICACIÓN FINAL
SELECT 'Verificación de estado:' AS info;
SELECT
  COUNT(*) FILTER (WHERE id = 3) as unidad_3_count,
  COUNT(*) FILTER (WHERE id != 3 AND estado = 'disponible') as unidades_disponibles,
  COUNT(*) FILTER (WHERE id != 3 AND estado != 'disponible') as unidades_no_disponibles
FROM unidades_producto;

SELECT COUNT(*) as total_pedidos FROM pedidos;
SELECT COUNT(*) as total_clientes FROM clientes;

COMMIT;

SELECT '✅ Limpieza completada exitosamente' AS status;
