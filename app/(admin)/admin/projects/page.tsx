// app/(admin)/admin/projects/page.tsx
import { supabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'
import { PlusCircle, Pencil, Eye, EyeOff } from 'lucide-react'
import DeleteProjectButton from '@/components/admin/DeleteProjectButton'

export const revalidate = 0

async function getAllProjects() {
  const { data } = await supabaseAdmin
    .from('projects')
    .select('id, name, city, city_slug, slug, project_type, published, featured, created_at, cover_image_url')
    .order('created_at', { ascending: false })
  return data ?? []
}

export default async function ProjectsPage() {
  const projects = await getAllProjects()

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">
          Projects ({projects.length})
        </h1>
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 transition"
        >
          <PlusCircle size={16} />
          New Project
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Project</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">City</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Type</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {projects.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-10">
                  No projects yet. Create your first one!
                </td>
              </tr>
            )}
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  <div className="flex flex-col">
                    <span>
                      {project.name}
                      {project.featured && (
                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">Featured</span>
                      )}
                    </span>
                    {project.city_slug && project.slug && (
                      <a
                        href={`/${project.city_slug}/${project.slug}`}
                        target="_blank"
                        className="text-xs text-blue-500 hover:underline mt-0.5"
                      >
                        /{project.city_slug}/{project.slug} ↗
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-700">{project.city}</td>
                <td className="px-4 py-3 capitalize text-slate-700">{project.project_type}</td>
                <td className="px-4 py-3">
                  {project.published ? (
                    <span className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded-full text-xs w-fit">
                      <Eye size={11} /> Published
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-xs w-fit">
                      <EyeOff size={11} /> Draft
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/projects/${project.id}/edit`}
                      className="flex items-center gap-1.5 text-blue-700 hover:underline text-sm"
                    >
                      <Pencil size={13} /> Edit
                    </Link>
                    <DeleteProjectButton
                      projectId={project.id}
                      projectName={project.name}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </div>
  )
}
