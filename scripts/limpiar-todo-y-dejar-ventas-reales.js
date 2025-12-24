require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function limpiarYDejarVentasReales() {
  console.log('🧹 Limpiando datos de prueba...\n')

  try {
    // 1. Eliminar todos los códigos de descuento
    console.log('🗑️  Eliminando códigos de descuento...')
    const { error: discountError } = await supabase
      .from('codigos_descuento')
      .delete()
      .neq('id', 0) // Elimina todos

    if (discountError) throw discountError
    console.log('✅ Códigos de descuento eliminados\n')

    // 2. Eliminar todos los pedidos
    console.log('🗑️  Eliminando todos los pedidos...')
    const { error: ordersError } = await supabase
      .from('pedidos')
      .delete()
      .neq('id', 0) // Elimina todos

    if (ordersError) throw ordersError
    console.log('✅ Pedidos eliminados\n')

    // 3. Eliminar todos los clientes
    console.log('🗑️  Eliminando todos los clientes...')
    const { error: clientsError } = await supabase
      .from('clientes')
      .delete()
      .neq('id', 0) // Elimina todos

    if (clientsError) throw clientsError
    console.log('✅ Clientes eliminados\n')

    // 4. Resetear unidades vendidas del producto
    console.log('🔄 Reseteando unidades vendidas...')
    const { error: updateError } = await supabase
      .from('productos')
      .update({
        unidades_vendidas: [3, 7]
      })
      .eq('id', 1) // Asumiendo que el producto Buzzy Twist tiene ID 1

    if (updateError) throw updateError
    console.log('✅ Unidades vendidas actualizadas: [3, 7]\n')

    // 5. Verificar estado final
    console.log('📊 Verificando estado final...')

    const { data: productData } = await supabase
      .from('productos')
      .select('unidades_vendidas')
      .eq('id', 1)
      .single()

    const { count: ordersCount } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true })

    const { count: clientsCount } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true })

    const { count: discountsCount } = await supabase
      .from('codigos_descuento')
      .select('*', { count: 'exact', head: true })

    console.log('\n✅ Limpieza completada exitosamente!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📦 Unidades vendidas: ${JSON.stringify(productData?.unidades_vendidas)}`)
    console.log(`📋 Pedidos totales: ${ordersCount || 0}`)
    console.log(`👥 Clientes totales: ${clientsCount || 0}`)
    console.log(`🎟️  Códigos de descuento: ${discountsCount || 0}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error)
    process.exit(1)
  }
}

limpiarYDejarVentasReales()
