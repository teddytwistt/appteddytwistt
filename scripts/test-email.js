#!/usr/bin/env node

/**
 * Script para probar el envío de emails con Resend
 * Verifica que la configuración esté correcta
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

async function testEmail() {
  console.log('📧 Probando configuración de Resend...\n')

  // Verificar API key
  if (!apiKey || apiKey === 'tu_api_key_aqui') {
    console.error('❌ Error: RESEND_API_KEY no está configurada correctamente')
    console.error('   Por favor, actualiza .env.local con tu API key de Resend')
    process.exit(1)
  }

  console.log('✅ API Key encontrada')
  console.log(`✅ Email de envío: ${fromEmail}\n`)

  const resend = new Resend(apiKey)

  try {
    // Enviar email de prueba
    console.log('📤 Enviando email de prueba...')

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: 'delivered@resend.dev', // Email de prueba de Resend
      subject: 'Prueba de Configuración - Buzzy Twist',
      html: `
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
                padding: 20px;
                border-radius: 10px;
                text-align: center;
              }
              .content {
                background: #f9fafb;
                padding: 20px;
                border-radius: 10px;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🎉 ¡Configuración Exitosa!</h1>
            </div>
            <div class="content">
              <p><strong>¡Felicitaciones!</strong></p>
              <p>Tu configuración de Resend está funcionando correctamente.</p>
              <p>Los emails de confirmación de compra se enviarán automáticamente a tus clientes.</p>
              <hr>
              <p style="color: #666; font-size: 14px;">
                Este es un email de prueba enviado desde Buzzy Twist.<br>
                Fecha: ${new Date().toLocaleString('es-AR')}
              </p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('❌ Error al enviar email:', error)
      process.exit(1)
    }

    console.log('\n✅ ¡Email enviado exitosamente!')
    console.log(`   ID del email: ${data.id}`)
    console.log('\n📝 Notas:')
    console.log('   - El email de prueba fue enviado a "delivered@resend.dev"')
    console.log('   - Este es un email especial de Resend que siempre se marca como entregado')
    console.log('   - Puedes ver el email en el dashboard de Resend')
    console.log('\n💡 Próximo paso:')
    console.log('   Haz una compra de prueba en tu aplicación para ver los emails reales')
    console.log('   que recibirán tus clientes.')

  } catch (error) {
    console.error('\n❌ Error inesperado:', error.message)
    if (error.message.includes('API key')) {
      console.error('\n💡 Sugerencia: Verifica que tu API key sea correcta')
      console.error('   Ve a https://resend.com/api-keys para revisar tus claves')
    }
    process.exit(1)
  }
}

testEmail()
