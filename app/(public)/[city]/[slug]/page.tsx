// app/(public)/[city]/[slug]/page.tsx
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import type { ProjectWithMedia } from '@/types'
import ProjectGallery from '@/components/public/ProjectGallery'
import BookingForm from '@/components/public/BookingForm'
import MapEmbed from '@/components/public/MapEmbed'
import { MapPin, LayoutGrid, Maximize2, Trees, Phone } from 'lucide-react'

export const revalidate = 3600

export async function generateStaticParams() {
  const { data } = await supabaseAdmin
    .from('projects')
    .select('city_slug, slug')
    .eq('published', true)

  return (data ?? []).map((p) => ({
    city: p.city_slug,
    slug: p.slug,
  }))
}

// Pre-builds ALL project pages at deploy time [web:84]
// export async function generateStaticParams() {
//   const supabase = await createClient()
//   const { data } = await supabase
//     .from('projects')
//     .select('city_slug, slug')
//     .eq('published', true)

//   return (data ?? []).map((p) => ({
//     city: p.city_slug,
//     slug: p.slug,
//   }))
  // Returns: [
  //   { city: 'shadnagar', slug: 'sree-laxmi-balaji-township' },
  //   { city: 'hyderabad', slug: 'green-valley-villas' },
  //   ...
  // ]
// }

// Fetch project + media in one query using Supabase joins
async function getProject(
  citySlug: string,
  slug: string
): Promise<ProjectWithMedia | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select(`
      *,
      project_media (
        id, cloudinary_id, url, thumbnail_url,
        media_type, alt_text, display_order
      )
    `)
    .eq('city_slug', citySlug)
    .eq('slug', slug)
    .eq('published', true)
    // Sort media by display_order
    .order('display_order', {
      referencedTable: 'project_media',
      ascending: true
    })
    .single()

  return data as ProjectWithMedia | null
}

// Dynamic SEO metadata per project [web:86]
export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; slug: string }>
}): Promise<Metadata> {
  const { city, slug } = await params
  const project = await getProject(city, slug)

  if (!project) return { title: 'Project Not Found' }

  const title = project.seo_title ??
    `${project.name} | ${project.project_type === 'plot' ? 'Plots' : 'Villas'} in ${project.city}`

  const description = project.seo_description ??
    `${project.name} in ${project.city} — ${project.total_plots ?? ''} plots, ${project.total_area ?? ''} acres. ${project.amenities.slice(0, 3).join(', ')}. Book a free site visit.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: project.cover_image_url
        ? [{ url: project.cover_image_url, width: 1200, height: 630, alt: project.name }]
        : [],
    },
    // Self-referencing canonical prevents duplicate content issues
    alternates: {
      canonical: `https://yourbrand.vercel.app/${city}/${slug}`,
    },
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ city: string; slug: string }>
}) {
  const { city, slug } = await params
  const project = await getProject(city, slug)

  // Unpublished or non-existent → hard 404
  if (!project) notFound()

  const images = project.project_media.filter((m) => m.media_type === 'image')
  const videos = project.project_media.filter((m) => m.media_type === 'video')

  // ── JSON-LD Structured Data ──────────────────────
  // Google parses this for rich search results [web:16][web:91]
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: project.name,
    description: project.description ?? '',
    url: `https://yourbrand.vercel.app/${city}/${slug}`,
    image: images.map((m) => m.url),
    address: {
      '@type': 'PostalAddress',
      streetAddress: project.address ?? '',
      addressLocality: project.city,
      addressRegion: project.state,
      addressCountry: 'IN',
    },
    ...(project.latitude && project.longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: project.latitude,
        longitude: project.longitude,
      },
    }),
    ...(project.price_per_sqyd && {
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: project.price_per_sqyd,
        availability: 'https://schema.org/InStock',
      },
    }),
  }

  return (
    <>
      {/* JSON-LD — injected into <head> server-side */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT COLUMN (2/3 width) ────────────── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Cover Image — priority=true for LCP */}
            {project.cover_image_url && (
              <div className="relative w-full h-72 md:h-96 rounded-xl overflow-hidden">
                <Image
                  src={project.cover_image_url}
                  alt={`${project.name} - ${project.city}`}
                  fill
                  priority      // ← Critical: tells browser to preload this image
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              </div>
            )}

            {/* Project Title + Location */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {project.name}
                  </h1>
                  <div className="flex items-center gap-1 text-gray-500 mt-1">
                    <MapPin size={15} />
                    <span>{project.city}, {project.state}</span>
                  </div>
                </div>
                {project.price_display && (
                  <span className="bg-blue-50 text-blue-700 font-bold px-4 py-2 rounded-lg text-sm whitespace-nowrap">
                    {project.price_display}
                  </span>
                )}
              </div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {project.total_plots && (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <LayoutGrid className="mx-auto text-blue-600 mb-1" size={20} />
                  <p className="font-bold text-gray-900">{project.total_plots}</p>
                  <p className="text-gray-500 text-xs">Total Plots</p>
                </div>
              )}
              {project.total_area && (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Maximize2 className="mx-auto text-blue-600 mb-1" size={20} />
                  <p className="font-bold text-gray-900">{project.total_area} acres</p>
                  <p className="text-gray-500 text-xs">Total Area</p>
                </div>
              )}
              {project.plot_size_min && (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Maximize2 className="mx-auto text-blue-600 mb-1" size={20} />
                  <p className="font-bold text-gray-900">
                    {project.plot_size_min}
                    {project.plot_size_max ? `–${project.plot_size_max}` : '+'} sq.yd
                  </p>
                  <p className="text-gray-500 text-xs">Plot Size</p>
                </div>
              )}
              {project.project_type && (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Trees className="mx-auto text-blue-600 mb-1" size={20} />
                  <p className="font-bold text-gray-900 capitalize">{project.project_type}</p>
                  <p className="text-gray-500 text-xs">Type</p>
                </div>
              )}
            </div>

            {/* Description */}
            {project.description && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">About the Project</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            {project.amenities.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {project.amenities.map((item) => (
                    <span
                      key={item}
                      className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-sm"
                    >
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby */}
            {project.nearby.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Nearby Landmarks</h2>
                <div className="flex flex-wrap gap-2">
                  {project.nearby.map((item) => (
                    <span
                      key={item}
                      className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-sm"
                    >
                      📍 {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Image Gallery */}
            {images.length > 1 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Gallery</h2>
                <ProjectGallery media={project.project_media} />
              </div>
            )}

            {/* Video */}
            {videos.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Project Video</h2>
                <div className="space-y-4">
                  {videos.map((video) => (
                    <video
                      key={video.id}
                      src={video.url}
                      controls
                      className="w-full rounded-xl"
                      poster={video.thumbnail_url ?? undefined}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            {project.map_embed_url && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Location</h2>
                <MapEmbed embedUrl={project.map_embed_url} name={project.name} />
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN (1/3 width) — STICKY ─── */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">

              {/* Booking Form */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Book a Free Site Visit
                </h2>
                <p className="text-gray-500 text-sm mb-4">
                  Our team will call you within 2 hours
                </p>
                <BookingForm
                  projectId={project.id}
                  projectName={project.name}
                />
              </div>

              {/* Direct Call CTA */}
              <a
                href="tel:+919876543210"
                className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition"
              >
                <Phone size={18} />
                Call Directly
              </a>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
