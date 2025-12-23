// Verificar códigos de descuento en la base de datos
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function verificarCodigos() {
  console.log('🔍 Verificando códigos de descuento en la base de datos...\n')

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Obtener todos los códigos
  const { data: codigos, error } = await supabase
    .from('codigos_descuento')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  if (!codigos || codigos.length === 0) {
    console.log('⚠️  No hay códigos de descuento en la base de datos')
    return
  }

  console.log(`📋 Encontrados ${codigos.length} códigos:\n`)

  codigos.forEach((codigo, index) => {
    const ahora = new Date()
    const validoDesde = codigo.valido_desde ? new Date(codigo.valido_desde) : null
    const validoHasta = codigo.valido_hasta ? new Date(codigo.valido_hasta) : null

    let estado = ''
    let problemas = []

    if (!codigo.activo) {
      problemas.push('❌ INACTIVO')
    }

    if (validoDesde && validoDesde > ahora) {
      problemas.push(`❌ Aún no vigente (desde ${validoDesde.toLocaleDateString()})`)
    }

    if (validoHasta && validoHasta < ahora) {
      problemas.push(`❌ VENCIDO (hasta ${validoHasta.toLocaleDateString()})`)
    }

    if (codigo.usos_maximos && codigo.veces_usado >= codigo.usos_maximos) {
      problemas.push(`❌ AGOTADO (${codigo.veces_usado}/${codigo.usos_maximos} usos)`)
    }

    if (problemas.length === 0) {
      estado = '✅ VÁLIDO'
    } else {
      estado = problemas.join(', ')
    }

    console.log(`${index + 1}. Código: ${codigo.codigo}`)
    console.log(`   Descuento: ${codigo.porcentaje_descuento}%`)
    console.log(`   Estado: ${estado}`)
    console.log(`   Activo: ${codigo.activo}`)
    console.log(`   Vigente desde: ${validoDesde ? validoDesde.toLocaleString() : 'N/A'}`)
    console.log(`   Vigente hasta: ${validoHasta ? validoHasta.toLocaleString() : 'Sin límite'}`)
    console.log(`   Usos: ${codigo.veces_usado}${codigo.usos_maximos ? ` / ${codigo.usos_maximos}` : ' / Ilimitado'}`)
    console.log('')
  })

  // Probar cada código con la función
  console.log('🧪 Probando códigos con la función validar_codigo_descuento...\n')

  for (const codigo of codigos) {
    const { data, error } = await supabase
      .rpc('validar_codigo_descuento', { p_codigo: codigo.codigo })

    const resultado = data?.[0]

    console.log(`${codigo.codigo}: ${resultado?.valido ? '✅ VÁLIDO' : '❌ ' + resultado?.mensaje}`)
  }
}

verificarCodigos()
