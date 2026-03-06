// app/sitemap.ts
import { createClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('city_slug, slug, updated_at')
    .eq('published', true)

  const projectPages = (projects ?? []).map((p) => ({
    url: `https://yourbrand.vercel.app/${p.city_slug}/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  return [
    {
      url: 'https://yourbrand.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: 'https://yourbrand.vercel.app/hyderabad',
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://yourbrand.vercel.app/vizag',
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://yourbrand.vercel.app/vijayawada',
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://yourbrand.vercel.app/bangalore',
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...projectPages,
  ]
}
