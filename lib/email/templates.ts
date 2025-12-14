interface EmailConfirmacionCompraProps {
  nombreCliente: string
  numeroPedido: number
  numeroSerie?: number
  monto: number
  zona: "cba" | "interior"
  fechaPago: string
}

export function EmailConfirmacionCompra({
  nombreCliente,
  numeroPedido,
  numeroSerie,
  monto,
  zona,
  fechaPago,
}: EmailConfirmacionCompraProps): string {
  const fechaFormateada = new Date(fechaPago).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  // Colores del sitio: turquesa/cyan como primary
  const primaryColor = "#00d4ff"  // Turquesa brillante
  const accentColor = "#fbbf24"   // Amarillo/dorado
  const darkColor = "#1a1a1a"

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>¡Compra Confirmada! - BUZZY × TEDDYTWIST</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');

          body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f5f5;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
          }
          .header {
            background: linear-gradient(135deg, ${primaryColor} 0%, ${darkColor} 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              rgba(255,255,255,0.1) 35px,
              rgba(255,255,255,0.1) 37px
            );
            animation: slide 20s linear infinite;
          }
          @keyframes slide {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, 50px); }
          }
          .logo {
            position: relative;
            z-index: 1;
            font-size: 48px;
            font-weight: 900;
            color: white;
            letter-spacing: -2px;
            margin: 0;
            text-transform: uppercase;
          }
          .logo-subtitle {
            position: relative;
            z-index: 1;
            color: white;
            font-size: 18px;
            font-weight: 600;
            margin-top: 8px;
            opacity: 0.95;
          }
          .badge {
            display: inline-block;
            background: linear-gradient(135deg, ${accentColor} 0%, #f59e0b 100%);
            color: ${darkColor};
            padding: 8px 20px;
            border-radius: 50px;
            font-size: 12px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 15px;
            box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
          }
          .content {
            padding: 40px 30px;
          }
          .success-icon {
            text-align: center;
            font-size: 72px;
            margin-bottom: 20px;
          }
          .title {
            font-size: 28px;
            font-weight: 900;
            color: ${darkColor};
            text-align: center;
            margin: 0 0 15px 0;
            letter-spacing: -1px;
          }
          .subtitle {
            font-size: 16px;
            color: #666;
            text-align: center;
            margin: 0 0 30px 0;
            line-height: 1.5;
          }
          .card {
            background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
            border: 2px solid #e5e7eb;
            border-radius: 16px;
            padding: 25px;
            margin: 25px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .label {
            color: #6b7280;
            font-size: 14px;
            font-weight: 600;
          }
          .value {
            color: ${darkColor};
            font-size: 16px;
            font-weight: 700;
            text-align: right;
          }
          .serie-badge {
            background: linear-gradient(135deg, ${primaryColor} 0%, #0ea5e9 100%);
            color: white;
            padding: 6px 16px;
            border-radius: 25px;
            font-size: 18px;
            font-weight: 900;
            display: inline-block;
            box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
          }
          .total-section {
            background: linear-gradient(135deg, ${primaryColor} 0%, ${darkColor} 100%);
            padding: 25px;
            border-radius: 12px;
            margin-top: 15px;
          }
          .total-label {
            color: white;
            font-size: 16px;
            font-weight: 600;
            text-align: center;
            margin: 0;
          }
          .total-amount {
            color: white;
            font-size: 42px;
            font-weight: 900;
            text-align: center;
            margin: 10px 0 0 0;
            letter-spacing: -2px;
          }
          .highlight-box {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border-left: 4px solid #10b981;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
          }
          .highlight-title {
            color: #065f46;
            font-size: 16px;
            font-weight: 700;
            margin: 0 0 10px 0;
          }
          .highlight-text {
            color: #047857;
            font-size: 14px;
            margin: 0;
            line-height: 1.6;
          }
          .product-image {
            width: 100%;
            max-width: 300px;
            margin: 0 auto 30px;
            display: block;
            border-radius: 12px;
          }
          .footer {
            background-color: #1a1a1a;
            color: #9ca3af;
            text-align: center;
            padding: 30px;
            font-size: 12px;
          }
          .footer-link {
            color: ${primaryColor};
            text-decoration: none;
          }
          .social-links {
            margin: 20px 0;
          }
          .social-link {
            display: inline-block;
            margin: 0 10px;
            color: ${primaryColor};
            font-size: 14px;
            text-decoration: none;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1 class="logo">BUZZY</h1>
            <p class="logo-subtitle">× TEDDYTWIST</p>
            <div class="badge">EDICIÓN LIMITADA</div>
          </div>

          <!-- Content -->
          <div class="content">
            <div class="success-icon">✨</div>
            <h2 class="title">¡Compra Confirmada!</h2>
            <p class="subtitle">
              Hola <strong>${nombreCliente}</strong>,<br>
              Tu pago ha sido confirmado exitosamente
            </p>

            <!-- Product Info Card -->
            <div class="card">
              <div class="detail-row">
                <span class="label">Pedido</span>
                <span class="value">#${String(numeroPedido).padStart(4, '0')}</span>
              </div>

              ${numeroSerie ? `
                <div class="detail-row">
                  <span class="label">Número de Serie</span>
                  <span class="serie-badge">${String(numeroSerie).padStart(3, "0")}/900</span>
                </div>
              ` : ''}

              <div class="detail-row">
                <span class="label">Fecha</span>
                <span class="value">${fechaFormateada}</span>
              </div>

              <div class="detail-row">
                <span class="label">Envío</span>
                <span class="value">
                  ${zona === "cba" ? "🎉 Córdoba - GRATIS" : "📦 Resto del país"}
                </span>
              </div>

              <!-- Total -->
              <div class="total-section">
                <p class="total-label">Total Pagado</p>
                <p class="total-amount">$${monto.toLocaleString("es-AR")}</p>
              </div>
            </div>

            <!-- Next Steps -->
            <div class="highlight-box">
              <p class="highlight-title">📦 Próximos Pasos</p>
              <p class="highlight-text">
                Tu BUZZY será enviado en los próximos 3-5 días hábiles.<br>
                Te notificaremos por email cuando tu pedido sea despachado con el número de seguimiento.
              </p>
            </div>

            <p style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
              ¿Dudas? Contáctanos y te ayudamos 💬
            </p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p style="margin: 0 0 15px 0; color: white; font-weight: 700;">BUZZY × TEDDYTWIST</p>
            <p style="margin: 5px 0;">Edición Limitada 900 Unidades</p>

            <div class="social-links">
              <a href="https://www.instagram.com/teddytwist.ok" class="social-link">Instagram</a>
            </div>

            <p style="margin: 15px 0 0 0; font-size: 11px;">
              Este es un correo automático de confirmación de compra.<br>
              © ${new Date().getFullYear()} TEDDYTWIST. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}

interface EmailDatosEnvioProps {
  nombreCliente: string
  numeroPedido: number
  direccion: string
  ciudad: string
  provincia: string
}

export function EmailDatosEnvioRecibidos({
  nombreCliente,
  numeroPedido,
  direccion,
  ciudad,
  provincia,
}: EmailDatosEnvioProps): string {
  const primaryColor = "#00d4ff"
  const accentColor = "#fbbf24"
  const darkColor = "#1a1a1a"

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Datos de Envío Recibidos - BUZZY × TEDDYTWIST</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');

          body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f5f5;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
          }
          .header {
            background: linear-gradient(135deg, ${primaryColor} 0%, ${darkColor} 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              rgba(255,255,255,0.1) 35px,
              rgba(255,255,255,0.1) 37px
            );
          }
          .logo {
            position: relative;
            z-index: 1;
            font-size: 48px;
            font-weight: 900;
            color: white;
            letter-spacing: -2px;
            margin: 0;
            text-transform: uppercase;
          }
          .icon {
            font-size: 64px;
            margin: 20px 0;
            position: relative;
            z-index: 1;
          }
          .content {
            padding: 40px 30px;
          }
          .title {
            font-size: 28px;
            font-weight: 900;
            color: ${darkColor};
            text-align: center;
            margin: 0 0 15px 0;
            letter-spacing: -1px;
          }
          .subtitle {
            font-size: 16px;
            color: #666;
            text-align: center;
            margin: 0 0 30px 0;
            line-height: 1.5;
          }
          .card {
            background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
            border: 2px solid #e5e7eb;
            border-radius: 16px;
            padding: 25px;
            margin: 25px 0;
          }
          .address-title {
            color: ${darkColor};
            font-size: 18px;
            font-weight: 700;
            margin: 0 0 15px 0;
          }
          .pedido-number {
            background: linear-gradient(135deg, ${accentColor} 0%, #f59e0b 100%);
            color: ${darkColor};
            padding: 8px 16px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 900;
            display: inline-block;
            margin-bottom: 20px;
          }
          .address-line {
            color: #374151;
            font-size: 16px;
            line-height: 1.8;
            margin: 5px 0;
          }
          .address-city {
            color: #6b7280;
            font-size: 14px;
            margin-top: 10px;
          }
          .info-box {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border-left: 4px solid #3b82f6;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
          }
          .info-text {
            color: #1e40af;
            font-size: 14px;
            margin: 0;
            line-height: 1.6;
          }
          .footer {
            background-color: #1a1a1a;
            color: #9ca3af;
            text-align: center;
            padding: 30px;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="icon">📍</div>
            <h1 class="logo">BUZZY</h1>
          </div>

          <!-- Content -->
          <div class="content">
            <h2 class="title">Datos de Envío Recibidos</h2>
            <p class="subtitle">
              Hola <strong>${nombreCliente}</strong>,<br>
              Hemos confirmado tu dirección de envío
            </p>

            <!-- Address Card -->
            <div class="card">
              <div class="pedido-number">Pedido #${String(numeroPedido).padStart(4, '0')}</div>

              <p class="address-title">📦 Dirección de Envío</p>
              <p class="address-line"><strong>${direccion}</strong></p>
              <p class="address-city">${ciudad}, ${provincia}</p>
            </div>

            <!-- Info Box -->
            <div class="info-box">
              <p class="info-text">
                <strong>🚚 Tu BUZZY está en camino</strong><br><br>
                Prepararemos tu pedido con mucho cuidado y te notificaremos cuando sea despachado con el número de seguimiento.
                <br><br>
                Tiempo estimado de entrega: 3-5 días hábiles
              </p>
            </div>

            <p style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
              ¡Gracias por tu compra! 🎉
            </p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p style="margin: 0 0 15px 0; color: white; font-weight: 700;">BUZZY × TEDDYTWIST</p>
            <p style="margin: 15px 0 0 0; font-size: 11px;">
              © ${new Date().getFullYear()} TEDDYTWIST. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}
