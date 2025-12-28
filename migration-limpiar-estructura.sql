-- Migración: Limpiar estructura de tablas (Opción A)
-- Fecha: 2025-12-28
-- Descripción:
--   - Tabla clientes: solo datos personales (nombre, email, telefono, dni)
--   - Tabla pedidos: solo dirección de envío (provincia, ciudad, codigo_postal, direccion_completa)

-- ============================================================
-- PASO 1: Eliminar campos de dirección de la tabla clientes
-- ============================================================
ALTER TABLE clientes
DROP COLUMN IF EXISTS provincia,
DROP COLUMN IF EXISTS ciudad,
DROP COLUMN IF EXISTS direccion_completa;

COMMENT ON TABLE clientes IS 'Datos personales del cliente (sin dirección, que va en cada pedido)';

-- ============================================================
-- PASO 2: Eliminar campos de datos personales de la tabla pedidos
-- ============================================================
ALTER TABLE pedidos
DROP COLUMN IF EXISTS nombre_apellido,
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS telefono,
DROP COLUMN IF EXISTS dni;

COMMENT ON TABLE pedidos IS 'Pedidos con dirección de envío específica (datos del cliente vienen de la relación con clientes)';

-- ============================================================
-- PASO 3: Verificar que pedidos tenga los campos de dirección
-- ============================================================
-- Estos campos ya existen según la inspección, pero por si acaso:
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pedidos' AND column_name='provincia') THEN
    ALTER TABLE pedidos ADD COLUMN provincia TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pedidos' AND column_name='ciudad') THEN
    ALTER TABLE pedidos ADD COLUMN ciudad TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pedidos' AND column_name='codigo_postal') THEN
    ALTER TABLE pedidos ADD COLUMN codigo_postal TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pedidos' AND column_name='direccion_completa') THEN
    ALTER TABLE pedidos ADD COLUMN direccion_completa TEXT;
  END IF;
END $$;

-- ============================================================
-- PASO 4: Actualizar comentarios de las columnas
-- ============================================================
COMMENT ON COLUMN pedidos.provincia IS 'Provincia de envío para este pedido';
COMMENT ON COLUMN pedidos.ciudad IS 'Ciudad/localidad de envío para este pedido';
COMMENT ON COLUMN pedidos.codigo_postal IS 'Código postal de envío para este pedido';
COMMENT ON COLUMN pedidos.direccion_completa IS 'Dirección completa de envío (calle, número, piso/depto) para este pedido';
