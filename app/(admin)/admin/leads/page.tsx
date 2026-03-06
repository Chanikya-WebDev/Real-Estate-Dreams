// app/(admin)/admin/leads/page.tsx
import { supabaseAdmin } from '@/lib/supabase/admin'
import LeadsTable from '@/components/admin/LeadsTable'

export const revalidate = 0

async function getAllLeads() {
  const { data } = await supabaseAdmin
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
  return data ?? []
}

export default async function LeadsPage() {
  const leads = await getAllLeads()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Leads ({leads.length})
      </h1>
      <LeadsTable leads={leads} />
    </div>
  )
}
