// Script para limpiar las tablas de clientes y pedidos
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function limpiarTablas() {
  console.log('🧹 Iniciando limpieza de tablas...')

  try {
    // 1. Eliminar todos los pedidos
    console.log('📦 Eliminando pedidos...')
    const { error: pedidosError, count: pedidosCount } = await supabase
      .from('pedidos')
      .delete()
      .neq('id', 0) // Esto elimina todos los registros

    if (pedidosError) {
      console.error('❌ Error eliminando pedidos:', pedidosError)
      throw pedidosError
    }

    console.log(`✅ Pedidos eliminados exitosamente`)

    // 2. Eliminar todos los clientes
    console.log('👥 Eliminando clientes...')
    const { error: clientesError, count: clientesCount } = await supabase
      .from('clientes')
      .delete()
      .neq('id', 0) // Esto elimina todos los registros

    if (clientesError) {
      console.error('❌ Error eliminando clientes:', clientesError)
      throw clientesError
    }

    console.log(`✅ Clientes eliminados exitosamente`)

    console.log('\n🎉 Limpieza completada!')
    console.log('✅ Todas las tablas han sido limpiadas')

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error.message)
    process.exit(1)
  }
}

// Ejecutar el script
limpiarTablas()
