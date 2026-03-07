// app/(public)/[city]/page.tsx
import { supabaseAdmin } from '@/lib/supabase/admin'
import ProjectCard from '@/components/public/ProjectCard'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Project } from '@/types'


export const revalidate = 3600

// ── Pre-render all city pages at build time ─────────────────
export async function generateStaticParams() {
  const { data } = await supabaseAdmin
    .from('projects')
    .select('city_slug')
    .eq('published', true)

  const unique = [...new Set(data?.map((p) => p.city_slug) ?? [])]
  return unique.map((city_slug) => ({ city: city_slug }))
}

// ── Dynamic SEO metadata per city ───────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>
}): Promise<Metadata> {
  const { city } = await params
  const cityName = city.charAt(0).toUpperCase() + city.slice(1)

  // Count published projects in this city for description
  const { count } = await supabaseAdmin
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('city_slug', city)
    .eq('published', true)

  const title       = `Plots & Villas in ${cityName} | GEM Group`
  const description = `Browse ${count ?? ''} RERA approved plots and villa projects in ${cityName}. Best prices, bank loans available. Book a free site visit with GEM Group.`
  const canonical   = `${process.env.NEXT_PUBLIC_SITE_URL}/${city}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'GEM Group Realty',
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: { canonical },
    robots: { index: true, follow: true },
  }
}

// ── Fetch city projects ──────────────────────────────────────
async function getCityProjects(citySlug: string): Promise<Project[]> {
  const { data } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('published', true)
    .eq('city_slug', citySlug)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
  return data ?? []
}

// ── Page ─────────────────────────────────────────────────────
export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>
}) {
  const { city } = await params
  const projects  = await getCityProjects(city)

  if (projects.length === 0) notFound()

  const cityName = projects[0].city

  // ItemList schema — makes Google show each project
  // as a sitelink under the city search result
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Real Estate Projects in ${cityName}`,
    numberOfItems: projects.length,
    itemListElement: projects.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/${p.city_slug}/${p.slug}`,
      image: p.cover_image_url ?? undefined,
    })),
  }

  // BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',   item: process.env.NEXT_PUBLIC_SITE_URL },
      { '@type': 'ListItem', position: 2, name: cityName, item: `${process.env.NEXT_PUBLIC_SITE_URL}/${city}` },
    ],
  }

  return (
    <>
      {/* JSON-LD schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <a href="/" className="hover:text-blue-700">Home</a>
          <span>/</span>
          <span className="text-gray-900 font-medium">{cityName}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Projects in {cityName}
          </h1>
          <p className="text-gray-500 mt-1">
            {projects.length} project{projects.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

      </div>
      
    </>
  )
}
