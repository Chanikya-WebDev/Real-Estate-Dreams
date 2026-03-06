// lib/notifications.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

interface LeadNotificationData {
  name: string
  phone: string
  preferred_time: string | null
  project_name: string | null
  project_city: string | null
  created_at: string
}

export async function notifyAdminOfLead(lead: LeadNotificationData) {
  const { data, error } = await resend.emails.send({
    // Until you verify a custom domain in Resend,
    // use onboarding@resend.dev as the from address (works on free tier)
    // After adding your domain: change to leads@yourdomain.com
    from: 'YourBrand Realty <onboarding@resend.dev>',
    to: [process.env.ADMIN_EMAIL!],
    subject: `🏠 New Site Visit — ${lead.project_name ?? 'Unknown Project'} (${lead.project_city ?? ''})`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 20px; color: #1a1a1a;">

          <div style="background: #1d4ed8; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0;">New Site Visit Request</h2>
          </div>

          <div style="border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; padding: 24px;">

            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 12px 8px; font-weight: bold; color: #6b7280; width: 140px;">Customer Name</td>
                <td style="padding: 12px 8px; font-weight: 600;">${lead.name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6; background: #f9fafb;">
                <td style="padding: 12px 8px; font-weight: bold; color: #6b7280;">Phone Number</td>
                <td style="padding: 12px 8px; font-size: 18px; font-weight: bold; color: #1d4ed8;">
                  <a href="tel:${lead.phone}" style="color: #1d4ed8; text-decoration: none;">${lead.phone}</a>
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 12px 8px; font-weight: bold; color: #6b7280;">Project</td>
                <td style="padding: 12px 8px;">${lead.project_name ?? '—'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6; background: #f9fafb;">
                <td style="padding: 12px 8px; font-weight: bold; color: #6b7280;">City</td>
                <td style="padding: 12px 8px;">${lead.project_city ?? '—'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 12px 8px; font-weight: bold; color: #6b7280;">Preferred Time</td>
                <td style="padding: 12px 8px;">${lead.preferred_time ?? 'Not specified'}</td>
              </tr>
              <tr style="background: #f9fafb;">
                <td style="padding: 12px 8px; font-weight: bold; color: #6b7280;">Received At</td>
                <td style="padding: 12px 8px;">${new Date(lead.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td>
              </tr>
            </table>

            <div style="margin-top: 24px; padding: 16px; background: #eff6ff; border-radius: 8px; border-left: 4px solid #1d4ed8;">
              <p style="margin: 0; font-size: 14px; color: #1e40af;">
                📞 Call the customer at <strong>${lead.phone}</strong> to confirm the site visit.
              </p>
            </div>

            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af; text-align: center;">
              Login to your admin dashboard to update the lead status.
            </p>
          </div>

        </body>
      </html>
    `,
  })

  // Log error but don't crash the API — lead is already saved in DB
  // even if email fails, the data is safe
  if (error) {
    console.error('[Resend] Failed to send lead notification:', error)
  }

  return { data, error }
}
