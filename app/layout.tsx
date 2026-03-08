// app/layout.tsx
// ─────────────────────────────────────────────────────
// Wraps EVERY page (public + admin)
// Only things that belong on ALL pages go here:
// → Google Analytics script
// → Root HTML structure
// → Global font
// ─────────────────────────────────────────────────────
import { GoogleAnalytics } from '@next/third-parties/google'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

// Static metadata for the root — each page overrides this
export const metadata: Metadata = {
  title: {
    // %s = page-specific title injected by generateMetadata()
    // Result: "Sree Laxmi Balaji Township | DreamPlots"
    template: '%s | DreamPlots',
    default: 'DreamPlots — Plots & Villas in Hyderabad, Vizag, Vijayawada',
  },
  description: 'Explore DTCP approved plots, villas and townships across Hyderabad, Bangalore, Vijayawada and Vizag.',
  // Prevents Google indexing your Vercel preview URLs
  // Only your main vercel.app domain gets indexed
    verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
  },
  metadataBase: new URL(siteUrl),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        { gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  )
}
