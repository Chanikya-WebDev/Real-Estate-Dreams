// app/(admin)/admin/projects/[id]/edit/page.tsx
import { supabaseAdmin } from '@/lib/supabase/admin'
import ProjectForm from '@/components/admin/ProjectForm'
import { notFound } from 'next/navigation'

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: project } = await supabaseAdmin
    .from('projects')
    .select('*, project_media(*)')
    .eq('id', id)
    .order('display_order', { referencedTable: 'project_media', ascending: true })
    .single()

  if (!project) notFound()

  // Reshape project_media to match UploadedMedia interface
  const media = (project.project_media ?? []).map((m: any) => ({
    cloudinary_id:  m.cloudinary_id,
    url:            m.url,
    thumbnail_url:  m.thumbnail_url ?? m.url,
    media_type:     m.media_type as 'image' | 'video',
    display_order:  m.display_order,
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Edit: {project.name}
      </h1>
      <ProjectForm mode="edit" project={{ ...project, project_media: media }} />
    </div>
  )
}
