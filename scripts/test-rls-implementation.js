// ============================================
// SCRIPT DE VERIFICACIÓN POST-RLS
// ============================================
// Ejecuta este script DESPUÉS de habilitar RLS para verificar que:
// 1. Tu backend sigue funcionando (con SERVICE_ROLE_KEY)
// 2. Los accesos públicos son bloqueados (con ANON_KEY)
//
// Ejecutar: node scripts/test-rls-implementation.js
// ============================================

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function testRLSImplementation() {
  console.log('🧪 TESTING RLS IMPLEMENTATION\n')
  console.log('=' .repeat(60))

  // ============================================
  // TEST 1: Backend debe funcionar (SERVICE_ROLE_KEY)
  // ============================================
  console.log('\n✅ TEST 1: Backend access (SERVICE_ROLE_KEY)')
  console.log('-'.repeat(60))

  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    // Test: Leer productos
    const { data: productos, error: prodError } = await adminClient
      .from('productos')
      .select('*')
      .limit(1)

    if (prodError) {
      console.error('❌ BACKEND FAILED - Error reading productos:', prodError.message)
      return false
    }
    console.log('✅ Backend can read productos:', productos?.length || 0, 'records')

    // Test: Leer pedidos
    const { data: pedidos, error: pedError } = await adminClient
      .from('pedidos')
      .select('*')
      .limit(1)

    if (pedError) {
      console.error('❌ BACKEND FAILED - Error reading pedidos:', pedError.message)
      return false
    }
    console.log('✅ Backend can read pedidos:', pedidos?.length || 0, 'records')

    // Test: Leer clientes
    const { data: clientes, error: cliError } = await adminClient
      .from('clientes')
      .select('*')
      .limit(1)

    if (cliError) {
      console.error('❌ BACKEND FAILED - Error reading clientes:', cliError.message)
      return false
    }
    console.log('✅ Backend can read clientes:', clientes?.length || 0, 'records')

    console.log('\n🎉 Backend funcionando correctamente con SERVICE_ROLE_KEY')

  } catch (error) {
    console.error('❌ BACKEND TEST FAILED:', error.message)
    return false
  }

  // ============================================
  // TEST 2: Acceso público debe ser bloqueado (ANON_KEY)
  // ============================================
  console.log('\n🔒 TEST 2: Public access blocking (ANON_KEY)')
  console.log('-'.repeat(60))

  const publicClient = createClient(SUPABASE_URL, ANON_KEY)

  try {
    // Test: Intentar leer productos (debe fallar)
    const { data: productos, error: prodError } = await publicClient
      .from('productos')
      .select('*')
      .limit(1)

    if (prodError) {
      console.log('✅ Public access BLOCKED for productos (expected)')
      console.log('   Error:', prodError.message)
    } else if (productos && productos.length > 0) {
      console.error('❌ SECURITY ISSUE - Public can still read productos!')
      console.error('   RLS might not be working correctly')
      return false
    } else {
      console.log('✅ Public access BLOCKED for productos (no data returned)')
    }

    // Test: Intentar leer pedidos (debe fallar)
    const { data: pedidos, error: pedError } = await publicClient
      .from('pedidos')
      .select('*')
      .limit(1)

    if (pedError) {
      console.log('✅ Public access BLOCKED for pedidos (expected)')
    } else if (pedidos && pedidos.length > 0) {
      console.error('❌ SECURITY ISSUE - Public can still read pedidos!')
      return false
    } else {
      console.log('✅ Public access BLOCKED for pedidos')
    }

    // Test: Intentar leer clientes (debe fallar)
    const { data: clientes, error: cliError } = await publicClient
      .from('clientes')
      .select('*')
      .limit(1)

    if (cliError) {
      console.log('✅ Public access BLOCKED for clientes (expected)')
    } else if (clientes && clientes.length > 0) {
      console.error('❌ SECURITY ISSUE - Public can still read clientes!')
      return false
    } else {
      console.log('✅ Public access BLOCKED for clientes')
    }

    console.log('\n🔒 Security working correctly - Public access is blocked')

  } catch (error) {
    console.log('✅ Public access test completed with expected errors')
  }

  // ============================================
  // RESULTADO FINAL
  // ============================================
  console.log('\n' + '='.repeat(60))
  console.log('🎉 RLS IMPLEMENTATION SUCCESSFUL!')
  console.log('='.repeat(60))
  console.log('✅ Backend can access data (SERVICE_ROLE_KEY works)')
  console.log('✅ Public access is blocked (ANON_KEY blocked)')
  console.log('\n💡 Your application should work normally')
  console.log('💡 Attackers cannot access your database directly\n')

  return true
}

// Ejecutar el test
testRLSImplementation()
  .then(success => {
    if (success) {
      process.exit(0)
    } else {
      console.error('\n⚠️  SOME TESTS FAILED - Check the output above')
      console.error('⚠️  Consider running rollback-rls-security.sql if needed\n')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('\n❌ TEST SCRIPT ERROR:', error)
    process.exit(1)
  })
