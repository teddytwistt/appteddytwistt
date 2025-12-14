/**
 * Script de Verificación Post-Migración
 *
 * Ejecutar después de aplicar estructura-final-con-unidades.sql
 * Verifica que toda la estructura esté correcta
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Faltan variables de entorno:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function verificarTablas() {
  console.log('\n📋 Verificando tablas...')

  const tablas = ['productos', 'clientes', 'unidades_producto', 'pedidos', 'codigos_descuento']

  for (const tabla of tablas) {
    const { count, error } = await supabase
      .from(tabla)
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.log(`   ❌ Tabla "${tabla}" no existe o error: ${error.message}`)
      return false
    } else {
      console.log(`   ✅ Tabla "${tabla}" existe (${count || 0} registros)`)
    }
  }

  return true
}

async function verificarUnidades() {
  console.log('\n🔢 Verificando unidades del producto...')

  const { data: unidades, error } = await supabase
    .from('unidades_producto')
    .select('estado, numero_serie')
    .eq('id_producto', 1)
    .order('numero_serie')

  if (error) {
    console.log(`   ❌ Error al obtener unidades: ${error.message}`)
    return false
  }

  const total = unidades.length
  const disponibles = unidades.filter(u => u.estado === 'disponible').length
  const vendidas = unidades.filter(u => u.estado === 'vendido').length
  const reservadas = unidades.filter(u => u.estado === 'reservado').length

  console.log(`   ✅ Total de unidades: ${total}`)
  console.log(`   📦 Disponibles: ${disponibles}`)
  console.log(`   💰 Vendidas: ${vendidas}`)
  console.log(`   ⏳ Reservadas: ${reservadas}`)

  if (total !== 900) {
    console.log(`   ⚠️  ADVERTENCIA: Se esperaban 900 unidades, se encontraron ${total}`)
  }

  // Verificar que los números de serie sean consecutivos
  const numerosEsperados = Array.from({ length: 900 }, (_, i) => i + 1)
  const numerosFaltantes = numerosEsperados.filter(
    num => !unidades.find(u => u.numero_serie === num)
  )

  if (numerosFaltantes.length > 0) {
    console.log(`   ⚠️  Números de serie faltantes: ${numerosFaltantes.slice(0, 10).join(', ')}${numerosFaltantes.length > 10 ? '...' : ''}`)
  } else {
    console.log(`   ✅ Todos los números de serie (1-900) están presentes`)
  }

  return true
}

async function verificarFunciones() {
  console.log('\n⚙️  Verificando funciones SQL...')

  const funciones = [
    { nombre: 'obtener_stock_disponible', params: { p_id_producto: 1 } },
    { nombre: 'validar_codigo_descuento', params: { p_codigo: 'TEST' } },
  ]

  for (const func of funciones) {
    try {
      const { data, error } = await supabase.rpc(func.nombre, func.params)

      if (error) {
        console.log(`   ❌ Función "${func.nombre}" error: ${error.message}`)
      } else {
        console.log(`   ✅ Función "${func.nombre}" funciona correctamente`)
      }
    } catch (err) {
      console.log(`   ❌ Función "${func.nombre}" no existe o error: ${err.message}`)
    }
  }

  return true
}

async function verificarStock() {
  console.log('\n📊 Verificando cálculo de stock...')

  const { data, error } = await supabase.rpc('obtener_stock_disponible', {
    p_id_producto: 1
  })

  if (error) {
    console.log(`   ❌ Error al obtener stock: ${error.message}`)
    return false
  }

  const stock = data[0]

  console.log(`   Stock inicial: ${stock.stock_inicial}`)
  console.log(`   Disponibles: ${stock.disponibles}`)
  console.log(`   Vendidos: ${stock.vendidos}`)
  console.log(`   Reservados: ${stock.reservados}`)

  const suma = Number(stock.disponibles) + Number(stock.vendidos) + Number(stock.reservados)

  if (suma !== stock.stock_inicial) {
    console.log(`   ⚠️  ADVERTENCIA: La suma no coincide (${suma} !== ${stock.stock_inicial})`)
  } else {
    console.log(`   ✅ Cálculo de stock correcto`)
  }

  return true
}

async function verificarPedidos() {
  console.log('\n🛒 Verificando pedidos...')

  const { data: pedidos, error } = await supabase
    .from('pedidos')
    .select(`
      id,
      id_unidad,
      estado_pago,
      unidad:unidades_producto(numero_serie, estado)
    `)
    .limit(10)

  if (error) {
    console.log(`   ❌ Error al obtener pedidos: ${error.message}`)
    return false
  }

  console.log(`   ✅ Total de pedidos en BD: ${pedidos.length}`)

  if (pedidos.length > 0) {
    const pedidosConUnidad = pedidos.filter(p => p.id_unidad && p.unidad)
    console.log(`   ✅ Pedidos con unidad asignada: ${pedidosConUnidad.length}/${pedidos.length}`)

    // Verificar que los pedidos pagados tengan unidad vendida
    const pedidosPagados = pedidos.filter(p => p.estado_pago === 'pagado')
    if (pedidosPagados.length > 0) {
      const estadosCorrectos = pedidosPagados.filter(
        p => p.unidad && p.unidad.estado === 'vendido'
      ).length
      console.log(`   ${estadosCorrectos === pedidosPagados.length ? '✅' : '⚠️'} Pedidos pagados con unidad vendida: ${estadosCorrectos}/${pedidosPagados.length}`)
    }
  } else {
    console.log('   ℹ️  No hay pedidos en la base de datos (esto es normal si es nuevo)')
  }

  return true
}

async function verificarClientes() {
  console.log('\n👥 Verificando clientes...')

  const { count, error } = await supabase
    .from('clientes')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.log(`   ❌ Error al contar clientes: ${error.message}`)
    return false
  }

  console.log(`   ✅ Total de clientes: ${count || 0}`)

  return true
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗')
  console.log('║   🔍 VERIFICACIÓN DE MIGRACIÓN - ESTRUCTURA FINAL     ║')
  console.log('╚════════════════════════════════════════════════════════╝')

  try {
    await verificarTablas()
    await verificarUnidades()
    await verificarFunciones()
    await verificarStock()
    await verificarPedidos()
    await verificarClientes()

    console.log('\n╔════════════════════════════════════════════════════════╗')
    console.log('║   ✅ VERIFICACIÓN COMPLETADA                          ║')
    console.log('╚════════════════════════════════════════════════════════╝')
    console.log('\n🎯 Próximos pasos:')
    console.log('   1. Si todo está ✅, reinicia el servidor: npm run dev')
    console.log('   2. Prueba el flujo completo de compra')
    console.log('   3. Verifica el panel de admin en /admin')
    console.log('')

  } catch (error) {
    console.error('\n❌ Error durante la verificación:', error)
    process.exit(1)
  }
}

main()
