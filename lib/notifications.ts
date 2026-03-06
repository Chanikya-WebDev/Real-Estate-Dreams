// lib/notifications.ts
// ─────────────────────────────────────────────────────
// Called from /app/api/leads/route.ts after a lead is saved
// Sends email to admin using Resend
// Fire-and-forget: does not block the API response
// ─────────────────────────────────────────────────────
import { Resend } from 'resend'
import type { Lead } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY!)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!

export async function notifyAdminOfLead(lead: Lead) {
  await resend.emails.send({
    from: 'leads@yourdomain.com',       // must be a verified domain in Resend
    to: ADMIN_EMAIL,
    subject: `New Site Visit Request — ${lead.project_name} (${lead.project_city})`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px;">
        <h2 style="color: #1a1a1a;">New Site Visit Request</h2>
        <table style="width:100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; font-weight: bold;">Name</td>
            <td style="padding: 8px;">${lead.name}</td>
          </tr>
          <tr style="background: #f5f5f5;">
            <td style="padding: 8px; font-weight: bold;">Phone</td>
            <td style="padding: 8px;">${lead.phone}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Project</td>
            <td style="padding: 8px;">${lead.project_name}</td>
          </tr>
          <tr style="background: #f5f5f5;">
            <td style="padding: 8px; font-weight: bold;">City</td>
            <td style="padding: 8px;">${lead.project_city}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Preferred Time</td>
            <td style="padding: 8px;">${lead.preferred_time ?? 'Not specified'}</td>
          </tr>
          <tr style="background: #f5f5f5;">
            <td style="padding: 8px; font-weight: bold;">Received At</td>
            <td style="padding: 8px;">${new Date(lead.created_at).toLocaleString('en-IN')}</td>
          </tr>
        </table>
        <p style="margin-top: 20px; color: #666;">
          Login to your dashboard to update the lead status.
        </p>
      </div>
    `
  })
}
