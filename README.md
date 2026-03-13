# Open Plots And Villas

High-performance real estate platform for publishing, discovering, and converting plot/villa projects with SEO-first project pages.

## Overview

Open Plots And Villas is a production-oriented web application focused on one business outcome: when users search project terms (city + project name + plot intent), they should land directly on the project detail page with strong metadata, clear information, and quick lead capture.

## Key Highlights

- SEO-first dynamic project pages at `/<city>/<slug>`
- City-based project classification and canonical routing
- Admin CMS for project create/edit/publish workflows
- AI-assisted content parsing for faster project onboarding
- Dynamic metadata generation (`title`, `description`, `keywords`)
- Dynamic Open Graph/Twitter cards per project
- JSON-LD structured data for rich search visibility
- Dynamic `sitemap.xml` and `robots.txt`
- Cloudinary-based media handling and optimization support
- Lead capture and admin lead management
- Revalidation-based cache refresh after admin updates

## SEO Architecture

- `generateMetadata` builds per-project SEO fields.
- Canonical URL is always based on `NEXT_PUBLIC_SITE_URL`.
- Open Graph image/title/description are project-aware.
- JSON-LD includes:
  - `RealEstateListing`
  - `BreadcrumbList`
  - `WebPage`
  - `FAQPage`
  - image list objects when media exists
- Related user-intent keywords are rendered below hero content for readability and relevance.

## Performance Approach

- App Router caching + `revalidate` on public routes
- Public data fetch helpers with cache tags/revalidation integration
- Deferred loading for non-critical sections where needed
- Mobile-aware hero image strategy
- Minimal client-side JS in SEO-critical page regions

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Supabase (Postgres/Auth)
- Cloudinary
- Gemini API (AI parsing)
- Resend (email notifications)

## Repository Structure

- `app/(public)` public pages (home, city, project detail, search)
- `app/(admin)` admin dashboard and content management
- `app/api` APIs (ai-parse, revalidate, leads, admin actions)
- `components/public` public UI modules
- `components/admin` admin UI modules
- `lib` shared logic (SEO, caching, city inference, supabase, helpers)
- `supabase/migrations` schema migrations

## Environment Variables

Copy `.env.example` to `.env.local` and set values:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- Cloudinary upload/runtime variables
- Notification provider keys (if email alerts are enabled)

## Local Development

```bash
npm install
npm run dev
```

## Build & Lint

```bash
npm run build
npm run lint
```

If your machine throws a shared-library runtime error (for example `libsimdjson.so.29`), fix Node runtime dependencies first, then run build/lint again.

## Admin Workflow

1. Create project in Admin.
2. Optionally use AI parse to extract structured fields.
3. Verify city classification (`hyderabad`, `bangalore`, `vizag`, `vijayawada`).
4. Upload media and choose cover image.
5. Publish project.
6. Trigger revalidation for immediate public freshness.

## Product Focus

This project prioritizes:

- direct project-page discovery via search engines
- fast mobile rendering and usability
- clean admin operations for frequent content updates
- SEO consistency at scale

## License

Private repository.
