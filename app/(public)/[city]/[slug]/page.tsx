// app/(public)/[city]/[slug]/page.tsx
import { supabaseAdmin } from '@/lib/supabase/admin'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import type { ProjectWithMedia } from '@/types'
import { generateSeoKeywords } from '@/lib/seo-keywords'
import { getListingCityLabel, inferListingCity } from '@/lib/city-categories'
import { getCachedProjectByCityAndSlug } from '@/lib/public-projects-cache'
import HeroDesktopSlider from '@/components/public/HeroDesktopSlider'
import ProjectTabs from '@/components/public/ProjectTabs'
import DeferredBookingForm from '@/components/public/DeferredBookingForm'
import FloatingActionButtons from '@/components/public/FloatingActionButtons'

export const revalidate = 3600

function pickNonEmpty(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }
  }
  return ''
}

export async function generateStaticParams() {
  const { data } = await supabaseAdmin
    .from('projects')
    .select('city, city_slug, listing_city, slug')
    .eq('published', true)
  return (data ?? []).map((p) => ({
    city: inferListingCity({
      listingCity: p.listing_city,
      city: p.city,
      citySlug: p.city_slug,
    }),
    slug: p.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; slug: string }>
}): Promise<Metadata> {
  const { city, slug } = await params
  const p = await getCachedProjectByCityAndSlug(city, slug)

  if (!p) return { title: 'Project Not Found' }

  const fallbackTitle = `${p.name} | Villa Plots in ${p.city}`
  const fallbackDescription =
    `${p.total_plots ?? 'Premium'} plots in ${p.city}. From ${p.plot_size_min ?? 'select'} sq.yards. ` +
    `${p.total_area ?? 'Prime'} acres. ${p.price_display ?? 'Best value pricing'}. RERA & DTCP approved. Bank loans available.`

  const title = pickNonEmpty(p.seo_title, fallbackTitle)
  const description = pickNonEmpty(
    p.seo_description,
    fallbackDescription,
    `${p.name} premium plots in ${p.city}. Contact GEM Group Realty for pricing and site visit details.`,
  )
  const keywords = (p.seo_keywords && p.seo_keywords.length > 0)
    ? p.seo_keywords
    : generateSeoKeywords({
        name: p.name,
        city: p.city,
        state: p.state,
        projectType: p.project_type,
        priceDisplay: p.price_display,
        pricePerSqyd: p.price_per_sqyd,
        amenities: p.amenities ?? [],
        nearby: p.nearby ?? [],
      })
  const canonicalCity = inferListingCity({
    listingCity: p.listing_city,
    city: p.city,
    citySlug: p.city_slug,
  })
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const canonical = `${siteUrl}/${canonicalCity}/${slug}`

  return {
    title, description, keywords,
    openGraph: {
      title, description, url: canonical, siteName: 'GEM Group Realty',
      images: p.cover_image_url
        ? [{ url: p.cover_image_url, width: 1200, height: 630, alt: p.name }] : [],
      locale: 'en_IN', type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description,
      images: p.cover_image_url ? [p.cover_image_url] : [] },
    alternates: { canonical },
    robots: { index: true, follow: true },
  }
}

function buildSchemas(project: ProjectWithMedia, city: string, slug: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const url = `${siteUrl}/${city}/${slug}`
  const cityLabel = getListingCityLabel(city)
  const imageUrls = [
    project.cover_image_url,
    ...(project.project_media ?? []).map((media) => media.url),
  ].filter(Boolean) as string[]
  return [
    {
      '@context': 'https://schema.org', '@type': 'RealEstateListing',
      name: project.name,
      description: project.seo_description ?? project.description ?? '',
      url, image: project.cover_image_url ?? undefined,
      datePosted: project.created_at,
      offers: { '@type': 'Offer', price: project.price_per_sqyd ?? undefined,
        priceCurrency: 'INR', availability: 'https://schema.org/InStock',
        description: project.price_display ?? '' },
      address: { '@type': 'PostalAddress', streetAddress: project.address ?? '',
        addressLocality: project.city, addressRegion: project.state, addressCountry: 'IN' },
      ...(project.latitude && project.longitude
        ? { geo: { '@type': 'GeoCoordinates', latitude: project.latitude, longitude: project.longitude } }
        : {}),
      amenityFeature: (project.amenities ?? []).map((a: string) => ({
        '@type': 'LocationFeatureSpecification', name: a, value: true,
      })),
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: cityLabel, item: `${siteUrl}/${city}` },
        { '@type': 'ListItem', position: 3, name: project.name, item: url },
      ],
    },
    {
      '@context': 'https://schema.org', '@type': 'WebPage',
      name: project.name,
      url,
      primaryImageOfPage: imageUrls[0] ?? undefined,
    },
    ...(imageUrls.length > 0
      ? [{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: imageUrls.map((imageUrl, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'ImageObject',
              contentUrl: imageUrl,
              representativeOfPage: index === 0,
            },
          })),
        }]
      : []),
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: `What is the price of plots in ${project.name}?`,
          acceptedAnswer: { '@type': 'Answer',
            text: `${project.price_display ?? `From ₹${project.price_per_sqyd}/sq.yd`}. Plot sizes from ${project.plot_size_min} sq.yards. Bank loans available.` } },
        { '@type': 'Question', name: `Is ${project.name} RERA approved?`,
          acceptedAnswer: { '@type': 'Answer',
            text: `Yes, ${project.name} is RERA and DTCP approved. Contact GEM Group for registration details.` } },
        { '@type': 'Question', name: `Where is ${project.name} located?`,
          acceptedAnswer: { '@type': 'Answer',
            text: `${project.address ?? project.city}, ${project.state}. ${(project.nearby ?? []).slice(0, 3).join(', ')}.` } },
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
  const project = await getCachedProjectByCityAndSlug(city, slug)
  if (!project) notFound()
  const canonicalCity = inferListingCity({
    listingCity: project.listing_city,
    city: project.city,
    citySlug: project.city_slug,
  })
  if (city !== canonicalCity) {
    redirect(`/${canonicalCity}/${slug}`)
  }
  const cityLabel = getListingCityLabel(city)

  const schemas  = buildSchemas(project, city, slug)
  const heroImage = project.cover_image_url ?? project.project_media?.[0]?.url ?? null
  const heroImages = [
    project.cover_image_url,
    ...(project.project_media ?? [])
      .filter((media) => media.media_type === 'image')
      .map((media) => media.url),
  ].filter(Boolean) as string[]

  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      {/* ── HERO ── */}
      <div className="relative mx-auto w-full max-w-[1280px] h-[52vh] min-h-[320px] bg-gray-900 md:h-[60vh] md:min-h-[380px]">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/90 to-cyan-900/70" />
        <div className="pointer-events-none absolute -left-24 top-8 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-28 bottom-8 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
        {heroImage ? (
          <>
            <Image
              src={heroImage}
              alt={project.name}
              fill
              className="object-contain opacity-90 md:hidden"
              priority
              fetchPriority="high"
              sizes="100vw"
              quality={75}
            />
            <HeroDesktopSlider images={heroImages} projectName={project.name} />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-gray-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-3">
              {(project.amenities ?? []).includes('RERA Approved') && (
                <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">✓ RERA</span>
              )}
              {(project.amenities ?? []).includes('DTCP Approved') && (
                <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">✓ DTCP</span>
              )}
              {project.featured && (
                <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">⭐ Featured</span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg tracking-tight">{project.name}</h1>
            <p className="text-gray-200 mt-1">📍 {project.address ?? project.city}, {project.state}</p>
            {project.price_display && (
              <p className="text-yellow-300 font-bold text-xl mt-2">{project.price_display}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── STICKY STATS BAR ── */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 py-3">
            <div className="flex flex-wrap gap-6">
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
                  {project.price_display ?? (project.price_per_sqyd
                    ? `₹${project.price_per_sqyd.toLocaleString('en-IN')}/sq.yd` : 'On Request')}
                </p>
              </div>
            </div>
            <a href="#booking-form"
              className="hidden rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 md:block">
              Book Site Visit
            </a>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-gray-700">
          <a href="/" className="font-medium hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2">Home</a>
          <span>/</span>
          <a href={`/${city}`} className="font-medium capitalize hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2">{cityLabel}</a>
          <span>/</span>
          <span className="font-semibold text-gray-900">{project.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Tabs */}
          <div className="lg:col-span-2">
            <ProjectTabs project={project} />
          </div>

          {/* Right: Sticky Booking Form */}
          <div className="lg:col-span-1">
            <div id="booking-form" className="sticky top-20 space-y-4">
              <DeferredBookingForm
                projectId={project.id}
                projectName={project.name}
              />
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-xs text-gray-700 font-semibold uppercase tracking-wide mb-2">Why GEM Group?</p>
                {['✓ RERA & DTCP Approved', '✓ Bank Loans Available', '✓ Spot Registration', '✓ Free Site Visit', '✓ 10+ Years Trust'].map((t) => (
                  <p key={t} className="text-sm text-gray-700">{t}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* ── FLOATING ACTIONS — always visible ── */}
      <FloatingActionButtons
        projectId={project.id}
        projectName={project.name}
        city={project.city}
        priceDisplay={project.price_display}
      />
    </>
  )
}
