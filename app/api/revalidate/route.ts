// app/api/revalidate/route.ts
// ─────────────────────────────────────────────────────
// POST /api/revalidate
// Called from admin dashboard after publish/edit
// Tells Vercel CDN to rebuild specific pages immediately
// Protected by REVALIDATION_SECRET so only your app can call it
// ─────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { inferListingCity } from '@/lib/city-categories'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { secret, city_slug, slug } = body

    // ── Secret check ───────────────────────────────────
    // Prevents strangers from mass-invalidating your CDN cache
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json(
        { error: 'Invalid revalidation secret' },
        { status: 401 }
      )
    }

    if (!city_slug || !slug) {
      return NextResponse.json(
        { error: 'city_slug and slug are required' },
        { status: 400 }
      )
    }

    // ── Revalidate specific project page ───────────────
    // This tells Vercel: "rebuild /shadnagar/sree-laxmi-balaji-township"
    // Only that one page is rebuilt — not the whole site
    const canonicalCity = inferListingCity({ listingCity: city_slug, citySlug: city_slug })
    const projectPath = `/${canonicalCity}/${slug}`
    revalidatePath(projectPath)

    // Also revalidate city page (project count may have changed)
    revalidatePath(`/${canonicalCity}`)

    // Also revalidate homepage (featured/latest list may have changed)
    revalidatePath('/')
    revalidatePath('/search')
    revalidateTag(`project:${slug}`, 'max')
    revalidateTag(`city:${canonicalCity}`, 'max')
    revalidateTag('projects:list', 'max')
    revalidateTag('projects:featured', 'max')
    revalidateTag('projects:latest', 'max')

    console.log(`[Revalidate] Rebuilt: ${projectPath}, /${canonicalCity}, /`)

    return NextResponse.json({
      revalidated: true,
      paths: [projectPath, `/${canonicalCity}`, '/', '/search'],
    })

  } catch (err) {
    console.error('[Revalidate API] Error:', err)
    return NextResponse.json(
      { error: 'Revalidation failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
