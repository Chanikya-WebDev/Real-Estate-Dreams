'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { ProjectWithMedia } from '@/types'
import { getCloudinaryOptimizedImage, getCloudinaryThumbImage } from '@/lib/cloudinary'

type ActivePanel = 'Amenities' | 'Gallery' | 'Location'

interface Props {
  active: ActivePanel
  project: ProjectWithMedia
}

export default function ProjectTabPanels({ active, project }: Props) {
  const [preview, setPreview] = useState<{ url: string; alt: string } | null>(null)

  if (active === 'Amenities') {
    return (
      <div>
        <h2 className="mb-4 text-xl font-bold text-gray-900">Amenities & Features</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {(project.amenities ?? []).map((a: string) => (
            <div key={a} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition hover:border-blue-300">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">✓</span>
              <span className="text-sm font-medium text-gray-800">{a}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (active === 'Gallery') {
    return (
      <div>
        <h2 className="mb-4 text-xl font-bold text-gray-900">Project Gallery</h2>
        {(project.project_media ?? []).length === 0 ? (
          <p className="text-sm text-gray-700">No media uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {(project.project_media ?? []).map((m) => (
              <div key={m.id} className="group relative aspect-video overflow-hidden rounded-xl bg-gray-100">
                {m.media_type === 'video' ? (
                  <video
                    src={getCloudinaryOptimizedImage(m.url)}
                    controls
                    className="h-full w-full object-cover"
                    poster={getCloudinaryThumbImage(m.thumbnail_url ?? m.url)}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setPreview({ url: m.url, alt: m.alt_text ?? project.name })}
                    className="relative h-full w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                    aria-label={`Open image preview: ${m.alt_text ?? project.name}`}
                  >
                    <Image
                      src={getCloudinaryOptimizedImage(m.url)}
                      alt={m.alt_text ?? project.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        {preview && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4"
            onClick={() => setPreview(null)}
          >
            <div
              className="relative max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={getCloudinaryOptimizedImage(preview.url)}
                alt={preview.alt}
                width={1600}
                height={900}
                sizes="100vw"
                className="h-auto max-h-[88vh] w-full object-contain"
              />
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-sm font-semibold text-white hover:bg-black/80"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-gray-900">Location Map</h2>
      {project.map_embed_url ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <iframe
            src={project.map_embed_url}
            width="100%"
            height="420"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Map of ${project.name}`}
          />
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-700">
          Map not set. Add Google Maps embed URL in admin.
        </div>
      )}
      {project.address && (
        <p className="mt-3 text-sm text-gray-800">📍 {project.address}, {project.city}, {project.state}</p>
      )}
    </div>
  )
}
