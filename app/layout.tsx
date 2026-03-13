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
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

// Static metadata for the root — each page overrides this
export const metadata: Metadata = {
  title: {
    // %s = page-specific title injected by generateMetadata()
    // Result: "Sree Laxmi Balaji Township | Open Plots and Villas"
    template: `%s | ${process.env.NEXT_PUBLIC_SITE_NAME ?? 'Open Plots and Villas'}`,
    default: `${process.env.NEXT_PUBLIC_SITE_NAME ?? 'Open Plots and Villas'} in Hyderabad, Telangana & Andhra Pradesh`,
  },
  description:
    'Buy RERA & DTCP approved open plots and villas in Hyderabad, Vizag, Vijayawada and Bangalore. GEM Group Realty — 10+ years of trust.',
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
        
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
       
      </body>
    </html>
  )
}
