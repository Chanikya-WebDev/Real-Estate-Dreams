// app/api/leads/route.ts
// ─────────────────────────────────────────────────────
// POST /api/leads
// Called by BookingForm when user submits site visit request
// Uses supabaseAdmin (service role) because:
//   - anon users can INSERT leads via RLS policy
//   - but we also need to READ project data for enrichment
//   - service role is simpler and safe here (server-only)
// ─────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { notifyAdminOfLead } from '@/lib/notifications'

// Simple in-memory rate limit store
// Works for MVP — for production scale use Upstash Redis
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const windowMs = 10 * 60 * 1000  // 10 minutes
  const maxRequests = 3             // max 3 submissions per IP per 10 minutes

  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    // First request or window expired — reset
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs })
    return false
  }

  if (entry.count >= maxRequests) {
    return true  // blocked
  }

  entry.count++
  return false
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      project_id,
      name,
      phone,
      preferred_time,
      source_url,
      utm_source,
      utm_medium,
      utm_campaign,
      referrer,
      honeypot,   // hidden spam trap field from BookingForm
    } = body

    // ── Honeypot check ─────────────────────────────────
    // Real users never see or fill this field
    // Bots that auto-fill all fields will trigger this
    if (honeypot) {
      // Silent success — don't tell bot it was blocked
      return NextResponse.json({ success: true })
    }

    // ── Basic validation ───────────────────────────────
    if (!project_id || !name?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: 'Name, phone and project are required' },
        { status: 400 }
      )
    }

    // ── Phone format validation ────────────────────────
    // Indian mobile numbers: start with 6-9, exactly 10 digits
    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(phone.replace(/\s|-/g, ''))) {
      return NextResponse.json(
        { error: 'Enter a valid 10-digit Indian mobile number' },
        { status: 400 }
      )
    }

    // ── Rate limiting ──────────────────────────────────
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown'

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // ── Insert lead into Supabase ──────────────────────
    // DB trigger (trg_enrich_lead) auto-fills project_name and project_city
    const { data: lead, error: dbError } = await supabaseAdmin
      .from('leads')
      .insert({
        project_id,
        name: name.trim(),
        phone: phone.replace(/\s|-/g, ''),  // normalize: remove spaces/dashes
        preferred_time: preferred_time ?? null,
        source_url: source_url ?? null,
        utm_source: utm_source ?? null,
        utm_medium: utm_medium ?? null,
        utm_campaign: utm_campaign ?? null,
        referrer: referrer ?? null,
        ip_address: ip,
      })
      .select()   // returns the inserted row including trigger-filled fields
      .single()

    if (dbError) {
      console.error('[Leads API] DB insert error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save your request. Please try again.' },
        { status: 500 }
      )
    }

    // ── Send email notification ────────────────────────
    // Fire-and-forget: don't await — respond to user instantly
    // If email fails, lead is already saved safely in DB
    notifyAdminOfLead({
      name: lead.name,
      phone: lead.phone,
      preferred_time: lead.preferred_time,
      project_name: lead.project_name,
      project_city: lead.project_city,
      created_at: lead.created_at,
    }).catch((err) => {
      console.error('[Leads API] Notification error:', err)
    })

    return NextResponse.json({ success: true }, { status: 201 })

  } catch (err) {
    console.error('[Leads API] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// Block GET requests — this endpoint is POST only
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
