// lib/slugify.ts
// Called when admin types a project name or city → auto-generates the URL slug
import slugifyLib from 'slugify'

export function toSlug(text: string): string {
  return slugifyLib(text, {
    lower: true,       // SHADNAGAR → shadnagar
    strict: true,      // removes special chars like & , ( )
    trim: true         // removes leading/trailing spaces
  })
}

// Examples:
// toSlug("Sree Laxmi Balaji Township") → "sree-laxmi-balaji-township"
// toSlug("Shadnagar")                  → "shadnagar"
// toSlug("IT Hub & Villas!")           → "it-hub-villas"
