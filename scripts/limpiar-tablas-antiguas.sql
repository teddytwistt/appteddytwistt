-- =====================================================
-- LIMPIEZA DE TABLAS ANTIGUAS
-- =====================================================
-- ⚠️ ADVERTENCIA: Solo ejecutar después de verificar que
-- la migración fue exitosa y todo funciona correctamente
-- =====================================================

-- Opción 1: Renombrar tablas antiguas como backup (RECOMENDADO)
-- Esto permite recuperar datos si algo sale mal

DO $$
BEGIN
  -- Renombrar orders a orders_backup
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') THEN
    ALTER TABLE orders RENAME TO orders_backup;
    RAISE NOTICE 'Tabla orders renombrada a orders_backup';
  END IF;

  -- Renombrar discount_codes a discount_codes_backup
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'discount_codes') THEN
    ALTER TABLE discount_codes RENAME TO discount_codes_backup;
    RAISE NOTICE 'Tabla discount_codes renombrada a discount_codes_backup';
  END IF;

  -- Renombrar serial_numbers a serial_numbers_backup
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'serial_numbers') THEN
    ALTER TABLE serial_numbers RENAME TO serial_numbers_backup;
    RAISE NOTICE 'Tabla serial_numbers renombrada a serial_numbers_backup';
  END IF;

  -- Renombrar stock_config a stock_config_backup
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'stock_config') THEN
    ALTER TABLE stock_config RENAME TO stock_config_backup;
    RAISE NOTICE 'Tabla stock_config renombrada a stock_config_backup';
  END IF;

  -- Renombrar vista stock_status si existe
  IF EXISTS (SELECT FROM information_schema.views WHERE table_name = 'stock_status') THEN
    DROP VIEW IF EXISTS stock_status;
    RAISE NOTICE 'Vista stock_status eliminada (ya no necesaria)';
  END IF;

  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Tablas antiguas renombradas como backup';
  RAISE NOTICE 'Para restaurar, ejecuta: ALTER TABLE orders_backup RENAME TO orders;';
  RAISE NOTICE '=====================================================';
END $$;

-- =====================================================
-- Opción 2: Eliminar tablas antiguas COMPLETAMENTE
-- =====================================================
-- ⚠️ PELIGRO: Esto es IRREVERSIBLE
-- ⚠️ Solo descomentar y ejecutar si estás 100% seguro

/*
-- Eliminar triggers antiguos
DROP TRIGGER IF EXISTS trigger_increment_discount_usage ON orders CASCADE;
DROP FUNCTION IF EXISTS increment_discount_usage() CASCADE;
DROP FUNCTION IF EXISTS get_next_serial_number() CASCADE;
DROP FUNCTION IF EXISTS assign_serial_number(UUID) CASCADE;

-- Eliminar vistas antiguas
DROP VIEW IF EXISTS stock_status CASCADE;

-- Eliminar tablas antiguas
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS discount_codes CASCADE;
DROP TABLE IF EXISTS serial_numbers CASCADE;
DROP TABLE IF EXISTS stock_config CASCADE;

RAISE NOTICE '⚠️ Tablas antiguas ELIMINADAS permanentemente';
*/

-- =====================================================
-- Para eliminar los backups después (cuando estés seguro)
-- =====================================================
-- Descomentar y ejecutar solo cuando estés 100% seguro
-- de que ya no necesitas los datos antiguos

/*
DROP TABLE IF EXISTS orders_backup CASCADE;
DROP TABLE IF EXISTS discount_codes_backup CASCADE;
DROP TABLE IF EXISTS serial_numbers_backup CASCADE;
DROP TABLE IF EXISTS stock_config_backup CASCADE;

RAISE NOTICE 'Backups eliminados permanentemente';
*/
