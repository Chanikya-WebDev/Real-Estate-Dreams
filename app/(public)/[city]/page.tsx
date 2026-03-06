// app/(public)/[city]/page.tsx
// ─────────────────────────────────────────────────────
// URL: /hyderabad, /vizag, /vijayawada, /bangalore
// Shows all published projects for that city
// ISR: rebuilds when admin publishes a new project
// ─────────────────────────────────────────────────────
import { createClient } from '@/lib/supabase/server'
import ProjectCard from '@/components/public/ProjectCard'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Project } from '@/types'

export const revalidate = 3600

// Tells Next.js which city pages to pre-build at deploy time [web:84]
export async function generateStaticParams() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('city_slug')
    .eq('published', true)

  // Get unique city slugs
  const unique = [...new Set(data?.map((p) => p.city_slug) ?? [])]
  return unique.map((city_slug) => ({ city: city_slug }))
  // Returns: [{ city: 'hyderabad' }, { city: 'vizag' }, ...]
}

// Generates SEO metadata dynamically per city [web:86]
export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>
}): Promise<Metadata> {
  const { city } = await params
  const cityName = city.charAt(0).toUpperCase() + city.slice(1)

  return {
    title: `Plots & Villas in ${cityName}`,
    description: `Browse all real estate projects in ${cityName}. Find plots, villas and townships with best pricing.`,
    openGraph: {
      title: `Projects in ${cityName} | YourBrand Realty`,
      description: `Explore verified plots and villa projects in ${cityName}.`,
    },
    alternates: {
      canonical: `https://yourbrand.vercel.app/${city}`,
    },
  }
}

async function getCityProjects(citySlug: string): Promise<Project[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('published', true)
    .eq('city_slug', citySlug)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
  return data ?? []
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>
}) {
  const { city } = await params
  const projects = await getCityProjects(city)

  // If city has zero projects → show 404
  if (projects.length === 0) notFound()

  const cityName = projects[0].city // Real name from DB e.g. "Hyderabad"

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Projects in {cityName}
        </h1>
        <p className="text-gray-500 mt-2">
          {projects.length} project{projects.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}
