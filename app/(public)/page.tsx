import ProjectCard from '@/components/public/ProjectCard'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getCachedFeaturedProjects, getCachedLatestProjects } from '@/lib/public-projects-cache'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Plots & Villas in Hyderabad, Vizag, Vijayawada, Bangalore',
  description: 'Browse premium plots and villa projects across Hyderabad, Vizag, Vijayawada and Bangalore. Book a free site visit today.',
  openGraph: {
    title: 'DreamPlots — Premium Plots & Villas',
    description: 'Browse projects across Hyderabad, Vizag, Vijayawada and Bangalore.',
    type: 'website',
  },
}

const CITIES = [
  { name: 'Hyderabad', slug: 'hyderabad', emoji: '🏙️' },
  { name: 'Bangalore', slug: 'bangalore', emoji: '🌳' },
  { name: 'Vijayawada', slug: 'vijayawada', emoji: '🌊' },
  { name: 'Vizag', slug: 'vizag', emoji: '⛵' },
]

export default async function HomePage() {
  const [featuredProjects, latestProjects] = await Promise.all([
    getCachedFeaturedProjects(),
    getCachedLatestProjects(),
  ])

  return (
    <>
      <section className="bg-gradient-to-br from-blue-700 via-indigo-700 to-cyan-700 px-4 py-16 text-white md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl">Find Your Perfect Plot or Villa</h1>
          <p className="mt-4 text-base font-medium text-blue-50 sm:text-lg">Premium projects across Hyderabad, Vizag, Vijayawada &amp; Bangalore</p>
          <Link href="/search" className="mt-8 inline-block rounded-xl bg-amber-300 px-8 py-3 font-bold text-slate-900 shadow-lg transition hover:bg-amber-200">Browse All Projects</Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-extrabold text-slate-900">Browse by City</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CITIES.map((city) => (
            <Link
              key={city.slug}
              href={`/${city.slug}`}
              className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
            >
              <span className="text-2xl">{city.emoji}</span>
              <span className="font-bold text-slate-800">{city.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {featuredProjects.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-12">
          <h2 className="mb-6 text-2xl font-extrabold text-slate-900">Featured Projects</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => <ProjectCard key={project.id} project={project} />)}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-extrabold text-slate-900">Latest Projects</h2>
          <Link href="/search" className="text-sm font-semibold text-blue-700 hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {latestProjects.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      </section>
    </>
  )
}
