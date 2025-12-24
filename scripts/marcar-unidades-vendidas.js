require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function marcarUnidadesVendidas() {
  console.log('🎯 Configurando unidades vendidas del producto...\n')

  try {
    // 1. Marcar TODAS las unidades como disponibles
    console.log('🔄 Marcando todas las unidades como disponibles...')
    const { error: resetError } = await supabase
      .from('unidades_producto')
      .update({
        estado: 'disponible',
        fecha_venta: null
      })
      .eq('id_producto', 1)

    if (resetError) throw resetError
    console.log('✅ Todas las unidades marcadas como disponibles\n')

    // 2. Marcar solo las unidades 3 y 7 como vendidas
    console.log('🎯 Marcando unidades 3 y 7 como vendidas...')
    const { error: vendidosError } = await supabase
      .from('unidades_producto')
      .update({
        estado: 'vendido',
        fecha_venta: new Date().toISOString()
      })
      .eq('id_producto', 1)
      .in('numero_serie', [3, 7])

    if (vendidosError) throw vendidosError
    console.log('✅ Unidades 3 y 7 marcadas como vendidas\n')

    // 3. Verificar estado final
    console.log('📊 Verificando estado final...')

    const { data: vendidas, error: vendError } = await supabase
      .from('unidades_producto')
      .select('numero_serie, estado, fecha_venta')
      .eq('id_producto', 1)
      .eq('estado', 'vendido')
      .order('numero_serie')

    if (vendError) throw vendError

    const { count: disponibles } = await supabase
      .from('unidades_producto')
      .select('*', { count: 'exact', head: true })
      .eq('id_producto', 1)
      .eq('estado', 'disponible')

    console.log('\n✅ Configuración completada!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📦 Unidades vendidas: ${vendidas?.length || 0}`)
    if (vendidas && vendidas.length > 0) {
      vendidas.forEach(u => {
        console.log(`   - Unidad #${u.numero_serie}`)
      })
    }
    console.log(`✨ Unidades disponibles: ${disponibles || 0}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

marcarUnidadesVendidas()
