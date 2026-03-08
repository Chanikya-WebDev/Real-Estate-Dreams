import type { ProjectType } from '@/types'

type KeywordInput = {
  name?: string | null
  city?: string | null
  state?: string | null
  projectType?: ProjectType | string | null
  priceDisplay?: string | null
  pricePerSqyd?: number | null
  amenities?: string[] | null
  nearby?: string[] | null
  customKeywords?: string[] | null
}

const PROJECT_TYPE_LABELS: Record<string, string[]> = {
  plot: ['plots', 'open plots', 'residential plots'],
  villa: ['villas', 'villa plots', 'luxury villas'],
  apartment: ['apartments', 'flats', 'gated community apartments'],
  farmland: ['farmland', 'farm plots', 'agricultural land'],
}

function cleanKeyword(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]/g, ' ')
    .replace(/\s+/g, ' ')
}

function dedupeKeywords(values: Array<string | null | undefined>, limit = 24) {
  const unique = new Set<string>()

  for (const value of values) {
    if (!value) continue
    const normalized = cleanKeyword(value)
    if (!normalized || unique.has(normalized)) continue

    unique.add(normalized)

    if (unique.size >= limit) break
  }

  return [...unique]
}

export function generateSeoKeywords(input: KeywordInput) {
  const name = input.name?.trim() ?? ''
  const city = input.city?.trim() ?? ''
  const state = input.state?.trim() ?? ''
  const type = (input.projectType ?? 'plot').toString().toLowerCase()
  const typeTerms = PROJECT_TYPE_LABELS[type] ?? ['real estate project']
  const amenities = (input.amenities ?? []).slice(0, 8)
  const nearby = (input.nearby ?? []).slice(0, 6)

  const priceTerms: string[] = []
  if (input.priceDisplay?.trim()) {
    priceTerms.push(`${city} ${typeTerms[0]} ${input.priceDisplay}`)
  }
  if (input.pricePerSqyd) {
    priceTerms.push(`${city} plots ${input.pricePerSqyd} per sqyd`)
  }

  return dedupeKeywords([
    ...((input.customKeywords ?? []).map((k) => k.trim())),
    name,
    city,
    state,
    `${name} ${city}`,
    `${name} ${typeTerms[0]}`,
    `${city} ${typeTerms[0]}`,
    `${city} real estate`,
    `${city} property investment`,
    `${typeTerms[0]} in ${city}`,
    ...typeTerms,
    ...priceTerms,
    ...amenities,
    ...amenities.map((a) => `${city} ${a}`),
    ...nearby,
    ...nearby.map((n) => `${name} near ${n}`),
    'rera approved',
    'dtcp approved',
    'bank loan available',
    'free site visit',
    'gem group realty',
  ])
}
