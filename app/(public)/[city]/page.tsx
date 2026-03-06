// app/(public)/[city]/page.tsx
import { supabaseAdmin } from '@/lib/supabase/admin'  // ← change this import
import { createClient } from '@/lib/supabase/server'   // ← keep for page data fetch
import ProjectCard from '@/components/public/ProjectCard'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Project } from '@/types'

export const revalidate = 3600

// ✅ Uses supabaseAdmin — no cookies, works at build time
export async function generateStaticParams() {
  const { data } = await supabaseAdmin
    .from('projects')
    .select('city_slug')
    .eq('published', true)

  const unique = [...new Set(data?.map((p) => p.city_slug) ?? [])]
  return unique.map((city_slug) => ({ city: city_slug }))
}

// ✅ generateMetadata runs per-request — createClient is fine here
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
  // ✅ createClient is fine here — runs inside a real page request
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

  if (projects.length === 0) notFound()

  const cityName = projects[0].city

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Projects in {cityName}
        </h1>
        <p className="text-gray-500 mt-2">
          {projects.length} project{projects.length !== 1 ? 's' : ''} available
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}
