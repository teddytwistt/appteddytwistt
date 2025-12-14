#!/usr/bin/env node

/**
 * Script para probar que la función obtener_stock_disponible funciona correctamente
 */

const { createClient } = require('@supabase/supabase-js')
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

const supabaseUrl = envVars.SUPABASE_URL
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function testStock() {
  console.log('🧪 Probando la función obtener_stock_disponible...\n')

  try {
    const { data: stockData, error: stockError } = await supabase
      .rpc('obtener_stock_disponible', {
        p_id_producto: 1
      })

    if (stockError) {
      console.error('❌ Error al obtener stock:', stockError)
      process.exit(1)
    }

    if (!stockData || stockData.length === 0) {
      console.error('❌ No se encontraron datos de stock')
      process.exit(1)
    }

    const stock = stockData[0]
    console.log('✅ Stock obtenido exitosamente:\n')
    console.log('📊 Detalles del stock:')
    console.log(`   Stock inicial: ${stock.stock_inicial}`)
    console.log(`   Vendidos: ${stock.vendidos}`)
    console.log(`   Disponibles: ${stock.disponibles}`)
    console.log(`   Reservados: ${stock.reservados}`)
    console.log(`   Display: ${stock.disponibles}/${stock.stock_inicial}`)

    if (stock.disponibles > 0) {
      console.log('\n✅ Hay stock disponible. El checkout debería funcionar correctamente.')
    } else {
      console.log('\n⚠️  No hay stock disponible. El checkout mostrará "Producto agotado".')
    }

  } catch (error) {
    console.error('\n❌ Error inesperado:', error.message)
    process.exit(1)
  }
}

testStock()
