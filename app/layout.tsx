import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { SmoothScroll } from "@/components/smooth-scroll"
import "./globals.css"

// Updated fonts for urban/street aesthetic
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "BUZZY × TEDDYTWIST - Edición Limitada",
  description: "Figura de colección edición limitada 001/900. Picador de cannabis premium con diseño exclusivo de TeddyTwist. Solo 900 unidades disponibles.",
  generator: "v0.app",
  metadataBase: new URL("https://www.teddytwist.com"),
  keywords: ["BUZZY", "TeddyTwist", "picador", "grinder", "cannabis", "edición limitada", "colección"],
  authors: [{ name: "TeddyTwist" }],
  creator: "TeddyTwist",
  publisher: "TeddyTwist",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://www.teddytwist.com",
    title: "BUZZY × TEDDYTWIST - Edición Limitada",
    description: "Figura de colección edición limitada 001/900. Picador de cannabis premium con diseño exclusivo.",
    siteName: "TeddyTwist",
    images: [
      {
        url: "/images/logo-alpha.webp",
        width: 1200,
        height: 630,
        alt: "BUZZY × TEDDYTWIST Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BUZZY × TEDDYTWIST - Edición Limitada",
    description: "Figura de colección edición limitada 001/900",
    images: ["/images/logo-alpha.webp"],
    creator: "@teddytwist_",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code", // Reemplazar con tu código de Google Search Console
  },
}

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
        <SpeedInsights />
      </body>
    </html>
  )
}
