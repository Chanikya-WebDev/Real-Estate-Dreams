// components/admin/DeleteProjectButton.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

interface Props {
  projectId: string
  projectName?: string
}

export default function DeleteProjectButton({ projectId, projectName }: Props) {
  const router   = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    const label = projectName ? `Delete "${projectName}"? This cannot be undone.` : 'Delete this project? This cannot be undone.'
    if (!confirm(label)) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/delete-project', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ projectId }),
      })
      if (!res.ok) {
        const json = await res.json()
        alert(json.error ?? 'Delete failed')
        return
      }
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      title="Delete project"
      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-40"
    >
      <Trash2 size={16} />
    </button>
  )
}
