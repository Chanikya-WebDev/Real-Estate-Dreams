// components/admin/LeadsTable.tsx
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Lead, LeadStatus } from '@/types'
import { Phone } from 'lucide-react'

const STATUS_COLORS: Record<LeadStatus, string> = {
  new:              'bg-yellow-100 text-yellow-700',
  contacted:        'bg-blue-100 text-blue-700',
  visit_scheduled:  'bg-purple-100 text-purple-700',
  converted:        'bg-green-100 text-green-700',
  lost:             'bg-gray-100 text-gray-500',
}

export default function LeadsTable({ leads: initial }: { leads: Lead[] }) {
  const [leads, setLeads]         = useState(initial)
  const [updating, setUpdating]   = useState<string | null>(null)
  const supabase                  = createClient()

  async function updateStatus(leadId: string, status: LeadStatus) {
    setUpdating(leadId)
    const { error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', leadId)

    if (!error) {
      setLeads(leads.map(l => l.id === leadId ? { ...l, status } : l))
    }
    setUpdating(null)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Project</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Preferred Time</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-10">
                  No leads yet
                </td>
              </tr>
            )}
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{lead.name}</p>
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center gap-1 text-blue-700 hover:underline mt-0.5"
                  >
                    <Phone size={12} />
                    {lead.phone}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <p className="text-gray-900">{lead.project_name}</p>
                  <p className="text-gray-400 text-xs">{lead.project_city}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {lead.preferred_time ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={lead.status}
                    disabled={updating === lead.id}
                    onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                    className={`text-xs px-2 py-1.5 rounded-lg border-0 font-medium cursor-pointer ${STATUS_COLORS[lead.status]}`}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="visit_scheduled">Visit Scheduled</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(lead.created_at).toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
