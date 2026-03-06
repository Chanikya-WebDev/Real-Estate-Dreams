// lib/supabase/server.ts
// ─────────────────────────────────────────
// USE THIS in: Server Components, Route Handlers, ISR pages
// Reads session from server-side cookies
// Runs on Vercel servers, NEVER in the browser
// ─────────────────────────────────────────
// import { createServerClient } from '@supabase/ssr'
// import { cookies } from 'next/headers'

// export async function createClient() {
//   const cookieStore = await cookies()

//   return createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() { return cookieStore.getAll() },
//         setAll(cookiesToSet) {
//           try {
//             cookiesToSet.forEach(({ name, value, options }) =>
//               cookieStore.set(name, value, options)
//             )
//           } catch {} // Safe to ignore in Server Components
//         },
//       },
//     }
//   )
// }


// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {                                             // ← Fix 1: opening {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )                                     // ← Fix 2: closing ) for forEach
          } catch {}
        },
      },
    }                                             // ← Fix 3: closing } for options
  )                                               // ← Fix 4: closing ) for createServerClient
}                                                 // ← Fix 5: closing } for createClient
