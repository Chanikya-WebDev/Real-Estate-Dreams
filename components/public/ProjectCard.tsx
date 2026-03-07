import Image from 'next/image'
import Link from 'next/link'
import { MapPin, LayoutGrid, Maximize2 } from 'lucide-react'
import type { Project } from '@/types'

export default function ProjectCard({ project }: { project: Project }) {
  const href = `/${project.city_slug}/${project.slug}`

  return (
    <Link href={href} className="group block overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-52 w-full bg-blue-50 sm:h-56">
        {project.cover_image_url ? (
          <Image
            src={project.cover_image_url}
            alt={`${project.name} - ${project.city}`}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-500">No Image</div>
        )}

        <span className="absolute left-3 top-3 rounded-full bg-blue-700 px-3 py-1 text-xs font-semibold text-white capitalize">
          {project.project_type}
        </span>

        {project.featured && (
          <span className="absolute right-3 top-3 rounded-full bg-amber-300 px-3 py-1 text-xs font-bold text-amber-900">
            Featured
          </span>
        )}
      </div>

      <div className="space-y-3 p-4">
        <h3 className="line-clamp-1 text-base font-extrabold text-slate-900 transition group-hover:text-blue-700">{project.name}</h3>

        <div className="flex items-center gap-1 text-sm text-slate-600">
          <MapPin size={13} />
          <span>{project.city}, {project.state}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
          {project.total_plots && (
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1">
              <LayoutGrid size={13} />
              {project.total_plots} plots
            </span>
          )}
          {project.plot_size_min && (
            <span className="inline-flex items-center gap-1 rounded-md bg-cyan-50 px-2 py-1">
              <Maximize2 size={13} />
              {project.plot_size_min}{project.plot_size_max ? `–${project.plot_size_max}` : '+'} sq.yd
            </span>
          )}
        </div>

        {project.price_display && <p className="text-sm font-bold text-blue-700">{project.price_display}</p>}
      </div>
    </Link>
  )
}
