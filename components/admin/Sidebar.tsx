'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, FolderOpen, Users, PlusCircle, LogOut } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Projects', href: '/admin/projects', icon: FolderOpen },
  { label: 'New Project', href: '/admin/projects/new', icon: PlusCircle },
  { label: 'Leads', href: '/admin/leads', icon: Users },
]

export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="z-40 border-b border-blue-100 bg-gradient-to-r from-blue-900 to-indigo-900 text-white md:fixed md:left-0 md:top-0 md:h-full md:w-64 md:border-b-0 md:border-r">
      <div className="border-b border-white/20 px-4 py-4 md:px-6 md:py-5">
        <h1 className="text-lg font-extrabold text-white">YourBrand Realty</h1>
        <p className="mt-0.5 text-xs text-blue-100">Admin Panel</p>
      </div>

      <nav className="flex gap-2 overflow-x-auto px-3 py-3 md:block md:space-y-1 md:overflow-visible md:px-4 md:py-4">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition md:gap-3 ${
                active ? 'bg-amber-300 font-semibold text-slate-900' : 'text-blue-100 hover:bg-white/15 hover:text-white'
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/20 px-4 py-4 md:absolute md:bottom-0 md:w-full">
        <p className="mb-2 truncate px-1 text-xs text-blue-100">{userEmail}</p>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-blue-100 transition hover:bg-red-700 hover:text-white"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  )
}
