// components/admin/Sidebar.tsx
'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  PlusCircle,
  LogOut,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard',    href: '/admin',               icon: LayoutDashboard },
  { label: 'Projects',     href: '/admin/projects',      icon: FolderOpen },
  { label: 'New Project',  href: '/admin/projects/new',  icon: PlusCircle },
  { label: 'Leads',        href: '/admin/leads',         icon: Users },
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
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white flex flex-col z-40">

      {/* Brand */}
      <div className="px-6 py-5 border-b border-gray-700">
        <h1 className="font-bold text-lg text-white">YourBrand Realty</h1>
        <p className="text-gray-400 text-xs mt-0.5">Admin Panel</p>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active =
            href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                active
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-4 py-4 border-t border-gray-700">
        <p className="text-gray-400 text-xs truncate px-3 mb-2">{userEmail}</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-red-900 hover:text-white transition w-full"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  )
}
