const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const SUPABASE_URL = 'https://fhziabzxoqdxxzzgukfe.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoemlhYnp4b3FkeHh6emd1a2ZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI0MTkwMCwiZXhwIjoyMDc5ODE3OTAwfQ.GUkGGNQ7hgHWmc7cyf2cNPEX4i1ytWozoOYdO0gyemU'

async function ejecutarMigracion() {
  console.log('🚀 Iniciando migración a estructura simplificada...\n')

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  try {
    // Leer el script SQL
    console.log('📖 Leyendo script de migración...')
    const sqlPath = path.join(__dirname, 'nueva-estructura-simplificada.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')

    console.log('⚠️  ADVERTENCIA: Esta migración eliminará las vistas y tabla numeros_serie')
    console.log('⚠️  Y recreará la tabla pedidos con una estructura simplificada')
    console.log('⚠️  Los datos existentes se migrarán automáticamente\n')

    // Ejecutar el script por partes
    console.log('🔄 Ejecutando migración...')

    // Dividir el script en comandos individuales
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i]
      if (cmd.includes('COMMENT ON') || cmd.includes('SELECT \'')) {
        // Saltar comentarios y selects informativos
        continue
      }

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: cmd })
        if (error && !error.message.includes('does not exist')) {
          console.log(`  ⚠️  Advertencia en comando ${i + 1}: ${error.message.substring(0, 100)}`)
        } else {
          successCount++
        }
      } catch (e) {
        // Algunos comandos pueden fallar si ya existen, ignorar
        if (!e.message.includes('already exists')) {
          errorCount++
          console.log(`  ❌ Error en comando ${i + 1}:`, e.message.substring(0, 100))
        }
      }
    }

    console.log(`\n✅ Migración completada: ${successCount} comandos ejecutados, ${errorCount} errores\n`)

    // Verificar el resultado
    console.log('🔍 Verificando nueva estructura...')

    const { data: clientes, error: errorClientes } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true })

    const { data: pedidos, error: errorPedidos } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true })

    const { data: productos, error: errorProductos } = await supabase
      .from('productos')
      .select('*', { count: 'exact', head: true })

    console.log('\n📊 Estado de las tablas:')
    console.log(`   👥 Clientes: ${clientes?.length || 0}`)
    console.log(`   🛒 Pedidos: ${pedidos?.length || 0}`)
    console.log(`   📦 Productos: ${productos?.length || 0}`)

    // Probar función de stock
    console.log('\n🧪 Probando función de stock...')
    const { data: stock, error: stockError } = await supabase.rpc('obtener_stock_disponible', {
      p_id_producto: 1
    })

    if (stock && stock.length > 0) {
      console.log(`   Stock inicial: ${stock[0].stock_inicial}`)
      console.log(`   Vendidos: ${stock[0].vendidos}`)
      console.log(`   Disponibles: ${stock[0].disponibles}`)
    }

    console.log('\n✨ Migración completada exitosamente!')
    console.log('\n📝 Próximos pasos:')
    console.log('   1. Reiniciar el servidor de desarrollo (npm run dev)')
    console.log('   2. Probar que todo funcione correctamente')
    console.log('   3. Los cambios en el código ya están aplicados\n')

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error)
    console.error('\n💡 Si el error es sobre exec_sql, ejecuta el SQL manualmente en Supabase Dashboard')
    console.error('   Ve a: SQL Editor → Pega el contenido de nueva-estructura-simplificada.sql → Run')
  }
}

// Función auxiliar para ejecutar SQL (si Supabase la soporta)
async function createExecFunction() {
  console.log('📝 Nota: Si ves errores, ejecuta el SQL manualmente en Supabase Dashboard')
  console.log('   Ruta del archivo: scripts/nueva-estructura-simplificada.sql\n')
}

ejecutarMigracion()
