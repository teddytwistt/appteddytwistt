#!/usr/bin/env node

/**
 * Script para simular un pago exitoso
 * Marca el pedido más reciente como pagado
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
const { getArgentinaTimestamp } = require('../lib/utils/timezone')

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

async function simularPagoExitoso() {
  console.log('💰 Simulando pago exitoso...\n')

  try {
    // 1. Buscar el pedido más reciente con estado pendiente
    console.log('1️⃣ Buscando pedido pendiente más reciente...')
    const { data: pedidos, error: pedidosError } = await supabase
      .from('pedidos')
      .select('*')
      .eq('estado_pago', 'pendiente')
      .order('fecha_creacion', { ascending: false })
      .limit(1)

    if (pedidosError) {
      console.error('❌ Error al buscar pedidos:', pedidosError)
      return
    }

    if (!pedidos || pedidos.length === 0) {
      console.log('⚠️  No hay pedidos pendientes')
      console.log('💡 Crea un nuevo pedido usando el flujo de checkout primero')
      return
    }

    const pedido = pedidos[0]
    console.log('✅ Pedido encontrado:')
    console.log(`   ID: ${pedido.id}`)
    console.log(`   Preference ID: ${pedido.preference_id}`)
    console.log(`   Estado: ${pedido.estado_pago}`)
    console.log(`   Monto: $${pedido.monto_final}`)
    console.log(`   ID Unidad: ${pedido.id_unidad}`)

    // 2. Marcar la unidad como vendida
    if (pedido.id_unidad) {
      console.log('\n2️⃣ Marcando unidad como vendida...')
      const { data: resultado, error: marcarError } = await supabase
        .rpc('marcar_unidad_vendida', {
          p_id_unidad: pedido.id_unidad
        })

      if (marcarError) {
        console.error('❌ Error al marcar unidad:', marcarError)
      } else {
        console.log('✅ Unidad marcada como vendida:', resultado)
      }
    }

    // 3. Actualizar el pedido como pagado
    console.log('\n3️⃣ Actualizando pedido como pagado...')
    const paymentId = 'SIMULATED_PAYMENT_' + Date.now()

    const { error: updateError } = await supabase
      .from('pedidos')
      .update({
        estado_pago: 'pagado',
        payment_id: paymentId,
        fecha_pago: getArgentinaTimestamp(),
        mp_response: {
          simulated: true,
          status: 'approved',
          transaction_amount: pedido.monto_final
        }
      })
      .eq('id', pedido.id)

    if (updateError) {
      console.error('❌ Error al actualizar pedido:', updateError)
      return
    }

    console.log('✅ Pedido actualizado como pagado')
    console.log(`   Payment ID: ${paymentId}`)

    // 4. Verificar el cambio
    console.log('\n4️⃣ Verificando el pedido actualizado...')
    const { data: pedidoActualizado, error: verificarError } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', pedido.id)
      .single()

    if (!verificarError && pedidoActualizado) {
      console.log('✅ Pedido verificado:')
      console.log(`   Estado pago: ${pedidoActualizado.estado_pago}`)
      console.log(`   Payment ID: ${pedidoActualizado.payment_id}`)
      console.log(`   Fecha pago: ${pedidoActualizado.fecha_pago}`)
    }

    // 5. Mostrar stock actualizado
    console.log('\n5️⃣ Stock actualizado:')
    const { data: stockData, error: stockError } = await supabase
      .rpc('obtener_stock_disponible', {
        p_id_producto: 1
      })

    if (!stockError && stockData && stockData.length > 0) {
      const stock = stockData[0]
      console.log(`   Stock inicial: ${stock.stock_inicial}`)
      console.log(`   Vendidos: ${stock.vendidos}`)
      console.log(`   Disponibles: ${stock.disponibles}`)
      console.log(`   Reservados: ${stock.reservados}`)
    }

    console.log('\n✅ ¡Pago simulado exitosamente!')
    console.log('\n💡 Ahora puedes:')
    console.log('   1. Recargar el panel de administrador para ver las estadísticas actualizadas')
    console.log('   2. Cambiar el estado de envío del pedido a "enviado" o "entregado"')

  } catch (error) {
    console.error('\n❌ Error inesperado:', error.message)
  }
}

simularPagoExitoso()
