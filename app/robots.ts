// app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api'],   // never let Google crawl admin or API
      },
    ],
    sitemap: 'https://yourbrand.vercel.app/sitemap.xml',
  }
}
