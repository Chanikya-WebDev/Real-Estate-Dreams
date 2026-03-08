// types/index.ts

export type ProjectType = 'plot' | 'villa' | 'apartment' | 'farmland'

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'visit_scheduled'
  | 'converted'
  | 'lost'

export interface Project {
  id: string
  name: string
  slug: string
  city: string
  city_slug: string
  listing_city: string | null
  state: string
  description: string | null
  address: string | null
  seo_title: string | null
  seo_description: string | null
  seo_keywords: string[] | null
  plot_size_min: number | null
  plot_size_max: number | null
  total_plots: number | null
  total_area: number | null
  price_per_sqyd: number | null
  price_display: string | null
  published: boolean
  featured: boolean
  cover_image_url: string | null
  cover_image_id: string | null
  latitude: number | null
  longitude: number | null
  map_embed_url: string | null
  amenities: string[]
  nearby: string[]
  project_type: ProjectType
  created_at: string
  updated_at: string
}

export interface ProjectMedia {
  id: string
  project_id: string
  cloudinary_id: string
  url: string
  thumbnail_url: string | null
  media_type: 'image' | 'video'
  alt_text: string | null
  display_order: number
  created_at: string
}

export interface Lead {
  id: string
  project_id: string
  project_name: string | null
  project_city: string | null
  name: string
  phone: string
  preferred_time: string | null
  source_url: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  status: LeadStatus
  admin_notes: string | null
  ip_address: string | null
  created_at: string
  updated_at: string
}

// Project with its media joined (used on project detail page)
export interface ProjectWithMedia extends Project {
  project_media: ProjectMedia[]
}

// types/index.ts — add at the bottom
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}
