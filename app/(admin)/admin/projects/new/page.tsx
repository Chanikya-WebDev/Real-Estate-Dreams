// app/(admin)/admin/projects/new/page.tsx
import ProjectForm from '@/components/admin/ProjectForm'

export default function NewProjectPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Create New Project</h1>
      <ProjectForm mode="create" />
    </div>
  )
}
