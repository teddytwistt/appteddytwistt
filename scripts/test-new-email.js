#!/usr/bin/env node

/**
 * Script para probar el nuevo email unificado
 */

const { Resend } = require('resend')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

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

async function testNewEmail() {
  console.log('🧪 PROBANDO NUEVO EMAIL UNIFICADO\n')
  console.log('=' .repeat(60))

  // Verificar configuración
  if (!apiKey || apiKey === 'tu_api_key_aqui') {
    console.error('❌ RESEND_API_KEY no configurada')
    process.exit(1)
  }

  console.log('✅ RESEND_API_KEY configurada')
  console.log('✅ FROM_EMAIL:', fromEmail)

  // Pedir email del usuario
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const email = await new Promise(resolve => {
    rl.question('\n📧 Ingresa tu email para recibir el test: ', resolve)
  })
  rl.close()

  if (!email || !email.includes('@')) {
    console.error('\n❌ Email inválido')
    process.exit(1)
  }

  console.log('\n📋 DATOS DE PRUEBA:')
  console.log('  Cliente: Juan Pérez')
  console.log('  Pedido: #0042')
  console.log('  Serie: 123/900')
  console.log('  Monto: $27,000')
  console.log('  Zona: Córdoba Capital')
  console.log('  Dirección: Av. Colón 1234, Córdoba, Córdoba')

  // Importar el template (requiere compilación, usaremos inline)
  console.log('\n📤 Enviando email de prueba...')

  const resend = new Resend(apiKey)

  // Template inline simplificado para prueba
  const htmlEmail = generateEmailHTML()

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: '🎉 ¡Compra Confirmada! Pedido #0042 - BUZZY × TEDDYTWIST [TEST]',
      html: htmlEmail,
    })

    if (error) {
      console.error('\n❌ Error al enviar:', error)
      process.exit(1)
    }

    console.log('\n✅ Email enviado exitosamente!')
    console.log('   ID:', data.id)
    console.log('\n📬 Revisá tu bandeja de entrada (y spam) en:', email)
    console.log('\n💡 Dashboard de Resend: https://resend.com/emails')
  } catch (err) {
    console.error('\n❌ Error:', err.message)
    process.exit(1)
  }
}

function generateEmailHTML() {
  const primaryColor = "#00d4ff"
  const accentColor = "#fbbf24"
  const darkColor = "#1a1a1a"

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>¡Compra Confirmada! - BUZZY × TEDDYTWIST</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;900&display=swap');

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background-color: #f5f5f5;
          }

          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }

          .header {
            background: linear-gradient(135deg, ${primaryColor} 0%, ${darkColor} 100%);
            padding: 50px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }

          .logo {
            position: relative;
            z-index: 1;
            font-size: 56px;
            font-weight: 900;
            color: white;
            letter-spacing: -3px;
            margin: 0;
            text-transform: uppercase;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
          }

          .logo-subtitle {
            position: relative;
            z-index: 1;
            color: white;
            font-size: 20px;
            font-weight: 700;
            margin-top: 10px;
          }

          .badge {
            position: relative;
            z-index: 1;
            display: inline-block;
            background: ${accentColor};
            color: ${darkColor};
            padding: 10px 24px;
            border-radius: 50px;
            font-size: 13px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-top: 20px;
            box-shadow: 0 4px 15px rgba(251, 191, 36, 0.4);
          }

          .content {
            padding: 50px 30px;
          }

          .success-icon {
            text-align: center;
            font-size: 80px;
            margin-bottom: 25px;
          }

          .title {
            font-size: 32px;
            font-weight: 900;
            color: ${darkColor};
            text-align: center;
            margin: 0 0 15px 0;
            letter-spacing: -1.5px;
          }

          .subtitle {
            font-size: 18px;
            color: #666;
            text-align: center;
            margin: 0 0 40px 0;
            line-height: 1.6;
          }

          .card {
            background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
            border: 2px solid #e5e7eb;
            border-radius: 20px;
            padding: 30px;
            margin: 30px 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }

          .card-title {
            color: ${darkColor};
            font-size: 20px;
            font-weight: 800;
            margin: 0 0 20px 0;
          }

          .total-section {
            background: linear-gradient(135deg, ${primaryColor} 0%, #0ea5e9 100%);
            padding: 30px;
            border-radius: 16px;
            margin-top: 20px;
            text-align: center;
            box-shadow: 0 6px 20px rgba(0, 212, 255, 0.3);
          }

          .total-amount {
            color: white;
            font-size: 48px;
            font-weight: 900;
            margin: 0;
            letter-spacing: -2px;
          }

          .footer {
            background-color: ${darkColor};
            color: #9ca3af;
            text-align: center;
            padding: 40px 30px;
            font-size: 13px;
          }

          .footer-title {
            color: white;
            font-weight: 900;
            font-size: 20px;
            margin: 0 0 10px 0;
            letter-spacing: 2px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">BUZZY</h1>
            <p class="logo-subtitle">× TEDDYTWIST</p>
            <div class="badge">EDICIÓN LIMITADA</div>
          </div>

          <div class="content">
            <div class="success-icon">🎉</div>
            <h2 class="title">¡Compra Confirmada!</h2>
            <p class="subtitle">
              Hola <strong>Juan Pérez</strong>,<br>
              Tu pago ha sido confirmado exitosamente. ¡Ya sos parte de la edición limitada!
            </p>

            <div class="card">
              <div class="card-title">📦 Detalles de tu Pedido</div>
              <p style="margin: 10px 0;">Pedido: <strong>#0042</strong></p>
              <p style="margin: 10px 0;">Serie: <strong>123/900</strong></p>
              <p style="margin: 10px 0;">Zona: <strong>🎉 Córdoba Capital - GRATIS</strong></p>

              <div class="total-section">
                <p class="total-amount">$27,000</p>
              </div>
            </div>

            <div class="card">
              <div class="card-title">🚚 Datos de Envío</div>
              <p style="margin: 10px 0;"><strong>Nombre:</strong> Juan Pérez</p>
              <p style="margin: 10px 0;"><strong>Dirección:</strong> Av. Colón 1234</p>
              <p style="margin: 10px 0;"><strong>Localidad:</strong> Córdoba, Córdoba</p>
            </div>

            <p style="text-align: center; color: #666; font-size: 15px; margin-top: 40px;">
              ¿Dudas? Contáctanos por WhatsApp 💬
            </p>
          </div>

          <div class="footer">
            <p class="footer-title">BUZZY × TEDDYTWIST</p>
            <p style="margin: 20px 0 0 0; font-size: 11px;">
              Este es un email de prueba del nuevo template<br>
              © ${new Date().getFullYear()} TEDDYTWIST
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}

testNewEmail()
