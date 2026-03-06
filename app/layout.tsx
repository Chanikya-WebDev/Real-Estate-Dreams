// app/layout.tsx
// ─────────────────────────────────────────────────────
// Wraps EVERY page (public + admin)
// Only things that belong on ALL pages go here:
// → Google Analytics script
// → Root HTML structure
// → Global font
// ─────────────────────────────────────────────────────
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// Static metadata for the root — each page overrides this
export const metadata: Metadata = {
  title: {
    // %s = page-specific title injected by generateMetadata()
    // Result: "Sree Laxmi Balaji Township | YourBrand Realty"
    template: '%s | YourBrand Realty',
    default: 'YourBrand Realty — Plots & Villas in Hyderabad, Vizag, Vijayawada',
  },
  description: 'Explore DTCP approved plots, villas and townships across Hyderabad, Bangalore, Vijayawada and Vizag.',
  // Prevents Google indexing your Vercel preview URLs
  // Only your main vercel.app domain gets indexed
  metadataBase: new URL('https://real-estate-jbvercel.app'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}

        {/* Google Analytics — loads after page is interactive */}
        {/* Replace G-XXXXXXXXXX with your GA4 Measurement ID */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX');
            `,
          }}
        />
      </body>
    </html>
  )
}
