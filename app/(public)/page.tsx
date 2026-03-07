// app/(public)/page.tsx
// ─────────────────────────────────────────────────────
// STATIC GENERATION (SSG)
// Revalidates every 1 hour
// Shows featured projects + city quick links
// ─────────────────────────────────────────────────────
import { createClient } from '@/lib/supabase/server'
import ProjectCard from '@/components/public/ProjectCard'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Project } from '@/types'

// This page rebuilds every 1 hour automatically
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Plots & Villas in Hyderabad, Vizag, Vijayawada, Bangalore',
  description: 'Browse premium plots and villa projects across Hyderabad, Vizag, Vijayawada and Bangalore. Book a free site visit today.',
  openGraph: {
    title: 'YourBrand Realty — Premium Plots & Villas',
    description: 'Browse projects across Hyderabad, Vizag, Vijayawada and Bangalore.',
    type: 'website',
  },
}

// Cities for quick navigation
const CITIES = [
  { name: 'Hyderabad', slug: 'hyderabad', emoji: '🏙️' },
  { name: 'Bangalore', slug: 'bangalore', emoji: '🌳' },
  { name: 'Vijayawada', slug: 'vijayawada', emoji: '🌊' },
  { name: 'Vizag', slug: 'vizag', emoji: '⛵' },
]

async function getFeaturedProjects(): Promise<Project[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('published', true)
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(6)
  return data ?? []
}

async function getLatestProjects(): Promise<Project[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(8)
  return data ?? []
}

export default async function HomePage() {
  // Both queries run in PARALLEL — not sequential
  // This is the correct pattern for multiple DB calls in one page
  const [featuredProjects, latestProjects] = await Promise.all([
    getFeaturedProjects(),
    getLatestProjects(),
  ])

  return (
    <>
      {/* ── HERO SECTION ─────────────────────────── */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
            Find Your Perfect Plot or Villa
          </h1>
          <p className="mt-4 text-blue-50 text-lg font-medium">
            Premium projects across Hyderabad, Vizag, Vijayawada &amp; Bangalore
          </p>
          <Link
            href="/search"
            className="mt-8 inline-block bg-white text-blue-800 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition"
          >
            Browse All Projects
          </Link>
        </div>
      </section>

      {/* ── CITY QUICK LINKS ─────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Browse by City</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CITIES.map((city) => (
            <Link
              key={city.slug}
              href={`/${city.slug}`}
              className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-sm transition"
            >
              <span className="text-2xl">{city.emoji}</span>
              <span className="font-semibold text-gray-800">{city.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED PROJECTS ────────────────────── */}
      {featuredProjects.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-12">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Featured Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* ── LATEST PROJECTS ──────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold text-gray-900">Latest Projects</h2>
          <Link href="/search" className="text-blue-700 text-sm font-medium hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {latestProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>
    </>
  )
}
