import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProjectCard from '@/components/public/ProjectCard'
import { CITY_CATEGORIES, getListingCityLabel } from '@/lib/city-categories'
import type { Project } from '@/types'
import { getCachedProjectsByCity } from '@/lib/public-projects-cache'

export const revalidate = 3600

type Params = { city: string }

function isSupportedCity(slug: string) {
  return CITY_CATEGORIES.some((city) => city.slug === slug)
}

export async function generateStaticParams() {
  return CITY_CATEGORIES.map((city) => ({ city: city.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { city } = await params
  if (!isSupportedCity(city)) {
    return { title: 'Projects' }
  }

  const cityLabel = getListingCityLabel(city)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const canonical = `${siteUrl}/${city}`

  return {
    title: `Projects In ${cityLabel}`,
    description: `Explore all current and upcoming projects listed under ${cityLabel}.`,
    keywords: [
      `${cityLabel.toLowerCase()} projects`,
      `${cityLabel.toLowerCase()} real estate`,
      `${cityLabel.toLowerCase()} plots`,
      `${cityLabel.toLowerCase()} villas`,
      'upcoming projects',
      'gem group realty',
    ],
    alternates: { canonical },
    openGraph: {
      title: `Projects In ${cityLabel}`,
      description: `Explore all current and upcoming projects listed under ${cityLabel}.`,
      url: canonical,
      type: 'website',
    },
  }
}

export default async function CityPage({ params }: { params: Promise<Params> }) {
  const { city } = await params

  if (!isSupportedCity(city)) {
    notFound()
  }

  const projects: Project[] = await getCachedProjectsByCity(city)
  const cityLabel = getListingCityLabel(city)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-10">
      <header className="mb-8 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{cityLabel} Projects</h1>
        <p className="mt-2 text-sm text-slate-700">
          Browse projects grouped under {cityLabel}. Direct project pages are optimized for search visibility.
        </p>
      </header>

      {projects.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-blue-200 bg-white p-10 text-center">
          <p className="text-lg font-semibold text-slate-900">Projects are not available in {cityLabel} yet.</p>
          <p className="mt-2 text-sm text-slate-600">New launches will be listed here soon.</p>
        </section>
      ) : (
        <section>
          <p className="mb-5 text-sm font-medium text-slate-700">
            {projects.length} project{projects.length > 1 ? 's' : ''} listed in {cityLabel}
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
