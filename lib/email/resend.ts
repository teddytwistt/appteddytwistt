import { Resend } from "resend"

// Inicializar cliente de Resend
// Necesitas agregar RESEND_API_KEY a tu .env.local
export const resend = new Resend(process.env.RESEND_API_KEY)

// Email por defecto desde donde se envían los emails
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"
