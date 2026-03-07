// app/(admin)/layout.tsx
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/admin/Sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Read pathname forwarded by proxy.ts
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''

  // ── Login page: no Sidebar, no auth redirect ───────────
  // Without this check: layout sees !user → redirect('/admin/login')
  // → layout runs again → infinite 307 loop
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // ── All other admin pages: verify session ──────────────
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
