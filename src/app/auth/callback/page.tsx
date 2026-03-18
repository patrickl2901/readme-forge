'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase-browser'
import { Loader2, CheckCircle } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createBrowserClient()
      
      // First try to exchange code for session
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        
        if (exchangeError) {
          setErrorMessage(exchangeError.message)
          setStatus('error')
          return
        }

        // Auth successful
        setStatus('success')
        
        // Notify other tabs via localStorage
        try {
          localStorage.setItem('auth_complete', 'true')
        } catch {
          // localStorage unavailable
        }

        // Hybrid approach: redirect user back to the app
        if (window.opener) {
          // User came from popup - redirect the opener tab
          window.opener.location.href = '/dashboard'
          // Close this popup window
          window.close()
        } else {
          // User clicked email link - redirect this tab to dashboard
          window.location.href = '/dashboard'
        }
      } else {
        // Check if already authenticated
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          setStatus('success')
          
          // Notify other tabs via localStorage
          try {
            localStorage.setItem('auth_complete', 'true')
          } catch {
            // localStorage unavailable
          }

          // Hybrid approach: redirect user back to the app
          if (window.opener) {
            window.opener.location.href = '/dashboard'
            window.close()
          } else {
            window.location.href = '/dashboard'
          }
        } else {
          setErrorMessage('No authorization code found')
          setStatus('error')
        }
      }
    }

    handleCallback()
  }, [router])

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Successfully signed in!
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            Redirecting you to the app...
          </p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-red-600 mb-2">Authentication Failed</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">{errorMessage}</p>
          <button 
            onClick={() => window.close()} 
            className="text-emerald-600 hover:underline cursor-pointer"
          >
            Close this window
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
        <p className="text-zinc-600 dark:text-zinc-400">Signing you in...</p>
      </div>
    </div>
  )
}
