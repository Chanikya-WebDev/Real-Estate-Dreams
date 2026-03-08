import { supabaseAdmin } from '@/lib/supabase/admin'
import ProjectCard from '@/components/public/ProjectCard'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Project } from '@/types'

export const metadata: Metadata = {
  title: 'All Projects',
  description: 'Browse all real estate projects — plots, villas and townships across Hyderabad, Vizag, Vijayawada and Bangalore.',
}

const CITIES = ['Hyderabad', 'Bangalore', 'Vijayawada', 'Vizag']
const TYPES  = ['plot', 'villa', 'apartment', 'farmland']

interface SearchParams {
  city?: string
  type?: string
  q?: string
}

async function getProjects(filters: SearchParams): Promise<Project[]> {
  let query = supabaseAdmin
    .from('projects')
    .select('*')
    .eq('published', true)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters.city) {
    const city = filters.city.toLowerCase()
    query = query.or(`city_slug.eq.${city},listing_city.eq.${city}`)
  }
  if (filters.type) query = query.eq('project_type', filters.type)
  if (filters.q) query = query.or(`name.ilike.%${filters.q}%,city.ilike.%${filters.q}%,address.ilike.%${filters.q}%`)

  const { data } = await query
  return data ?? []
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filters = await searchParams
  const projects = await getProjects(filters)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-10">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-slate-900">All Projects</h1>

      <form method="GET" className="card mb-8 flex flex-wrap gap-3 p-4 sm:p-5">
        <input
          type="text"
          name="q"
          defaultValue={filters.q ?? ''}
          placeholder="Search by name or location..."
          className="min-w-48 flex-1 rounded-xl border border-blue-200 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
        />

        <select name="city" defaultValue={filters.city ?? ''} className="w-full rounded-xl border border-blue-200 px-4 py-2 text-sm font-medium text-slate-900 focus:border-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 sm:w-auto">
          <option value="">All Cities</option>
          {CITIES.map((city) => <option key={city} value={city.toLowerCase()}>{city}</option>)}
        </select>

        <select name="type" defaultValue={filters.type ?? ''} className="w-full rounded-xl border border-blue-200 px-4 py-2 text-sm font-medium text-slate-900 focus:border-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 sm:w-auto">
          <option value="">All Types</option>
          {TYPES.map((type) => <option key={type} value={type} className="capitalize">{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
        </select>

        <button type="submit" className="w-full rounded-xl bg-blue-700 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 sm:w-auto">Search</button>

        {(filters.city || filters.type || filters.q) && (
          <Link href="/search" className="w-full rounded-xl bg-slate-100 px-4 py-2 text-center text-sm font-semibold text-slate-800 transition hover:bg-slate-200 sm:w-auto">Clear</Link>
        )}
      </form>

      <p className="mb-5 text-sm font-medium text-slate-700">
        {projects.length} project{projects.length !== 1 ? 's' : ''} found
        {filters.city && ` in ${filters.city}`}
        {filters.type && ` · ${filters.type}s`}
        {filters.q && ` matching "${filters.q}"`}
      </p>

      {projects.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="mb-3 text-4xl">🔍</p>
          <p className="text-lg font-semibold text-slate-800">No projects found</p>
          <p className="mt-1 text-sm text-slate-600">Try different filters or clear the search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      )}
    </div>
  )
}
