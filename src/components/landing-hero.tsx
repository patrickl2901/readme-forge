'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, ArrowRight, Github } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { Terminal } from '@/components/terminal'

export function LandingHero() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard')
    }
  }, [user, loading, router])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_complete' && e.newValue === 'true') {
        try {
          localStorage.removeItem('auth_complete')
        } catch {}
        router.replace('/dashboard')
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-zinc-950">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <section className="min-h-screen flex items-center px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-8 backdrop-blur-sm opacity-0 animate-fade-up"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI-powered documentation</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-zinc-900 dark:text-white mb-6 leading-[0.95] tracking-tight opacity-0 animate-fade-up delay-100">
              Beautiful READMEs,
              <br />
              <span 
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #059669 100%)',
                  WebkitBackgroundClip: 'text',
                }}
              >
                generated in seconds
              </span>
            </h1>
            
            <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed opacity-0 animate-fade-up delay-200">
              Turn your GitHub repository into a professional, eye-catching README. 
              Just enter your repo URL and let AI do the heavy lifting.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 opacity-0 animate-fade-up delay-300">
              <Link
                href="/login"
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white overflow-hidden shadow-lg shadow-emerald-500/25 dark:shadow-emerald-500/40"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                href="/generate"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300 font-medium backdrop-blur-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-300 shadow-sm"
              >
                <Github className="w-5 h-5" />
                Try Demo
              </Link>
            </div>
          </div>

          <div className="relative opacity-0 animate-fade-up delay-200">
            <div 
              className="absolute -inset-4 rounded-3xl hidden dark:block"
              style={{
                background: 'linear-gradient(180deg, rgba(16,185,129,0.2) 0%, transparent 100%)',
                filter: 'blur(20px)',
              }}
            />
            <div 
              className="absolute -inset-4 rounded-3xl dark:hidden"
              style={{
                background: 'linear-gradient(180deg, rgba(16,185,129,0.1) 0%, transparent 100%)',
                filter: 'blur(20px)',
              }}
            />
            <Terminal />
          </div>
        </div>
      </div>
    </section>
  )
}
