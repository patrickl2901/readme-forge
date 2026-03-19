import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

let supabaseClient: SupabaseClient<Database> | null = null

function validateEnvVars(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    const missing: string[] = []
    if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')

    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      'Please add these to your .env.local file.'
    )
  }

  return { url, anonKey }
}

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseClient) {
    const { url, anonKey } = validateEnvVars()
    supabaseClient = createClient<Database>(url, anonKey)
  }
  return supabaseClient
}

export function createBrowserClient(): SupabaseClient<Database> {
  return getSupabaseClient()
}
