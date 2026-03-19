'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { createBrowserClient } from '@/lib/supabase-browser'
import { Plus, ExternalLink, Trash2, RefreshCw, FileText, Loader2, Sparkles, AlertTriangle } from 'lucide-react'
import { Toaster, toast } from 'sonner'

interface ReadmeRecord {
  id: string
  repo_url: string
  repo_name: string
  template: string
  created_at: string
}

export default function DashboardPage() {
  const [readmes, setReadmes] = useState<ReadmeRecord[] | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    
    if (!user) return
    
    const fetchData = async () => {
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from('readmes')
        .select('id, repo_url, repo_name, template, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        setFetchError('Failed to load your READMEs. Please try again.')
        toast.error('Failed to load READMEs', {
          description: error.message,
        })
        setReadmes([])
      } else {
        setFetchError(null)
        setReadmes(data || [])
      }
    }
    
    fetchData()
  }, [user, authLoading, router])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this README?')) return
    
    setDeleting(id)
    const supabase = createBrowserClient()
    
    const { error } = await supabase
      .from('readmes')
      .delete()
      .eq('id', id)

    setDeleting(null)

    if (error) {
      toast.error('Failed to delete README', {
        description: error.message,
      })
    } else if (readmes) {
      toast.success('README deleted')
      setReadmes(readmes.filter(r => r.id !== id))
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (authLoading || readmes === null) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      <Toaster position="top-right" richColors closeButton />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">My READMEs</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            {readmes.length} {readmes.length === 1 ? 'README' : 'READMEs'} generated
          </p>
        </div>
        <Link
          href="/generate"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">New README</span>
          <span className="sm:hidden">New</span>
        </Link>
      </div>

      {fetchError && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              {fetchError}
            </p>
          </div>
        </div>
      )}

      {readmes.length === 0 && !fetchError ? (
        <div className="text-center py-20 px-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            No READMEs yet
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm mx-auto">
            Create your first README and it will appear here. It only takes a few seconds!
          </p>
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-5 h-5" />
            Generate Your First README
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {readmes.map((readme) => (
            <div
              key={readme.id}
              className="group p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {readme.repo_name}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 capitalize">
                      {readme.template}
                    </span>
                  </div>
                  <a
                    href={readme.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                  >
                    <span className="truncate max-w-[200px]">{readme.repo_url}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
                    Created {formatDate(readme.created_at)}
                  </p>
                </div>
                
                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/generate?repo=${encodeURIComponent(readme.repo_url)}`}
                    className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                    title="Regenerate"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(readme.id)}
                    disabled={deleting === readme.id}
                    className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
