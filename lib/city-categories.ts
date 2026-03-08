export const CITY_CATEGORIES = [
  { slug: 'hyderabad', label: 'Hyderabad' },
  { slug: 'bangalore', label: 'Bangalore' },
  { slug: 'vizag', label: 'Vizag' },
  { slug: 'vijayawada', label: 'Vijayawada' },
] as const

export type ListingCitySlug = (typeof CITY_CATEGORIES)[number]['slug']

const CITY_KEYWORDS: Record<ListingCitySlug, string[]> = {
  hyderabad: [
    'hyderabad',
    'shadnagar',
    'shamshabad',
    'gachibowli',
    'kukatpally',
    'miyapur',
    'medchal',
    'yadadri',
    'yadagirigutta',
    'orr',
    'telangana',
  ],
  bangalore: [
    'bangalore',
    'bengaluru',
    'electronic city',
    'whitefield',
    'sarjapur',
    'karnataka',
  ],
  vizag: [
    'vizag',
    'visakhapatnam',
    'anakapalle',
    'bheemunipatnam',
    'andhra',
  ],
  vijayawada: [
    'vijayawada',
    'amaravati',
    'mangalagiri',
    'guntur',
    'tenali',
    'andhra',
  ],
}

export function normalizeListingCity(value?: string | null): ListingCitySlug | null {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  return CITY_CATEGORIES.find((c) => c.slug === normalized || c.label.toLowerCase() === normalized)?.slug ?? null
}

type InferInput = {
  listingCity?: string | null
  city?: string | null
  citySlug?: string | null
  address?: string | null
  nearby?: string[] | null
  rawText?: string | null
}

export function inferListingCity(input: InferInput): ListingCitySlug {
  const direct = normalizeListingCity(input.listingCity)
  if (direct) return direct

  const searchable = [
    input.city,
    input.citySlug,
    input.address,
    ...(input.nearby ?? []),
    input.rawText,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  for (const [slug, keywords] of Object.entries(CITY_KEYWORDS) as Array<[ListingCitySlug, string[]]>) {
    if (keywords.some((keyword) => searchable.includes(keyword))) {
      return slug
    }
  }

  return 'hyderabad'
}

export function getListingCityLabel(slug: string) {
  return CITY_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug
}
