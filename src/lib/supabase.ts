import { createServerClient as createServerClientCore } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { CookieOptions } from '@supabase/ssr'

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

export async function createServerClientSSR() {
  const cookieStore = await cookies()
  const { url, anonKey } = validateEnvVars()

  return createServerClientCore(url, anonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

export const createServerClient = createServerClientSSR
