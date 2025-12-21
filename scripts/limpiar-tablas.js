// Script para limpiar las tablas de clientes, pedidos y resetear unidades
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function limpiarTablas() {
  console.log('🧹 Iniciando limpieza completa de tablas...\n')

  try {
    // 1. Eliminar todos los pedidos
    console.log('📦 Eliminando pedidos...')
    const { error: pedidosError } = await supabase
      .from('pedidos')
      .delete()
      .neq('id', 0) // Esto elimina todos los registros

    if (pedidosError) {
      console.error('❌ Error eliminando pedidos:', pedidosError)
      throw pedidosError
    }

    console.log('✅ Pedidos eliminados exitosamente')

    // 2. Eliminar todos los clientes
    console.log('👥 Eliminando clientes...')
    const { error: clientesError } = await supabase
      .from('clientes')
      .delete()
      .neq('id', 0) // Esto elimina todos los registros

    if (clientesError) {
      console.error('❌ Error eliminando clientes:', clientesError)
      throw clientesError
    }

    console.log('✅ Clientes eliminados exitosamente')

    // 3. Resetear todas las unidades a disponible
    console.log('📦 Reseteando unidades de producto...')
    const { error: unidadesError } = await supabase
      .from('unidades_producto')
      .update({
        estado: 'disponible',
        fecha_venta: null
      })
      .neq('id', 0) // Actualiza todos los registros

    if (unidadesError) {
      console.error('❌ Error reseteando unidades:', unidadesError)
      throw unidadesError
    }

    console.log('✅ Unidades reseteadas exitosamente')

    // 4. Verificar el stock actual
    console.log('\n📊 Verificando estado del stock...')
    const { data: stockData, error: stockError } = await supabase
      .rpc('obtener_stock_disponible', { p_id_producto: 1 })

    if (stockError) {
      console.error('❌ Error verificando stock:', stockError)
    } else if (stockData && stockData.length > 0) {
      const stock = stockData[0]
      console.log('📈 Stock actual:')
      console.log(`   - Stock inicial: ${stock.stock_inicial}`)
      console.log(`   - Disponibles: ${stock.disponibles}`)
      console.log(`   - Vendidos: ${stock.vendidos}`)
      console.log(`   - Reservados: ${stock.reservados}`)
    }

    console.log('\n🎉 Limpieza completada!')
    console.log('✅ Todas las tablas han sido limpiadas')
    console.log('✅ Todas las unidades están disponibles')

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error.message)
    process.exit(1)
  }
}

// Ejecutar el script
limpiarTablas()
