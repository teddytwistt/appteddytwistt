const { createClient } = require('@supabase/supabase-js')
const { getArgentinaTimestamp } = require('../lib/utils/timezone')

const SUPABASE_URL = 'https://fhziabzxoqdxxzzgukfe.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoemlhYnp4b3FkeHh6emd1a2ZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI0MTkwMCwiZXhwIjoyMDc5ODE3OTAwfQ.GUkGGNQ7hgHWmc7cyf2cNPEX4i1ytWozoOYdO0gyemU'

async function marcarPedidosComoPagados() {
  console.log('🔄 Conectando a Supabase...')

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  console.log('📊 Consultando pedidos pendientes...')

  const { data: pedidosPendientes, error: errorConsulta } = await supabase
    .from('pedidos')
    .select('id, id_interno, zona, monto_final, estado_pago')
    .eq('estado_pago', 'pendiente')

  if (errorConsulta) {
    console.error('❌ Error al consultar pedidos:', errorConsulta)
    return
  }

  console.log(`\n📋 Encontrados ${pedidosPendientes.length} pedidos pendientes:\n`)
  pedidosPendientes.forEach(pedido => {
    console.log(`   ID: ${pedido.id_interno.substring(0, 8)}... | Zona: ${pedido.zona} | Monto: $${pedido.monto_final}`)
  })

  if (pedidosPendientes.length === 0) {
    console.log('\n✅ No hay pedidos pendientes para actualizar')
    return
  }

  console.log('\n💰 Actualizando pedidos a estado "pagado"...')

  const { data: pedidosActualizados, error: errorActualizacion } = await supabase
    .from('pedidos')
    .update({
      estado_pago: 'pagado',
      payment_id: 'TEST_PAYMENT_' + Date.now(),
      fecha_pago: getArgentinaTimestamp()
    })
    .eq('estado_pago', 'pendiente')
    .select()

  if (errorActualizacion) {
    console.error('❌ Error al actualizar pedidos:', errorActualizacion)
    return
  }

  console.log(`\n✅ ${pedidosActualizados.length} pedidos actualizados exitosamente!`)

  // Verificar stock actualizado
  console.log('\n📦 Verificando stock actualizado...')

  const { data: stockData, error: stockError } = await supabase
    .rpc('obtener_stock_disponible', {
      p_id_producto: 1
    })

  if (!stockError && stockData && stockData.length > 0) {
    const stock = stockData[0]
    console.log('\n📊 Estado del stock:')
    console.log(`   Stock inicial: ${stock.stock_inicial}`)
    console.log(`   Vendidos: ${stock.vendidos}`)
    console.log(`   Disponibles: ${stock.disponibles}`)
    console.log(`   Reservados: ${stock.reservados}`)
    console.log(`   Display: ${stock.disponibles}/${stock.stock_inicial}`)
  }

  console.log('\n🧪 Ahora puedes recargar la página web para ver los cambios')
  console.log('💡 NOTA: Este script es solo para pruebas. Los pagos reales se validarán automáticamente.')
}

marcarPedidosComoPagados()
