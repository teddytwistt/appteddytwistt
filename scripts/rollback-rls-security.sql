-- ============================================
-- SCRIPT DE ROLLBACK - DESHACER CAMBIOS DE RLS
-- ============================================
-- ÚSALO SOLO SI ALGO FALLA después de habilitar RLS
--
-- Este script:
-- 1. Elimina todas las políticas RLS creadas
-- 2. Deshabilita RLS en todas las tablas
-- 3. Vuelve tu base de datos al estado anterior (INSEGURO)
--
-- CÓMO EJECUTAR:
-- 1. Ve a: https://supabase.com/dashboard/project/fhziabzxoqdxxzzgukfe/sql/new
-- 2. Copia y pega este script completo
-- 3. Click en "Run" (▶️)
-- ============================================

-- PASO 1: Eliminar todas las políticas
-- ============================================

DROP POLICY IF EXISTS "Block all public access to unidades_producto" ON public.unidades_producto;
DROP POLICY IF EXISTS "Block all public access to pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Block all public access to productos" ON public.productos;
DROP POLICY IF EXISTS "Block all public access to codigos_descuento" ON public.codigos_descuento;
DROP POLICY IF EXISTS "Block all public access to clientes" ON public.clientes;

-- PASO 2: Deshabilitar RLS en todas las tablas
-- ============================================

ALTER TABLE public.unidades_producto DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.codigos_descuento DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes DISABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICACIÓN: Todo volvió al estado anterior
-- ============================================

SELECT
  tablename,
  CASE
    WHEN rowsecurity THEN '🔒 RLS ENABLED'
    ELSE '🔓 RLS DISABLED (estado original inseguro)'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('unidades_producto', 'pedidos', 'productos', 'codigos_descuento', 'clientes')
ORDER BY tablename;

-- ============================================
-- ⚠️ ADVERTENCIA ⚠️
-- ============================================
-- Después de ejecutar este rollback, tu base de datos
-- volverá a estar VULNERABLE a ataques.
--
-- Solo usa este script si RLS causó problemas graves.
-- ============================================
