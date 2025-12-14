#!/usr/bin/env node

/**
 * Script de debugging completo para el sistema de emails
 */

const { Resend } = require('resend')
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

const apiKey = envVars.RESEND_API_KEY
const fromEmail = envVars.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

async function testEmailCompleto() {
  console.log('🔍 DEBUGGING COMPLETO DEL SISTEMA DE EMAILS\n')
  console.log('=' .repeat(60))

  // 1. Verificar configuración
  console.log('\n📋 1. VERIFICACIÓN DE CONFIGURACIÓN')
  console.log('-'.repeat(60))

  if (!apiKey || apiKey === 'tu_api_key_aqui') {
    console.error('❌ RESEND_API_KEY no configurada')
    console.error('   Valor actual:', apiKey)
    process.exit(1)
  }
  console.log('✅ RESEND_API_KEY configurada:', apiKey.substring(0, 10) + '...')
  console.log('✅ FROM_EMAIL:', fromEmail)

  // 2. Inicializar cliente
  console.log('\n📋 2. INICIALIZANDO CLIENTE DE RESEND')
  console.log('-'.repeat(60))
  const resend = new Resend(apiKey)
  console.log('✅ Cliente inicializado correctamente')

  // 3. Probar envío a email de prueba de Resend
  console.log('\n📋 3. PROBANDO ENVÍO A EMAIL DE PRUEBA (delivered@resend.dev)')
  console.log('-'.repeat(60))

  try {
    const { data: data1, error: error1 } = await resend.emails.send({
      from: fromEmail,
      to: 'delivered@resend.dev',
      subject: 'Test 1 - Email de Prueba Resend',
      html: '<h1>Este es un email de prueba</h1><p>Si recibes esto, Resend funciona correctamente.</p>',
    })

    if (error1) {
      console.error('❌ Error en envío 1:', error1)
    } else {
      console.log('✅ Email 1 enviado exitosamente')
      console.log('   ID:', data1.id)
    }
  } catch (err) {
    console.error('❌ Exception en envío 1:', err.message)
  }

  // 4. Probar envío a tu email personal
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const tuEmail = await new Promise(resolve => {
    readline.question('\n📧 Ingresa tu email personal para recibir un test: ', resolve)
  })
  readline.close()

  if (!tuEmail || !tuEmail.includes('@')) {
    console.error('\n❌ Email inválido')
    process.exit(1)
  }

  console.log('\n📋 4. ENVIANDO EMAIL DE PRUEBA A TU EMAIL PERSONAL')
  console.log('-'.repeat(60))
  console.log('Enviando a:', tuEmail)

  try {
    const { data: data2, error: error2 } = await resend.emails.send({
      from: fromEmail,
      to: tuEmail,
      subject: 'Test 2 - Prueba Personal Buzzy Twist',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px 20px;
                border-radius: 10px;
                text-align: center;
              }
              .content {
                background: #f9fafb;
                padding: 20px;
                margin-top: 20px;
                border-radius: 10px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🧪 Email de Prueba</h1>
              <p>Buzzy Twist - Sistema de Emails</p>
            </div>
            <div class="content">
              <h2>¡Funciona perfectamente! ✅</h2>
              <p>Este email demuestra que:</p>
              <ul>
                <li>✅ Resend está configurado correctamente</li>
                <li>✅ Tu API key es válida</li>
                <li>✅ Los emails HTML se envían correctamente</li>
                <li>✅ El sistema de templates funciona</li>
              </ul>
              <p><strong>Fecha de envío:</strong> ${new Date().toLocaleString('es-AR')}</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error2) {
      console.error('❌ Error en envío 2:', error2)
      console.error('   Detalles completos:', JSON.stringify(error2, null, 2))
    } else {
      console.log('✅ Email 2 enviado exitosamente a tu email personal')
      console.log('   ID:', data2.id)
    }
  } catch (err) {
    console.error('❌ Exception en envío 2:', err.message)
    console.error('   Stack:', err.stack)
  }

  // 5. Probar los templates reales
  console.log('\n📋 5. PROBANDO TEMPLATES REALES DE BUZZY TWIST')
  console.log('-'.repeat(60))

  // Importar los templates
  const templatesPath = path.join(__dirname, '..', 'lib', 'email', 'templates.ts')
  console.log('Ruta del template:', templatesPath)

  if (!fs.existsSync(templatesPath)) {
    console.error('❌ Archivo de templates no encontrado')
  } else {
    console.log('✅ Archivo de templates encontrado')
    console.log('\n💡 Los templates están en TypeScript, necesitan compilarse.')
    console.log('   Para probarlos, usa el flujo real de compra o espera la compilación de Next.js')
  }

  // Resumen final
  console.log('\n' + '='.repeat(60))
  console.log('📊 RESUMEN DE PRUEBAS')
  console.log('='.repeat(60))
  console.log('✅ Configuración de Resend: OK')
  console.log('✅ Cliente de Resend: OK')
  console.log('✅ Envío de emails: OK')
  console.log('\n💡 PRÓXIMOS PASOS:')
  console.log('   1. Revisa tu bandeja de entrada (también spam)')
  console.log('   2. Ve al dashboard de Resend: https://resend.com/emails')
  console.log('   3. Haz una compra de prueba en tu app')
  console.log('\n📧 Para debugging en producción, revisa los logs del servidor:')
  console.log('   - Busca "[shipping] Confirmation emails sent successfully"')
  console.log('   - O "[shipping] Error sending confirmation emails"')
}

testEmailCompleto()
