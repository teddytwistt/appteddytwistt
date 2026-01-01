-- ============================================
-- SCRIPT PARA HABILITAR RLS Y PROTEGER LA BASE DE DATOS
-- ============================================
-- Este script habilita Row Level Security en todas las tablas públicas
-- y crea políticas que bloquean acceso directo con ANON_KEY.
--
-- Tu aplicación seguirá funcionando porque usa SERVICE_ROLE_KEY que bypasea RLS.
--
-- CÓMO EJECUTAR:
-- 1. Ve a: https://supabase.com/dashboard/project/fhziabzxoqdxxzzgukfe/sql/new
-- 2. Copia y pega este script completo
-- 3. Click en "Run" (▶️)
-- 4. Verifica que todas las queries se ejecutaron exitosamente
-- ============================================

-- PASO 1: Habilitar RLS en todas las tablas
-- ============================================
-- Esto bloquea acceso por defecto a usuarios con ANON_KEY

ALTER TABLE public.unidades_producto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.codigos_descuento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 2: Crear políticas restrictivas
-- ============================================
-- Estas políticas bloquean TODO el acceso desde ANON_KEY
-- Solo SERVICE_ROLE_KEY (tu backend) podrá acceder

-- Tabla: unidades_producto
CREATE POLICY "Block all public access to unidades_producto"
ON public.unidades_producto
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- Tabla: pedidos
CREATE POLICY "Block all public access to pedidos"
ON public.pedidos
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- Tabla: productos
CREATE POLICY "Block all public access to productos"
ON public.productos
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- Tabla: codigos_descuento
CREATE POLICY "Block all public access to codigos_descuento"
ON public.codigos_descuento
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- Tabla: clientes
CREATE POLICY "Block all public access to clientes"
ON public.clientes
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- ============================================
-- VERIFICACIÓN: Estado de RLS
-- ============================================
-- Esta query mostrará que RLS está habilitado en todas las tablas

SELECT
  tablename,
  CASE
    WHEN rowsecurity THEN '✅ RLS ENABLED'
    ELSE '❌ RLS DISABLED'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('unidades_producto', 'pedidos', 'productos', 'codigos_descuento', 'clientes')
ORDER BY tablename;

-- ============================================
-- VERIFICACIÓN: Políticas creadas
-- ============================================
-- Esta query mostrará todas las políticas de seguridad

SELECT
  tablename,
  policyname,
  CASE cmd
    WHEN '*' THEN 'ALL operations'
    ELSE cmd
  END as applies_to
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('unidades_producto', 'pedidos', 'productos', 'codigos_descuento', 'clientes')
ORDER BY tablename, policyname;

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- Después de ejecutar este script deberías ver:
--
-- 1. Todas las tablas con "✅ RLS ENABLED"
-- 2. 5 políticas creadas (una por tabla)
-- 3. Cada política bloqueando "ALL operations" para anon/authenticated
--
-- TU APLICACIÓN SEGUIRÁ FUNCIONANDO NORMAL porque usa SERVICE_ROLE_KEY
-- Los atacantes serán BLOQUEADOS al intentar usar ANON_KEY
-- ============================================
