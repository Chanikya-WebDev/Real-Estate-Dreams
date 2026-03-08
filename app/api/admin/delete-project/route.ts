// app/api/admin/delete-project/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId } = await req.json()
  if (!projectId) return NextResponse.json({ error: 'No project ID' }, { status: 400 })

  // Delete media rows first (FK constraint)
  await supabaseAdmin.from('project_media').delete().eq('project_id', projectId)

  // Delete the project
  const { error } = await supabaseAdmin.from('projects').delete().eq('id', projectId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Revalidate the cache
  const secret = process.env.NEXT_PUBLIC_REVALIDATION_SECRET
  if (secret) {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate?secret=${secret}&path=/`, { method: 'POST' })
  }

  return NextResponse.json({ success: true })
}
