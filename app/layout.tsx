import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SmoothScroll } from "@/components/smooth-scroll"
import "./globals.css"

// Updated fonts for urban/street aesthetic
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "BUZZY × TEDDYTWIST - Edición Limitada",
  description: "Figura de colección edición limitada 001/900",
  generator: "v0.app",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
}
// Test sync

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${spaceGrotesk.className} font-sans antialiased`}>
        <SmoothScroll />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
