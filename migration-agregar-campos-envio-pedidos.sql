-- Migración: Agregar campos de dirección de envío a la tabla pedidos
-- Fecha: 2025-12-28
-- Descripción: La dirección de envío es específica de cada pedido y puede
--              ser diferente para el mismo cliente en diferentes pedidos.
--              Los datos del cliente (nombre, email, teléfono, DNI) permanecen
--              en la tabla clientes.

-- Agregar columnas de dirección de envío a la tabla pedidos
ALTER TABLE pedidos
ADD COLUMN IF NOT EXISTS provincia TEXT,
ADD COLUMN IF NOT EXISTS ciudad TEXT,
ADD COLUMN IF NOT EXISTS codigo_postal TEXT,
ADD COLUMN IF NOT EXISTS direccion_completa TEXT;

-- Comentarios para documentación
COMMENT ON COLUMN pedidos.provincia IS 'Provincia de envío para este pedido';
COMMENT ON COLUMN pedidos.ciudad IS 'Ciudad/localidad de envío para este pedido';
COMMENT ON COLUMN pedidos.codigo_postal IS 'Código postal de envío para este pedido';
COMMENT ON COLUMN pedidos.direccion_completa IS 'Dirección completa de envío (calle, número, piso/depto) para este pedido';
