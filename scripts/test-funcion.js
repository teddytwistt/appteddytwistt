// Probar si la función existe en Supabase
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testFunction() {
  console.log('🧪 Probando función validar_codigo_descuento...\n')

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const { data, error } = await supabase
      .rpc('validar_codigo_descuento', { p_codigo: 'BUZZY10' })

    if (error) {
      console.error('❌ ERROR:', error)
      console.error('\nCódigo:', error.code)
      console.error('Mensaje:', error.message)
      console.error('Detalles:', error.details)
      console.error('Hint:', error.hint)

      if (error.code === '42883') {
        console.log('\n⚠️  LA FUNCIÓN NO EXISTE EN LA BASE DE DATOS')
        console.log('\n📋 SOLUCIÓN:')
        console.log('1. Ve a: https://supabase.com/dashboard/project/fhziabzxoqdxxzzgukfe/sql/new')
        console.log('2. Ejecuta el SQL que te di antes')
        console.log('3. Verifica que veas "Success. No rows returned"')
      }

      return
    }

    console.log('✅ La función existe y funciona!')
    console.log('Resultado:', data)

  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
  }
}

testFunction()
