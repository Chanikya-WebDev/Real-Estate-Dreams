// lib/supabase/admin.ts
// ─────────────────────────────────────────────────────
// ONLY use this inside /app/api/ route handlers
// NEVER import this into any page or component
// Service role key bypasses ALL RLS policies
// ─────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js'

// Note: No NEXT_PUBLIC_ prefix on either variable
// Both are server-only secrets, never sent to the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,  // Server client doesn't need token refresh
    persistSession: false     // Server client doesn't store sessions
  }
})
