// app/api/admin/ai-parse/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSeoKeywords } from '@/lib/seo-keywords'
import { inferListingCity } from '@/lib/city-categories'

const GEMINI_TIMEOUT_MS = 45000
const GEMINI_MAX_RETRIES = 3
const SUPPORTED_GEMINI_MODELS = new Set([
  'gemini-flash-latest',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
])

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function extractGeminiText(payload: any): string {
  return (payload?.candidates ?? [])
    .flatMap((candidate: any) => candidate?.content?.parts ?? [])
    .map((part: any) => part?.text ?? '')
    .join('\n')
    .trim()
}

function getModelCandidates() {
  const primary = process.env.GEMINI_MODEL ?? 'gemini-flash-latest'
  const fallback = process.env.GEMINI_FALLBACK_MODEL ?? 'gemini-2.0-flash-lite'
  const secondFallback = process.env.GEMINI_SECOND_FALLBACK_MODEL ?? 'gemini-2.0-flash'
  return [...new Set([primary, fallback, secondFallback])]
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .filter((value) => SUPPORTED_GEMINI_MODELS.has(value))
}

function toSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
}

function firstNonEmptyLine(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean) ?? 'New Project'
}

function extractArrayAfterLabel(text: string, label: string) {
  const regex = new RegExp(`${label}\\s*[:\\-]\\s*([^\\n]+)`, 'i')
  const match = text.match(regex)
  if (!match?.[1]) return []
  return match[1]
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function extractNumber(text: string, regex: RegExp) {
  const match = text.match(regex)
  if (!match?.[1]) return null
  const value = Number(match[1].replace(/,/g, ''))
  return Number.isFinite(value) ? value : null
}

function buildLocalFallback(rawText: string) {
  const name = firstNonEmptyLine(rawText).replace(/^[-•*\d.\s]+/, '').trim()
  const cityMatch = rawText.match(/(?:location|city)\s*[:\-]\s*([^\n,]+)/i)
  const city = cityMatch?.[1]?.trim() ?? 'Hyderabad'
  const state = /andhra/i.test(rawText) ? 'Andhra Pradesh' : 'Telangana'
  const amenities = extractArrayAfterLabel(rawText, 'amenities')
  const nearby = extractArrayAfterLabel(rawText, 'nearby')
  const pricePerSqyd = extractNumber(rawText, /(?:₹|rs\.?)\s*([\d,]{3,})\s*\/?\s*sq\.?\s*yd/i)
  const totalArea = extractNumber(rawText, /([\d,.]+)\s*acres?/i)
  const totalPlots = extractNumber(rawText, /(\d{2,5})\s*plots?/i)
  const plotSizeMin = extractNumber(rawText, /(?:from|min)\s*(\d{2,5})\s*(?:sq\.?\s*yards?|sq\.?\s*yd)/i)
  const plotSizeMax = extractNumber(rawText, /(?:to|max|upto)\s*(\d{2,5})\s*(?:sq\.?\s*yards?|sq\.?\s*yd)/i)
  const listingCity = inferListingCity({ city, rawText, nearby })

  const description = `${name} is a ${state} project located in and around ${city}. It offers strong connectivity and practical layout planning for families and investors.

Amenities include ${amenities.length > 0 ? amenities.slice(0, 6).join(', ') : 'essential infrastructure and approved layout features'}. Contact the sales team for latest availability and approvals.

This project is positioned for long-term value with current market demand in ${city}. Book a site visit to compare unit sizes, pricing and location benefits.`

  const seoTitle = `${name} in ${city} | Plots & Villas`
  const seoDescription = `Explore ${name} in ${city}. Get latest price, plot sizes, amenities and free site visit details from Open Plots And Villas.`
  const priceDisplay = pricePerSqyd ? `₹${pricePerSqyd.toLocaleString('en-IN')}/sq.yd onwards` : null

  const parsed: Record<string, any> = {
    name,
    city,
    listing_city: listingCity,
    state,
    address: null,
    project_type: 'plot',
    total_area: totalArea,
    total_plots: totalPlots,
    plot_size_min: plotSizeMin,
    plot_size_max: plotSizeMax,
    price_per_sqyd: pricePerSqyd,
    price_display: priceDisplay,
    rera_number: null,
    amenities,
    nearby,
    description,
    seo_title: seoTitle,
    seo_description: seoDescription,
    featured: false,
  }

  parsed.slug = toSlug(parsed.name)
  parsed.city_slug = toSlug(parsed.city)
  parsed.seo_keywords = generateSeoKeywords({
    name: parsed.name,
    city: parsed.city,
    state: parsed.state,
    projectType: parsed.project_type,
    priceDisplay: parsed.price_display,
    pricePerSqyd: parsed.price_per_sqyd,
    amenities: parsed.amenities,
    nearby: parsed.nearby,
  })

  return parsed
}

async function callGeminiWithRetry(geminiApiKey: string, systemPrompt: string, rawText: string) {
  const modelCandidates = getModelCandidates()
  if (modelCandidates.length === 0) {
    throw new Error('No valid Gemini model configured. Set GEMINI_MODEL to a supported model.')
  }
  let lastErrorMessage = 'Gemini request failed'

  for (const model of modelCandidates) {
    for (let attempt = 1; attempt <= GEMINI_MAX_RETRIES; attempt++) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS)

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': geminiApiKey,
          },
          signal: controller.signal,
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemPrompt }],
            },
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
              maxOutputTokens: 3000,
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: rawText }],
              },
            ],
          }),
        })

        clearTimeout(timeout)

        if (res.ok) {
          const payload = await res.json()
          const content = extractGeminiText(payload)
          if (!content) {
            throw new Error('Gemini returned empty response')
          }
          return content
        }

        const errBody = await res.json()
        const status = errBody?.error?.status
        const message = errBody?.error?.message ?? 'Gemini request failed'
        lastErrorMessage = `${model}: ${message}`

        const shouldRetry = res.status === 429 || res.status === 503 || status === 'UNAVAILABLE' || status === 'RESOURCE_EXHAUSTED'
        if (!shouldRetry || attempt === GEMINI_MAX_RETRIES) {
          console.error('Gemini API error:', { model, attempt, errBody })
          break
        }

        await sleep(attempt * 1500)
      } catch (error: any) {
        clearTimeout(timeout)
        const isAbort = error?.name === 'AbortError'
        lastErrorMessage = isAbort
          ? `${model}: Request timed out after ${GEMINI_TIMEOUT_MS / 1000}s`
          : `${model}: ${error?.message ?? 'Request failed'}`

        if (attempt === GEMINI_MAX_RETRIES) break
        await sleep(attempt * 1500)
      }
    }
  }

  throw new Error(lastErrorMessage)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { rawText } = await req.json()
  if (!rawText?.trim()) return NextResponse.json({ error: 'No text provided' }, { status: 400 })
  const geminiApiKey = process.env.GEMINI_API_KEY
  if (!geminiApiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 })
  }

  const systemPrompt = `You are a real estate data extractor for an Indian property website called Open Plots And Villas (Telangana & Andhra Pradesh).

Extract all available data from the raw text provided. Return ONLY a single valid raw JSON object (no markdown, no explanation, no extra text).

Fields to extract (use null for missing data):

{
  "name": "full project name",
  "city": "city name (e.g. Shadnagar, Hyderabad, Vijayawada)",
  "listing_city": "hyderabad|bangalore|vizag|vijayawada",
  "state": "state (e.g. Telangana, Andhra Pradesh)",
  "address": "most specific address available: survey no/village/mandal/district",
  "project_type": "plot|villa|apartment|farmland",
  "total_area": number_or_null,
  "total_plots": number_or_null,
  "plot_size_min": number_or_null,
  "plot_size_max": number_or_null,
  "price_per_sqyd": number_or_null,
  "price_display": "e.g. ₹23,000/sq.yd onwards",
  "rera_number": "RERA/DTCP reg number or null",
  "amenities": ["Clubhouse", "24/7 Security", "Tar Roads", "Drainage", "DTCP Approved", "RERA Approved"],
  "nearby": ["5 min from ORR Exit 14", "2 km from Shadnagar Bus Stand"],
  "description": "Write 3 detailed SEO-optimized paragraphs in English. Para 1: project name, location, connectivity, USPs. Para 2: amenities, approvals (RERA/DTCP), bank loan availability. Para 3: investment potential, area growth, why buy now.",
  "seo_title": "under 60 chars — include project name + city + plots keyword",
  "seo_description": "under 155 chars — city, project type, price hint, CTA like Book free site visit",
  "seo_keywords": ["comma-free keyword 1", "keyword 2", "keyword 3"],
  "featured": false
}

RULES:
- Do NOT include latitude, longitude or map_embed_url — admin fills those manually
- amenities: always add "RERA Approved" and "DTCP Approved" if mentioned anywhere in text
- nearby: extract every distance/landmark mention, rewrite as short friendly strings
- listing_city: pick one from hyderabad|bangalore|vizag|vijayawada based on project locality
- price_per_sqyd: numeric value only, no ₹ symbol
- description: write fresh SEO content, do NOT copy paste raw text verbatim`

  try {
    const content = await callGeminiWithRetry(geminiApiKey, systemPrompt, rawText)

    const cleaned = content
      .replace(/^```json\s*/i, '')
      .replace(/\s*```$/, '')
      .trim()

    let parsed: Record<string, any>
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('Model did not return valid JSON')
      parsed = JSON.parse(match[0])
    }

    // Auto-generate slugs
    parsed.slug = (parsed.name ?? '')
      .toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
    parsed.city_slug = (parsed.city ?? '')
      .toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
    parsed.listing_city = inferListingCity({
      listingCity: parsed.listing_city,
      city: parsed.city,
      citySlug: parsed.city_slug,
      address: parsed.address,
      nearby: Array.isArray(parsed.nearby) ? parsed.nearby : [],
      rawText,
    })
    parsed.seo_keywords = generateSeoKeywords({
      name: parsed.name,
      city: parsed.city,
      state: parsed.state,
      projectType: parsed.project_type,
      priceDisplay: parsed.price_display,
      pricePerSqyd: parsed.price_per_sqyd,
      amenities: Array.isArray(parsed.amenities) ? parsed.amenities : [],
      nearby: Array.isArray(parsed.nearby) ? parsed.nearby : [],
      customKeywords: Array.isArray(parsed.seo_keywords) ? parsed.seo_keywords : [],
    })

    return NextResponse.json({ data: parsed })

  } catch (err: any) {
    console.error('AI parse error:', err)
    const fallbackParsed = buildLocalFallback(rawText)
    const message = err?.message ?? 'AI unavailable'
    console.warn('Returning local fallback parse due to Gemini failure:', message)
    return NextResponse.json(
      {
        data: fallbackParsed,
        warning: `AI provider unavailable. Returned fallback parse: ${message}`,
      },
      { status: 200 }
    )
  }
}
