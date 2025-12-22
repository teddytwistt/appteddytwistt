import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function eliminarColumnasValidez() {
  console.log('🗑️  Eliminando columnas valido_desde y valido_hasta de la tabla codigos_descuento...\n')

  try {
    // Ejecutar SQL para eliminar las columnas
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE codigos_descuento DROP COLUMN IF EXISTS valido_desde;'
    })

    if (error1) {
      console.error('❌ Error al eliminar valido_desde:', error1)
      // Intentar directamente si el RPC no existe
      console.log('⚠️  Intentando método alternativo...')

      // Método alternativo: usar el SQL Editor de Supabase
      console.log('\n📋 Por favor ejecuta el siguiente SQL en Supabase SQL Editor:')
      console.log('----------------------------------------')
      console.log('ALTER TABLE codigos_descuento DROP COLUMN IF EXISTS valido_desde;')
      console.log('ALTER TABLE codigos_descuento DROP COLUMN IF EXISTS valido_hasta;')
      console.log('----------------------------------------\n')

      return
    }

    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE codigos_descuento DROP COLUMN IF EXISTS valido_hasta;'
    })

    if (error2) {
      console.error('❌ Error al eliminar valido_hasta:', error2)
      return
    }

    console.log('✅ Columnas valido_desde y valido_hasta eliminadas exitosamente')

    // Verificar la estructura actual
    const { data, error } = await supabase
      .from('codigos_descuento')
      .select('*')
      .limit(1)

    if (!error && data) {
      console.log('\n📊 Estructura actual de la tabla:')
      console.log('Columnas:', Object.keys(data[0] || {}))
    }

  } catch (error) {
    console.error('❌ Error:', error)
    console.log('\n📋 Por favor ejecuta el siguiente SQL manualmente en Supabase SQL Editor:')
    console.log('----------------------------------------')
    console.log('ALTER TABLE codigos_descuento DROP COLUMN IF EXISTS valido_desde;')
    console.log('ALTER TABLE codigos_descuento DROP COLUMN IF EXISTS valido_hasta;')
    console.log('----------------------------------------')
  }
}

eliminarColumnasValidez()
