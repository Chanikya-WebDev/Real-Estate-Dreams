// components/public/ProjectGallery.tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { ProjectMedia } from '@/types'

export default function ProjectGallery({ media }: { media: ProjectMedia[] }) {
  const images = media.filter((m) => m.media_type === 'image')
  const [selected, setSelected] = useState<number | null>(null)

  if (images.length === 0) return null

  return (
    <>
      {/* Thumbnail Grid */}
      <div className="grid grid-cols-3 gap-2">
        {images.map((img, i) => (
          <div
            key={img.id}
            className="relative h-28 cursor-pointer rounded-lg overflow-hidden"
            onClick={() => setSelected(i)}
          >
            <Image
              src={img.url}
              alt={img.alt_text ?? `Project image ${i + 1}`}
              fill
              className="object-cover hover:scale-105 transition"
              sizes="33vw"
              loading="lazy"   // all gallery images are lazy — only cover is priority
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selected !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 text-white"
          >
            <X size={28} />
          </button>
          <button
            onClick={() => setSelected(Math.max(0, selected - 1))}
            className="absolute left-4 text-white disabled:opacity-30"
            disabled={selected === 0}
          >
            <ChevronLeft size={36} />
          </button>
          <div className="relative w-full max-w-3xl h-96">
            <Image
              src={images[selected].url}
              alt={images[selected].alt_text ?? ''}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          <button
            onClick={() => setSelected(Math.min(images.length - 1, selected + 1))}
            className="absolute right-4 text-white disabled:opacity-30"
            disabled={selected === images.length - 1}
          >
            <ChevronRight size={36} />
          </button>
          <p className="absolute bottom-4 text-white text-sm">
            {selected + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  )
}
