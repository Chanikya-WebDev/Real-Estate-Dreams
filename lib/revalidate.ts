// lib/revalidate.ts
// ─────────────────────────────────────────────────────
// Called after admin publishes, edits, or unpublishes a project
// Triggers CDN cache rebuild for affected pages
// ─────────────────────────────────────────────────────
export async function revalidateProjectPages(
  city_slug: string,
  slug: string
) {
  try {
    const res = await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.NEXT_PUBLIC_REVALIDATION_SECRET,
        city_slug,
        slug,
      }),
    })

    const data = await res.json()
    return data
  } catch (err) {
    console.error('[Revalidate Helper] Failed:', err)
  }
}
