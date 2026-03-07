// app/(public)/[city]/[slug]/page.tsx
import { supabaseAdmin } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import type { ProjectWithMedia } from '@/types'
import BookingForm from '@/components/public/BookingForm'
import WhatsAppButton from '@/components/public/WhatsAppButton'
import ProjectTabs from '@/components/public/ProjectTabs'

export const revalidate = 3600

export async function generateStaticParams() {
  const { data } = await supabaseAdmin
    .from('projects')
    .select('city_slug, slug')
    .eq('published', true)
  return (data ?? []).map((p) => ({ city: p.city_slug, slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; slug: string }>
}): Promise<Metadata> {
  const { city, slug } = await params
  const { data: p } = await supabaseAdmin
    .from('projects')
    .select('name, city, seo_title, seo_description, cover_image_url, price_display, plot_size_min, total_plots, total_area')
    .eq('city_slug', city).eq('slug', slug).eq('published', true).single()

  if (!p) return { title: 'Project Not Found' }

  const title = p.seo_title ?? `${p.name} | Villa Plots in ${p.city}`
  const description = p.seo_description ??
    `${p.total_plots ?? ''} premium plots in ${p.city}. From ${p.plot_size_min ?? ''} sq.yards. ` +
    `${p.total_area ?? ''} acres. ${p.price_display ?? ''}. RERA & DTCP approved. Bank loans available.`
  const canonical = `${process.env.NEXT_PUBLIC_SITE_URL}/${city}/${slug}`

  return {
    title, description,
    openGraph: { title, description, url: canonical, siteName: 'GEM Group Realty',
      images: p.cover_image_url ? [{ url: p.cover_image_url, width: 1200, height: 630, alt: p.name }] : [],
      locale: 'en_IN', type: 'website' },
    twitter: { card: 'summary_large_image', title, description,
      images: p.cover_image_url ? [p.cover_image_url] : [] },
    alternates: { canonical },
    robots: { index: true, follow: true },
  }
}

async function getProject(city: string, slug: string): Promise<ProjectWithMedia | null> {
  const { data } = await supabaseAdmin
    .from('projects')
    .select('*, project_media(*)')
    .eq('city_slug', city).eq('slug', slug).eq('published', true)
    .order('display_order', { referencedTable: 'project_media', ascending: true })
    .single()
  return data ?? null
}

function buildSchemas(project: ProjectWithMedia, city: string, slug: string) {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/${city}/${slug}`
  return [
    {
      '@context': 'https://schema.org', '@type': 'RealEstateListing',
      name: project.name, description: project.seo_description ?? project.description ?? '',
      url, image: project.cover_image_url ?? undefined, datePosted: project.created_at,
      offers: { '@type': 'Offer', price: project.price_per_sqyd ?? undefined, priceCurrency: 'INR',
        availability: 'https://schema.org/InStock', description: project.price_display ?? '' },
      address: { '@type': 'PostalAddress', streetAddress: project.address ?? '',
        addressLocality: project.city, addressRegion: project.state, addressCountry: 'IN' },
      ...(project.latitude && project.longitude
        ? { geo: { '@type': 'GeoCoordinates', latitude: project.latitude, longitude: project.longitude } } : {}),
      amenityFeature: project.amenities.map((a) => ({ '@type': 'LocationFeatureSpecification', name: a, value: true })),
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: process.env.NEXT_PUBLIC_SITE_URL },
        { '@type': 'ListItem', position: 2, name: project.city, item: `${process.env.NEXT_PUBLIC_SITE_URL}/${city}` },
        { '@type': 'ListItem', position: 3, name: project.name, item: url },
      ],
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: `What is the price of plots in ${project.name}?`,
          acceptedAnswer: { '@type': 'Answer', text: `${project.price_display ?? `From ₹${project.price_per_sqyd}/sq.yd`}. Plot sizes from ${project.plot_size_min} sq.yards. Bank loans available.` } },
        { '@type': 'Question', name: `Is ${project.name} RERA approved?`,
          acceptedAnswer: { '@type': 'Answer', text: `Yes, ${project.name} is RERA and DTCP approved. Contact GEM Group for registration details.` } },
        { '@type': 'Question', name: `Where is ${project.name} located?`,
          acceptedAnswer: { '@type': 'Answer', text: `${project.address ?? project.city}, ${project.state}. ${project.nearby?.slice(0, 3).join(', ')}.` } },
      ],
    },
  ]
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ city: string; slug: string }>
}) {
  const { city, slug } = await params
  const project = await getProject(city, slug)
  if (!project) notFound()

  const schemas = buildSchemas(project, city, slug)
  const heroImage = project.cover_image_url ?? project.project_media[0]?.url ?? null

  return (
    <>
      {/* JSON-LD schemas */}
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      {/* ── HERO ─────────────────────────────────────────────── */}
      <div className="relative w-full h-[55vh] min-h-[340px] bg-gray-900">
        {heroImage ? (
          <Image src={heroImage} alt={project.name} fill className="object-cover opacity-80" priority />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-gray-900" />
        )}
        {/* Dark overlay gradient from bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Hero Text */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-7xl mx-auto">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {project.amenities.includes('RERA Approved') && (
              <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">✓ RERA</span>
            )}
            {project.amenities.includes('DTCP Approved') && (
              <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">✓ DTCP</span>
            )}
            {project.featured && (
              <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">⭐ Featured</span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg tracking-tight">{project.name}</h1>
          <p className="text-gray-200 mt-1 flex items-center gap-1">
            <span>📍</span>
            <span>{project.address ?? project.city}, {project.state}</span>
          </p>
        </div>
      </div>

      {/* ── QUICK STATS BAR (like sample.html) ───────────────── */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 py-3">

            {/* Stats Pills */}
            <div className="flex flex-wrap gap-6">
              {project.address && (
                <div className="text-center">
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Location</p>
                  <p className="text-sm font-semibold text-gray-800">{project.city}</p>
                </div>
              )}
              {project.plot_size_min && (
                <div className="text-center">
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Unit Size</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {project.plot_size_min}
                    {project.plot_size_max && project.plot_size_max !== project.plot_size_min
                      ? `–${project.plot_size_max}` : ''} Sq.Yds
                  </p>
                </div>
              )}
              {project.total_area && (
                <div className="text-center">
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Total Area</p>
                  <p className="text-sm font-semibold text-gray-800">{project.total_area} Acres</p>
                </div>
              )}
              {project.total_plots && (
                <div className="text-center">
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Total Plots</p>
                  <p className="text-sm font-semibold text-gray-800">{project.total_plots}</p>
                </div>
              )}
              <div className="text-center">
                <p className="text-xs text-gray-600 uppercase tracking-wide">Price</p>
                <p className="text-sm font-semibold text-blue-700">
                  {project.price_display ?? (project.price_per_sqyd ? `₹${project.price_per_sqyd.toLocaleString('en-IN')}/sq.yd` : 'On Request')}
                </p>
              </div>
            </div>

            {/* CTA in stats bar */}
            <a
              href="#booking-form"
              className="hidden rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 md:block"
            >
              Book Site Visit
            </a>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-700">
          <a href="/" className="font-medium hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2">Home</a>
          <span>/</span>
          <a href={`/${city}`} className="font-medium capitalize hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2">{project.city}</a>
          <span>/</span>
          <span className="font-semibold text-gray-900">{project.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT COLUMN ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-10">

            {/* Tabs: Overview / Amenities / Gallery / Location */}
            <ProjectTabs project={project} />

          </div>

          {/* ── RIGHT COLUMN: Sticky Booking Form ────────────── */}
          <div className="lg:col-span-1">
            <div id="booking-form" className="sticky top-20 space-y-4">
              <BookingForm
                projectId={project.id}
                projectName={project.name}
                citySlug={city}
              />

              {/* Trust badges below form */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-xs text-gray-700 font-semibold uppercase tracking-wide mb-2">Why GEM Group?</p>
                {[
                  '✓ RERA & DTCP Approved Projects',
                  '✓ Bank Loans Available',
                  '✓ Spot Registration Facility',
                  '✓ 10+ Years of Trust',
                  '✓ Free Site Visit',
                ].map((t) => (
                  <p key={t} className="text-sm text-gray-700">{t}</p>
                ))}
              </div>

              {/* Phone CTA */}
              <a
                href={`tel:+${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '918008461987'}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white transition hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
              >
                📞 Call Now: +91 80084 61987
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp — no phoneNumber prop anymore */}
      <WhatsAppButton
        projectName={project.name}
        city={project.city}
        priceDisplay={project.price_display}
      />
    </>
  )
}
