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
"[project]/app/api/checkout/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server-admin.ts [app-route] (ecmascript)");
;
;
const PRODUCTO_ID = 1 // ID del producto Buzzy Twist
;
async function POST(request) {
    try {
        const body = await request.json();
        const { zona, discountCode, discountPercentage, idDescuento } = body;
        if (!zona || zona !== "cba" && zona !== "interior") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Zona inválida"
            }, {
                status: 400
            });
        }
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAdminClient"])();
        // Obtener precios del producto desde la base de datos
        const { data: producto, error: productoError } = await supabase.from("productos").select("precio_cba, precio_interior").eq("id", PRODUCTO_ID).single();
        if (productoError || !producto) {
            console.error("[checkout] Error fetching product prices:", productoError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Error al obtener precios del producto"
            }, {
                status: 500
            });
        }
        // Verificar stock disponible usando la función obtener_stock_disponible
        const { data: stockData, error: stockError } = await supabase.rpc("obtener_stock_disponible", {
            p_id_producto: PRODUCTO_ID
        });
        if (stockError) {
            console.error("[checkout] Error checking stock:", stockError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Error al verificar stock"
            }, {
                status: 500
            });
        }
        if (!stockData || stockData.length === 0 || stockData[0].disponibles <= 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Producto agotado"
            }, {
                status: 400
            });
        }
        // Calcular montos usando los precios de la base de datos
        const montoOriginal = zona === "cba" ? producto.precio_cba : producto.precio_interior;
        let montoDescuento = 0;
        let montoFinal = montoOriginal;
        if (discountPercentage && discountPercentage > 0) {
            montoDescuento = Math.round(montoOriginal * discountPercentage / 100);
            montoFinal = montoOriginal - montoDescuento;
            console.log(`[checkout] Discount applied: ${discountPercentage}% - Original: $${montoOriginal}, Descuento: $${montoDescuento}, Final: $${montoFinal}`);
        }
        // Crear preferencia de Mercado Pago con metadata para crear el pedido después del pago
        const preference = await createMercadoPagoPreference(zona, montoFinal, montoOriginal, discountCode, discountPercentage, idDescuento);
        if (!preference.id || !preference.init_point) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Error al crear preferencia de pago"
            }, {
                status: 500
            });
        }
        console.log("[checkout] Preference created. No unit reserved, no order created. Waiting for payment confirmation.");
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            init_point: preference.init_point,
            preference_id: preference.id
        });
    } catch (error) {
        console.error("[checkout] Checkout error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Error en el proceso de checkout"
        }, {
            status: 500
        });
    }
}
async function createMercadoPagoPreference(zona, monto, montoOriginal, discountCode, discountPercentage, idDescuento) {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
        throw new Error("Mercado Pago access token not configured");
    }
    const formUrl = ("TURBOPACK compile-time value", "https://nontolerable-ethan-holies.ngrok-free.dev");
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    console.log("[v0] Creating preference with form URL:", formUrl);
    let description = zona === "cba" ? "Envío gratis - Córdoba Capital" : "Incluye envío - Resto del país";
    if (discountCode && discountPercentage) {
        description += ` | Descuento ${discountPercentage}% aplicado (${discountCode})`;
    }
    // Guardar información en metadata para crear el pedido después del pago
    const metadata = {
        id_producto: PRODUCTO_ID,
        zona,
        monto_original: montoOriginal,
        porcentaje_descuento: discountPercentage || 0,
        monto_descuento: montoOriginal - monto,
        monto_final: monto,
        discount_code: discountCode || null,
        id_codigo_descuento: idDescuento || null
    };
    const preferenceData = {
        items: [
            {
                title: "Buzzy Twist - Edición Limitada",
                description,
                quantity: 1,
                unit_price: monto,
                currency_id: "ARS"
            }
        ],
        back_urls: {
            success: `${formUrl}/checkout/success`,
            failure: `${formUrl}/checkout/failure`,
            pending: `${formUrl}/checkout/pending`
        },
        auto_return: "approved",
        external_reference: zona,
        statement_descriptor: "BUZZY TWIST",
        payment_methods: {
            excluded_payment_methods: [],
            excluded_payment_types: [],
            installments: 1
        },
        additional_info: `Completá tus datos de envío en: ${formUrl}`,
        metadata
    };
    console.log("[v0] Preference data:", JSON.stringify(preferenceData, null, 2));
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(preferenceData)
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error("[v0] Mercado Pago error:", errorText);
        throw new Error(`Mercado Pago API error: ${response.status} - ${errorText}`);
    }
    const result = await response.json();
    console.log("[v0] Preference created:", result.id);
    return result;
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f5c6f536._.js.map