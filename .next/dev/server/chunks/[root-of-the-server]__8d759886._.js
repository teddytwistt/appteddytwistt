module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/supabase/server-admin.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createAdminClient",
    ()=>createAdminClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$esm$2f$wrapper$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/esm/wrapper.mjs [app-route] (ecmascript)");
;
async function createAdminClient() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Missing Supabase environment variables for admin client");
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$esm$2f$wrapper$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[project]/lib/email/resend.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FROM_EMAIL",
    ()=>FROM_EMAIL,
    "resend",
    ()=>resend
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$resend$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/resend/dist/index.mjs [app-route] (ecmascript)");
;
const resend = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$resend$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Resend"](process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
}),
"[project]/lib/email/templates.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EmailConfirmacionCompra",
    ()=>EmailConfirmacionCompra,
    "EmailDatosEnvioRecibidos",
    ()=>EmailDatosEnvioRecibidos
]);
function EmailConfirmacionCompra({ nombreCliente, numeroPedido, numeroSerie, monto, zona, fechaPago }) {
    const fechaFormateada = new Date(fechaPago).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
    // Colores del sitio: turquesa/cyan como primary
    const primaryColor = "#00d4ff" // Turquesa brillante
    ;
    const accentColor = "#fbbf24" // Amarillo/dorado
    ;
    const darkColor = "#1a1a1a";
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
  `;
}
function EmailDatosEnvioRecibidos({ nombreCliente, numeroPedido, direccion, ciudad, provincia }) {
    const primaryColor = "#00d4ff";
    const accentColor = "#fbbf24";
    const darkColor = "#1a1a1a";
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
  `;
}
}),
"[project]/app/api/shipping/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server-admin.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$email$2f$resend$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/email/resend.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$email$2f$templates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/email/templates.ts [app-route] (ecmascript)");
;
;
;
;
async function POST(request) {
    try {
        const body = await request.json();
        const { payment_id, nombre_apellido, email, telefono, dni, provincia, ciudad, direccion_completa, comentarios, comprobante_url } = body;
        console.log("[v0] Shipping form received for payment_id:", payment_id);
        // Validar campos requeridos
        if (!payment_id || !nombre_apellido || !email || !telefono || !dni || !provincia || !ciudad || !direccion_completa) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Todos los campos son requeridos"
            }, {
                status: 400
            });
        }
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAdminClient"])();
        // Buscar el pedido por payment_id
        const { data: orderData, error: orderError } = await supabase.from("pedidos").select("*").eq("payment_id", payment_id).eq("estado_pago", "pagado").single();
        if (orderError || !orderData) {
            console.error("[shipping] Order not found:", orderError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Pedido no encontrado o no pagado"
            }, {
                status: 404
            });
        }
        console.log("[shipping] Order found:", orderData.id);
        // Verificar que el pedido no tenga ya un cliente asignado
        if (orderData.id_cliente) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "El formulario ya fue completado para este pedido"
            }, {
                status: 400
            });
        }
        // Obtener el número de serie de la unidad
        let numeroSerie = null;
        if (orderData.id_unidad) {
            const { data: unidad } = await supabase.from("unidades_producto").select("numero_serie").eq("id", orderData.id_unidad).single();
            numeroSerie = unidad?.numero_serie;
        }
        // Crear el cliente con los datos del formulario
        const { data: clienteData, error: clienteError } = await supabase.from("clientes").insert({
            nombre_apellido,
            email,
            telefono,
            dni,
            provincia,
            ciudad,
            direccion_completa
        }).select().single();
        if (clienteError) {
            console.error("[shipping] Error creating client:", clienteError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Error al guardar los datos del cliente"
            }, {
                status: 500
            });
        }
        console.log("[shipping] Client created:", clienteData.id);
        // Actualizar el pedido vinculándolo al cliente y agregando comentarios
        const { error: updateError } = await supabase.from("pedidos").update({
            id_cliente: clienteData.id,
            comentarios: comentarios || null
        }).eq("id", orderData.id);
        if (updateError) {
            console.error("[v0] Error updating shipping info:", updateError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Error al guardar los datos de envío"
            }, {
                status: 500
            });
        }
        console.log("[v0] Order updated successfully");
        // Enviar emails de confirmación al cliente
        try {
            // Email de confirmación de compra
            const htmlConfirmacion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$email$2f$templates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EmailConfirmacionCompra"])({
                nombreCliente: nombre_apellido,
                numeroPedido: orderData.id,
                numeroSerie: numeroSerie || undefined,
                monto: orderData.monto_final,
                zona: orderData.zona,
                fechaPago: orderData.fecha_pago || new Date().toISOString()
            });
            // Email de confirmación de datos de envío
            const htmlEnvio = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$email$2f$templates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EmailDatosEnvioRecibidos"])({
                nombreCliente: nombre_apellido,
                numeroPedido: orderData.id,
                direccion: direccion_completa,
                ciudad: ciudad,
                provincia: provincia
            });
            // Enviar ambos emails
            await Promise.all([
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$email$2f$resend$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resend"].emails.send({
                    from: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$email$2f$resend$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FROM_EMAIL"],
                    to: email,
                    subject: `¡Compra Confirmada! Pedido #${orderData.id} - Buzzy Twist`,
                    html: htmlConfirmacion
                }),
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$email$2f$resend$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resend"].emails.send({
                    from: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$email$2f$resend$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FROM_EMAIL"],
                    to: email,
                    subject: `Datos de Envío Recibidos - Pedido #${orderData.id}`,
                    html: htmlEnvio
                })
            ]);
            console.log("[shipping] Confirmation emails sent successfully to:", email);
        } catch (emailError) {
            console.error("[shipping] Error sending confirmation emails:", emailError);
        // No bloqueamos el proceso si falla el envío de email
        }
        // Enviar a Google Sheets
        let sheetsSuccess = false;
        let sheetsError = null;
        try {
            await sendToGoogleSheets({
                ...orderData,
                nombre_apellido,
                email,
                telefono,
                dni,
                provincia,
                ciudad,
                direccion_completa,
                comentarios,
                comprobante_url,
                numero_serie: numeroSerie
            });
            sheetsSuccess = true;
            console.log("[v0] Data sent to Google Sheets successfully");
        } catch (error) {
            sheetsError = error;
            console.error("[v0] Error sending to Google Sheets:", error);
        // No bloqueamos el proceso si falla Google Sheets
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: "Datos de envío guardados correctamente",
            pedido_id: orderData.id,
            cliente_id: clienteData.id,
            sheets_status: sheetsSuccess ? "sent" : "failed",
            sheets_error: sheetsError ? String(sheetsError) : null
        });
    } catch (error) {
        console.error("[v0] Shipping form error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Error al procesar los datos de envío",
            details: String(error)
        }, {
            status: 500
        });
    }
}
async function sendToGoogleSheets(orderData) {
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    if (!webhookUrl) {
        const errorMsg = "Google Sheets webhook URL not configured (GOOGLE_SHEETS_WEBHOOK_URL)";
        console.error("[v0]", errorMsg);
        throw new Error(errorMsg);
    }
    console.log("[v0] 📤 Sending to Google Sheets webhook...");
    console.log("[v0] Webhook URL:", webhookUrl);
    const payload = {
        fecha_hora: new Date().toISOString(),
        pedido_id: orderData.id || "",
        payment_id: orderData.payment_id || "",
        preference_id: orderData.preference_id || "",
        zona: orderData.zona === "cba" ? "Córdoba Capital" : "Interior",
        monto_original: orderData.monto_original || 0,
        monto_descuento: orderData.monto_descuento || 0,
        monto_final: orderData.monto_final || 0,
        porcentaje_descuento: orderData.porcentaje_descuento || 0,
        numero_serie: orderData.numero_serie || "",
        estado_pago: orderData.estado_pago || "",
        nombre_apellido: orderData.nombre_apellido || "",
        email: orderData.email || "",
        telefono: orderData.telefono || "",
        dni: orderData.dni || "",
        provincia: orderData.provincia || "",
        ciudad: orderData.ciudad || "",
        direccion_completa: orderData.direccion_completa || "",
        comentarios: orderData.comentarios || "",
        estado_envio: orderData.estado_envio || "pendiente"
    };
    console.log("[v0] 📦 Payload:", JSON.stringify(payload, null, 2));
    try {
        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
            redirect: "follow"
        });
        console.log("[v0] 📊 Response status:", response.status);
        console.log("[v0] 📊 Response headers:", Object.fromEntries(response.headers.entries()));
        const responseText = await response.text();
        console.log("[v0] 📊 Response body:", responseText);
        if (!response.ok) {
            throw new Error(`Google Sheets webhook returned ${response.status}: ${responseText}`);
        }
        // Try to parse JSON response
        try {
            const jsonResponse = JSON.parse(responseText);
            console.log("[v0] 📋 Parsed JSON:", jsonResponse);
            if (!jsonResponse.success) {
                throw new Error(`Google Sheets returned success=false: ${jsonResponse.error || "Unknown error"}`);
            }
        } catch (parseError) {
            // If it's not JSON, check if it's HTML (common error from Google)
            if (responseText.includes("<!DOCTYPE html>") || responseText.includes("<html")) {
                console.error("[v0] ⚠️ Received HTML instead of JSON - Script may not be properly deployed");
                throw new Error("Google Sheets script not properly deployed as Web App. Please check deployment settings.");
            }
            // If status is 200 and it's not HTML, accept it
            console.log("[v0] ℹ️ Response is not JSON but status is OK");
        }
        console.log("[v0] ✅ Successfully sent to Google Sheets");
        return true;
    } catch (error) {
        console.error("[v0] ❌ Failed to send to Google Sheets:", error);
        if (error instanceof Error) {
            console.error("[v0] Error message:", error.message);
            console.error("[v0] Error stack:", error.stack);
        }
        throw error;
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__8d759886._.js.map