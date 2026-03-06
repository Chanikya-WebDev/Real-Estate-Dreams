// app/(admin)/layout.tsx — SIMPLIFIED
// proxy.ts handles the redirect, layout just adds the sidebar
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/admin/Sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Keep this as safety net ONLY for dashboard/projects/leads
  // Login page no longer reaches this layout
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar userEmail={user.email ?? ''} />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
