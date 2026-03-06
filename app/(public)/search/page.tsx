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
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900 mb-6">All Projects</h1>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3 mb-8">

        {/* Search Input */}
        <input
          type="text"
          name="q"
          defaultValue={filters.q ?? ''}
          placeholder="Search by name or location..."
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:border-blue-500"
        />

        {/* City Filter */}
        <select
          name="city"
          defaultValue={filters.city ?? ''}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
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
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
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
          className="bg-blue-700 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-800 transition"
        >
          Search
        </button>

        {/* Clear filters */}
        {(filters.city || filters.type || filters.q) && (
          <a
            href="/search"
            className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition"
          >
            Clear
          </a>
        )}
      </form>

      {/* Results Count */}
      <p className="text-gray-500 text-sm mb-5">
        {projects.length} project{projects.length !== 1 ? 's' : ''} found
        {filters.city && ` in ${filters.city}`}
        {filters.type && ` · ${filters.type}s`}
        {filters.q && ` matching "${filters.q}"`}
      </p>

      {/* Results Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-lg font-medium text-gray-600">No projects found</p>
          <p className="text-sm mt-1">Try different filters or clear the search</p>
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
