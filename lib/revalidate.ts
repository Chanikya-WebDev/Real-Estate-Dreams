// lib/revalidate.ts
export async function revalidateProjectPages(
  city_slug: string,
  slug: string
): Promise<{ revalidated: boolean; paths?: string[]; error?: string }> {
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

    if (!res.ok) {
      const data = await res.json()
      console.error('[Revalidate] API error:', data)
      return { revalidated: false, error: data.error }
    }

    return await res.json()
  } catch (err) {
    console.error('[Revalidate] Fetch failed:', err)
    return { revalidated: false, error: 'Network error' }
  }
}
