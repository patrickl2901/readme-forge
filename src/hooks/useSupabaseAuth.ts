'use client'

import { createBrowserClient } from '@/lib/supabase-browser'
import { Session, User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

export function useSupabaseAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createBrowserClient()

    // Aktuelle Session holen
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listener für Auth-Änderungen
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const signInWithMagicLink = async (email: string) => {
    const supabase = createBrowserClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { error }
  }

  const signOut = async () => {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
  }

  return { session, user, loading, signInWithMagicLink, signOut }
}
