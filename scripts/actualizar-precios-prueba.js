const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://fhziabzxoqdxxzzgukfe.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoemlhYnp4b3FkeHh6emd1a2ZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI0MTkwMCwiZXhwIjoyMDc5ODE3OTAwfQ.GUkGGNQ7hgHWmc7cyf2cNPEX4i1ytWozoOYdO0gyemU'

async function actualizarPrecios() {
  console.log('🔄 Conectando a Supabase...')

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  console.log('📊 Consultando precios actuales...')

  const { data: preciosActuales, error: errorConsulta } = await supabase
    .from('productos')
    .select('id, nombre, precio_cba, precio_interior')
    .eq('id', 1)
    .single()

  if (errorConsulta) {
    console.error('❌ Error al consultar precios:', errorConsulta)
    return
  }

  console.log('\n📋 Precios actuales:')
  console.log(`   Producto: ${preciosActuales.nombre}`)
  console.log(`   Precio Córdoba: $${preciosActuales.precio_cba}`)
  console.log(`   Precio Interior: $${preciosActuales.precio_interior}`)

  console.log('\n💰 Actualizando precios a $5 para pruebas...')

  const { data: productosActualizados, error: errorActualizacion } = await supabase
    .from('productos')
    .update({
      precio_cba: 5,
      precio_interior: 5
    })
    .eq('id', 1)
    .select()

  if (errorActualizacion) {
    console.error('❌ Error al actualizar precios:', errorActualizacion)
    return
  }

  console.log('\n✅ Precios actualizados exitosamente!')
  console.log('📋 Nuevos precios:')
  console.log(`   Producto: ${productosActualizados[0].nombre}`)
  console.log(`   Precio Córdoba: $${productosActualizados[0].precio_cba}`)
  console.log(`   Precio Interior: $${productosActualizados[0].precio_interior}`)
  console.log('\n🧪 Ahora puedes hacer pruebas de compra con Mercado Pago')
  console.log('💡 Para restaurar los precios originales, vuelve a ejecutar este script con los valores que necesites')
}

actualizarPrecios()
