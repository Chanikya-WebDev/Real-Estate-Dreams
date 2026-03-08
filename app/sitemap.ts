import { supabaseAdmin } from '@/lib/supabase/admin'
import type { MetadataRoute } from 'next'
import { CITY_CATEGORIES, inferListingCity } from '@/lib/city-categories'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { data: projects } = await supabaseAdmin
    .from('projects')
    .select('city_slug, listing_city, slug, updated_at')
    .eq('published', true)

  const projectPages = (projects ?? []).map((project) => {
    const routeCity = inferListingCity({
      listingCity: project.listing_city,
      citySlug: project.city_slug,
    })

    return {
      url: `${siteUrl}/${routeCity}/${project.slug}`,
      lastModified: new Date(project.updated_at),
      changeFrequency: 'daily' as const,
      priority: 1,
    }
  })

  const cityPages = CITY_CATEGORIES.map((city) => ({
    url: `${siteUrl}/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    ...cityPages,
    ...projectPages,
  ]
}
