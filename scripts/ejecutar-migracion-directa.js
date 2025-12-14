const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const SUPABASE_URL = 'https://fhziabzxoqdxxzzgukfe.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoemlhYnp4b3FkeHh6emd1a2ZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI0MTkwMCwiZXhwIjoyMDc5ODE3OTAwfQ.GUkGGNQ7hgHWmc7cyf2cNPEX4i1ytWozoOYdO0gyemU'

async function ejecutarMigracion() {
  console.log('🚀 Ejecutando migración a estructura simplificada...\n')

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  try {
    // Leer el script SQL
    const sqlPath = path.join(__dirname, 'nueva-estructura-simplificada.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')

    console.log('📋 Script leído correctamente')
    console.log('📊 Tamaño:', sqlContent.length, 'caracteres\n')

    console.log('⚠️  IMPORTANTE: Ejecuta este script manualmente en Supabase Dashboard')
    console.log('1. Ve a: https://supabase.com/dashboard/project/fhziabzxoqdxxzzgukfe/sql')
    console.log('2. Copia el contenido de: scripts/nueva-estructura-simplificada.sql')
    console.log('3. Pégalo en el SQL Editor')
    console.log('4. Click en "Run"\n')

    console.log('💡 Alternativamente, aquí están los comandos SQL principales:\n')
    console.log('═'.repeat(80))
    console.log(sqlContent)
    console.log('═'.repeat(80))

    console.log('\n✅ Copia el SQL de arriba y ejecútalo en Supabase Dashboard')

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

ejecutarMigracion()
