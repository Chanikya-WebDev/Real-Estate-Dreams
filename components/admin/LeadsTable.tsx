'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Lead, LeadStatus } from '@/types'
import { Phone } from 'lucide-react'

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-blue-100 text-blue-800',
  visit_scheduled: 'bg-purple-100 text-purple-800',
  converted: 'bg-green-100 text-green-800',
  lost: 'bg-gray-100 text-gray-700',
}

export default function LeadsTable({ leads: initial }: { leads: Lead[] }) {
  const [leads, setLeads] = useState(initial)
  const [updating, setUpdating] = useState<string | null>(null)
  const supabase = createClient()

  async function updateStatus(leadId: string, status: LeadStatus) {
    setUpdating(leadId)
    const { error } = await supabase.from('leads').update({ status }).eq('id', leadId)
    if (!error) setLeads(leads.map((l) => (l.id === leadId ? { ...l, status } : l)))
    setUpdating(null)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
      <div className="space-y-3 p-3 md:hidden">
        {leads.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No leads yet</p>}
        {leads.map((lead) => (
          <article key={lead.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{lead.name}</p>
                <a href={`tel:${lead.phone}`} className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-blue-700">
                  <Phone size={12} /> {lead.phone}
                </a>
                <p className="mt-1 text-xs text-slate-600">{lead.project_name} · {lead.project_city}</p>
              </div>
              <select
                value={lead.status}
                disabled={updating === lead.id}
                onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                className={`rounded-lg px-2 py-1 text-xs font-semibold ${STATUS_COLORS[lead.status]}`}
              >
                <option value="new">new</option>
                <option value="contacted">contacted</option>
                <option value="visit_scheduled">visit_scheduled</option>
                <option value="converted">converted</option>
                <option value="lost">lost</option>
              </select>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Customer</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Project</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Preferred Time</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Status</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-400">No leads yet</td>
              </tr>
            )}
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{lead.name}</p>
                  <a href={`tel:${lead.phone}`} className="mt-0.5 flex items-center gap-1 text-blue-700 hover:underline">
                    <Phone size={12} />
                    {lead.phone}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <p className="text-slate-900">{lead.project_name}</p>
                  <p className="text-xs text-slate-500">{lead.project_city}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{lead.preferred_time ?? '—'}</td>
                <td className="px-4 py-3">
                  <select
                    value={lead.status}
                    disabled={updating === lead.id}
                    onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                    className={`cursor-pointer rounded-lg border-0 px-2 py-1.5 text-xs font-medium ${STATUS_COLORS[lead.status]}`}
                  >
                    <option value="new">new</option>
                    <option value="contacted">contacted</option>
                    <option value="visit_scheduled">visit_scheduled</option>
                    <option value="converted">converted</option>
                    <option value="lost">lost</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{new Date(lead.created_at).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
