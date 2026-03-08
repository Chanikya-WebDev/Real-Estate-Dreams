import { unstable_cache } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Project, ProjectWithMedia } from '@/types'
import { inferListingCity } from '@/lib/city-categories'

const REVALIDATE_SECONDS = 3600

export async function getCachedProjectByCityAndSlug(city: string, slug: string): Promise<ProjectWithMedia | null> {
  return unstable_cache(
    async () => {
      const { data } = await supabaseAdmin
        .from('projects')
        .select('*, project_media(*)')
        .eq('slug', slug)
        .or(`city_slug.eq.${city},listing_city.eq.${city}`)
        .eq('published', true)
        .order('display_order', { referencedTable: 'project_media', ascending: true })
        .single()

      return data ?? null
    },
    [`project:${city}:${slug}`],
    {
      revalidate: REVALIDATE_SECONDS,
      tags: [`project:${slug}`, `city:${city}`, 'projects:list'],
    },
  )()
}

export async function getCachedProjectsByCity(city: string): Promise<Project[]> {
  return unstable_cache(
    async () => {
      const { data } = await supabaseAdmin
        .from('projects')
        .select('*')
        .eq('published', true)
        .or(`listing_city.eq.${city},city_slug.eq.${city}`)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })

      return (data ?? []).map((project) => ({
        ...project,
        listing_city: inferListingCity({
          listingCity: project.listing_city,
          city: project.city,
          citySlug: project.city_slug,
        }),
      }))
    },
    [`city-projects:${city}`],
    {
      revalidate: REVALIDATE_SECONDS,
      tags: [`city:${city}`, 'projects:list'],
    },
  )()
}

export async function getCachedFeaturedProjects(): Promise<Project[]> {
  return unstable_cache(
    async () => {
      const { data } = await supabaseAdmin
        .from('projects')
        .select('*')
        .eq('published', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(6)

      return data ?? []
    },
    ['featured-projects'],
    {
      revalidate: REVALIDATE_SECONDS,
      tags: ['projects:list', 'projects:featured'],
    },
  )()
}

export async function getCachedLatestProjects(): Promise<Project[]> {
  return unstable_cache(
    async () => {
      const { data } = await supabaseAdmin
        .from('projects')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(8)

      return data ?? []
    },
    ['latest-projects'],
    {
      revalidate: REVALIDATE_SECONDS,
      tags: ['projects:list', 'projects:latest'],
    },
  )()
}
