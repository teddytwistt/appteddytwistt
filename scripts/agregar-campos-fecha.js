// Agregar campos valido_desde y valido_hasta a la tabla codigos_descuento
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function agregarCamposFecha() {
  console.log('🔧 Agregando campos de fecha a codigos_descuento...\n')

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Primero verificar qué columnas tiene la tabla
  const { data: sample, error: sampleError } = await supabase
    .from('codigos_descuento')
    .select('*')
    .limit(1)

  if (sampleError) {
    console.error('❌ Error:', sampleError)
    return
  }

  console.log('📋 Columnas actuales:', Object.keys(sample[0] || {}))
  console.log('')

  const columnas = Object.keys(sample[0] || {})

  if (!columnas.includes('valido_desde')) {
    console.log('⚠️  Falta la columna "valido_desde"')
    console.log('📋 Necesitas ejecutar este SQL en Supabase SQL Editor:\n')
    console.log('ALTER TABLE codigos_descuento ADD COLUMN IF NOT EXISTS valido_desde TIMESTAMP WITH TIME ZONE DEFAULT NOW();')
    console.log('ALTER TABLE codigos_descuento ADD COLUMN IF NOT EXISTS valido_hasta TIMESTAMP WITH TIME ZONE;')
    console.log('')
  } else {
    console.log('✅ Las columnas valido_desde y valido_hasta ya existen')
  }

  // Actualizar todos los códigos para que tengan valido_desde = NOW()
  console.log('🔄 Actualizando códigos existentes...')

  const { error: updateError } = await supabase
    .from('codigos_descuento')
    .update({
      valido_desde: new Date().toISOString()
    })
    .is('valido_desde', null)

  if (updateError) {
    console.error('❌ Error al actualizar:', updateError)
  } else {
    console.log('✅ Códigos actualizados correctamente')
  }
}

agregarCamposFecha()
