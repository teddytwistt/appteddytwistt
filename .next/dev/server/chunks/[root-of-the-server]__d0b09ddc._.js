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
"[project]/lib/utils/timezone.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Utilidades para manejar zonas horarias
 * Argentina usa UTC-3 (ART - Argentina Time)
 */ /**
 * Obtiene la fecha y hora actual en zona horaria de Argentina (UTC-3)
 * y la retorna en formato ISO compatible con Supabase timestamptz
 */ __turbopack_context__.s([
    "formatArgentinaDateTime",
    ()=>formatArgentinaDateTime,
    "getArgentinaTimestamp",
    ()=>getArgentinaTimestamp,
    "toArgentinaTime",
    ()=>toArgentinaTime
]);
function getArgentinaTimestamp() {
    const now = new Date();
    // Convertir a hora de Argentina (UTC-3)
    // Crear un formatter con timezone de Argentina
    const argentinaTime = new Date(now.toLocaleString('en-US', {
        timeZone: 'America/Argentina/Buenos_Aires'
    }));
    return argentinaTime.toISOString();
}
function toArgentinaTime(utcDate) {
    const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
    return new Date(date.toLocaleString('en-US', {
        timeZone: 'America/Argentina/Buenos_Aires'
    }));
}
function formatArgentinaDateTime(dateString) {
    return new Date(dateString).toLocaleString("es-AR", {
        timeZone: 'America/Argentina/Buenos_Aires',
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}
}),
"[project]/app/api/payment/validate/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server-admin.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$timezone$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils/timezone.ts [app-route] (ecmascript)");
;
;
;
async function GET(request) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const paymentId = searchParams.get("payment_id");
        const preferenceId = searchParams.get("preference_id");
        if (!paymentId || !preferenceId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Parámetros faltantes"
            }, {
                status: 400
            });
        }
        // Consultar la API de Mercado Pago
        const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
        if (!accessToken) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Configuración de pago no disponible"
            }, {
                status: 500
            });
        }
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        if (!response.ok) {
            console.error("[v0] Mercado Pago validation error:", response.status);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Error al validar el pago"
            }, {
                status: 500
            });
        }
        const paymentData = await response.json();
        // Verificar que el pago esté aprobado
        if (paymentData.status !== "approved") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                message: "El pago no ha sido aprobado",
                status: paymentData.status
            }, {
                status: 200
            });
        }
        // Buscar el pedido en la base de datos
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAdminClient"])();
        const { data: orderData, error: orderError } = await supabase.from("pedidos").select("*").eq("preference_id", preferenceId).single();
        if (orderError || !orderData) {
            console.error("[payment-validate] Order not found:", orderError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Pedido no encontrado"
            }, {
                status: 404
            });
        }
        // Verificar que el monto coincida (usar monto_final)
        if (paymentData.transaction_amount !== orderData.monto_final) {
            console.error("[payment-validate] Amount mismatch:", {
                expected: orderData.monto_final,
                received: paymentData.transaction_amount
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "El monto del pago no coincide"
            }, {
                status: 400
            });
        }
        // Actualizar el pedido con la información del pago
        const { error: updateError } = await supabase.from("pedidos").update({
            estado_pago: "pagado",
            payment_id: paymentId,
            fecha_pago: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$timezone$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getArgentinaTimestamp"])(),
            mp_response: paymentData
        }).eq("id", orderData.id);
        if (updateError) {
            console.error("[payment-validate] Error updating order:", updateError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Error al actualizar el pedido"
            }, {
                status: 500
            });
        }
        // Marcar la unidad como vendida
        if (orderData.id_unidad) {
            const { error: unidadError } = await supabase.rpc("marcar_unidad_vendida", {
                p_id_unidad: orderData.id_unidad
            });
            if (unidadError) {
                console.error("[payment-validate] Error marking unit as sold:", unidadError);
            // No fallar el proceso si esto falla, solo logear
            } else {
                console.log("[payment-validate] Unit marked as sold:", orderData.id_unidad);
            }
        }
        // Obtener el número de serie de la unidad
        let numeroSerie = null;
        if (orderData.id_unidad) {
            const { data: unidad } = await supabase.from("unidades_producto").select("numero_serie").eq("id", orderData.id_unidad).single();
            numeroSerie = unidad?.numero_serie;
        }
        console.log("[payment-validate] Payment validated successfully for order:", orderData.id);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: "Pago validado correctamente",
            pedido: {
                id: orderData.id,
                zona: orderData.zona,
                monto_final: orderData.monto_final,
                numero_serie: numeroSerie
            }
        });
    } catch (error) {
        console.error("[v0] Payment validation error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Error al validar el pago"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d0b09ddc._.js.map