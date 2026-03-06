// components/public/ProjectCard.tsx
// Server Component — no 'use client' needed
// Receives pre-fetched data as props, renders nothing dynamic
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, LayoutGrid, Maximize2 } from 'lucide-react'
import type { Project } from '@/types'

export default function ProjectCard({ project }: { project: Project }) {
  const href = `/${project.city_slug}/${project.slug}`

  return (
    <Link href={href} className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100">

      {/* Cover Image */}
      <div className="relative h-52 w-full bg-gray-100">
        {project.cover_image_url ? (
          <Image
            src={project.cover_image_url}
            alt={`${project.name} - ${project.city}`}
            fill
            className="object-cover group-hover:scale-105 transition duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}

        {/* Project Type Badge */}
        <span className="absolute top-3 left-3 bg-blue-700 text-white text-xs px-2 py-1 rounded capitalize">
          {project.project_type}
        </span>

        {/* Featured Badge */}
        {project.featured && (
          <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded font-semibold">
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-base group-hover:text-blue-700 transition line-clamp-1">
          {project.name}
        </h3>

        <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
          <MapPin size={13} />
          <span>{project.city}, {project.state}</span>
        </div>

        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
          {project.total_plots && (
            <span className="flex items-center gap-1">
              <LayoutGrid size={13} />
              {project.total_plots} plots
            </span>
          )}
          {project.plot_size_min && (
            <span className="flex items-center gap-1">
              <Maximize2 size={13} />
              {project.plot_size_min}
              {project.plot_size_max ? `–${project.plot_size_max}` : '+'} sq.yd
            </span>
          )}
        </div>

        {project.price_display && (
          <p className="mt-2 text-blue-700 font-semibold text-sm">
            {project.price_display}
          </p>
        )}
      </div>
    </Link>
  )
}
