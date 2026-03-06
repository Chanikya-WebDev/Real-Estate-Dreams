// app/(admin)/admin/page.tsx
import { supabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'
import { FolderOpen, Users, TrendingUp, PlusCircle } from 'lucide-react'

async function getStats() {
  const [projects, leads, newLeads] = await Promise.all([
    supabaseAdmin.from('projects').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('leads').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'new'),
  ])
  return {
    totalProjects: projects.count ?? 0,
    totalLeads:    leads.count ?? 0,
    newLeads:      newLeads.count ?? 0,
  }
}

async function getRecentLeads() {
  const { data } = await supabaseAdmin
    .from('leads')
    .select('id, name, phone, project_name, project_city, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)
  return data ?? []
}

export default async function AdminDashboard() {
  const [stats, recentLeads] = await Promise.all([
    getStats(),
    getRecentLeads(),
  ])

  const statCards = [
    { label: 'Total Projects', value: stats.totalProjects, icon: FolderOpen, color: 'bg-blue-50 text-blue-700',  href: '/admin/projects' },
    { label: 'Total Leads',    value: stats.totalLeads,    icon: Users,      color: 'bg-green-50 text-green-700', href: '/admin/leads' },
    { label: 'New Leads',      value: stats.newLeads,      icon: TrendingUp, color: 'bg-yellow-50 text-yellow-700', href: '/admin/leads' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 transition"
        >
          <PlusCircle size={16} />
          New Project
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
              </div>
              <div className={`p-3 rounded-xl ${color}`}>
                <Icon size={22} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Recent Leads</h2>
          <Link href="/admin/leads" className="text-blue-700 text-sm hover:underline">
            View all →
          </Link>
        </div>
        <div className="space-y-3">
          {recentLeads.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">No leads yet</p>
          )}
          {recentLeads.map((lead) => (
            <div key={lead.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="font-medium text-gray-900 text-sm">{lead.name}</p>
                <p className="text-gray-500 text-xs">{lead.phone} · {lead.project_name}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                lead.status === 'new'
                  ? 'bg-yellow-100 text-yellow-700'
                  : lead.status === 'converted'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {lead.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
