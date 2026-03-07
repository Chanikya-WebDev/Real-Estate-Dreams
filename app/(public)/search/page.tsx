// app/(public)/search/page.tsx
import { supabaseAdmin } from '@/lib/supabase/admin'
import ProjectCard from '@/components/public/ProjectCard'
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
    query = query.eq('city_slug', filters.city.toLowerCase())
  }

  if (filters.type) {
    query = query.eq('project_type', filters.type)
  }

  if (filters.q) {
    // Search by name or city (case-insensitive)
    query = query.or(
      `name.ilike.%${filters.q}%,city.ilike.%${filters.q}%,address.ilike.%${filters.q}%`
    )
  }

  const { data } = await query
  return data ?? []
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const filters = await searchParams
  const projects = await getProjects(filters)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">

      {/* Header */}
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-gray-900">All Projects</h1>

      {/* Filters */}
      <form method="GET" className="mb-8 flex flex-wrap gap-3">

        {/* Search Input */}
        <input
          type="text"
          name="q"
          defaultValue={filters.q ?? ''}
          placeholder="Search by name or location..."
          className="min-w-48 flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-600 focus:border-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1"
        />

        {/* City Filter */}
        <select
          name="city"
          defaultValue={filters.city ?? ''}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 focus:border-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 sm:w-auto"
        >
          <option value="">All Cities</option>
          {CITIES.map((city) => (
            <option key={city} value={city.toLowerCase()}>
              {city}
            </option>
          ))}
        </select>

        {/* Type Filter */}
        <select
          name="type"
          defaultValue={filters.type ?? ''}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 focus:border-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 sm:w-auto"
        >
          <option value="">All Types</option>
          {TYPES.map((type) => (
            <option key={type} value={type} className="capitalize">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-700 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 sm:w-auto"
        >
          Search
        </button>

        {/* Clear filters */}
        {(filters.city || filters.type || filters.q) && (
          <a
            href="/search"
            className="w-full rounded-lg bg-gray-100 px-4 py-2 text-center text-sm font-semibold text-gray-800 transition hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 sm:w-auto"
          >
            Clear
          </a>
        )}
      </form>

      {/* Results Count */}
      <p className="mb-5 text-sm font-medium text-gray-700">
        {projects.length} project{projects.length !== 1 ? 's' : ''} found
        {filters.city && ` in ${filters.city}`}
        {filters.type && ` · ${filters.type}s`}
        {filters.q && ` matching "${filters.q}"`}
      </p>

      {/* Results Grid */}
      {projects.length === 0 ? (
        <div className="py-16 text-center text-gray-600">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-lg font-semibold text-gray-800">No projects found</p>
          <p className="mt-1 text-sm text-gray-700">Try different filters or clear the search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
