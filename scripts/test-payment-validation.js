#!/usr/bin/env node

/**
 * Script para probar la validación de pagos
 * Simula lo que hace Mercado Pago cuando redirige de vuelta
 */

const fs = require('fs')
const path = require('path')

// Leer variables de entorno desde .env.local
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.+)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = envVars.SUPABASE_URL
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function testPaymentValidation() {
  console.log('🧪 Probando validación de pagos...\n')

  try {
    // 1. Buscar el pedido más reciente
    console.log('1️⃣ Buscando el pedido más reciente...')
    const { data: pedidos, error: pedidosError } = await supabase
      .from('pedidos')
      .select('*')
      .order('fecha_creacion', { ascending: false })
      .limit(1)

    if (pedidosError) {
      console.error('❌ Error al buscar pedidos:', pedidosError)
      return
    }

    if (!pedidos || pedidos.length === 0) {
      console.log('⚠️  No hay pedidos en la base de datos')
      console.log('💡 Crea un pedido primero usando el flujo de checkout')
      return
    }

    const pedido = pedidos[0]
    console.log('✅ Pedido encontrado:')
    console.log(`   ID: ${pedido.id}`)
    console.log(`   Preference ID: ${pedido.preference_id}`)
    console.log(`   Payment ID: ${pedido.payment_id || '(sin payment_id)'}`)
    console.log(`   Estado pago: ${pedido.estado_pago}`)
    console.log(`   Monto final: $${pedido.monto_final}`)
    console.log(`   ID Unidad: ${pedido.id_unidad}`)

    // 2. Verificar que existe la unidad
    if (pedido.id_unidad) {
      console.log('\n2️⃣ Verificando la unidad...')
      const { data: unidad, error: unidadError } = await supabase
        .from('unidades_producto')
        .select('*')
        .eq('id', pedido.id_unidad)
        .single()

      if (unidadError) {
        console.error('❌ Error al buscar la unidad:', unidadError)
      } else {
        console.log('✅ Unidad encontrada:')
        console.log(`   ID: ${unidad.id}`)
        console.log(`   Número de serie: ${unidad.numero_serie}`)
        console.log(`   Estado: ${unidad.estado}`)
      }
    }

    // 3. Probar la función marcar_unidad_vendida
    if (pedido.id_unidad && pedido.estado_pago === 'pendiente') {
      console.log('\n3️⃣ Probando función marcar_unidad_vendida...')
      const { data: resultado, error: marcarError } = await supabase
        .rpc('marcar_unidad_vendida', {
          p_id_unidad: pedido.id_unidad
        })

      if (marcarError) {
        console.error('❌ Error al marcar unidad como vendida:', marcarError)
      } else {
        console.log('✅ Función marcar_unidad_vendida ejecutada:', resultado)
      }
    }

    // 4. Probar actualización del pedido
    console.log('\n4️⃣ Probando actualización del pedido...')
    const { error: updateError } = await supabase
      .from('pedidos')
      .update({
        estado_pago: 'pagado',
        payment_id: 'TEST_PAYMENT_' + Date.now(),
        fecha_pago: new Date().toISOString(),
      })
      .eq('id', pedido.id)

    if (updateError) {
      console.error('❌ Error al actualizar pedido:', updateError)
      console.error('   Detalles:', JSON.stringify(updateError, null, 2))
    } else {
      console.log('✅ Pedido actualizado correctamente')

      // Verificar el cambio
      const { data: pedidoActualizado, error: verificarError } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', pedido.id)
        .single()

      if (!verificarError && pedidoActualizado) {
        console.log('\n📊 Estado del pedido después de actualizar:')
        console.log(`   Estado pago: ${pedidoActualizado.estado_pago}`)
        console.log(`   Payment ID: ${pedidoActualizado.payment_id}`)
        console.log(`   Fecha pago: ${pedidoActualizado.fecha_pago}`)
      }
    }

    // 5. Verificar stock
    console.log('\n5️⃣ Verificando stock...')
    const { data: stockData, error: stockError } = await supabase
      .rpc('obtener_stock_disponible', {
        p_id_producto: 1
      })

    if (stockError) {
      console.error('❌ Error al obtener stock:', stockError)
    } else if (stockData && stockData.length > 0) {
      const stock = stockData[0]
      console.log('✅ Stock actual:')
      console.log(`   Stock inicial: ${stock.stock_inicial}`)
      console.log(`   Vendidos: ${stock.vendidos}`)
      console.log(`   Disponibles: ${stock.disponibles}`)
      console.log(`   Reservados: ${stock.reservados}`)
    }

  } catch (error) {
    console.error('\n❌ Error inesperado:', error.message)
  }
}

testPaymentValidation()
