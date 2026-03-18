'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useReadmeStream } from '@/hooks/useReadmeStream'
import { fetchRepoData } from '@/lib/github'
import { useAuth } from '@/components/auth-provider'
import { createBrowserClient } from '@/lib/supabase-browser'
import { 
  Github, 
  Sparkles, 
  Copy, 
  Download, 
  FileCode, 
  AlertCircle,
  Loader2,
  Check,
  ChevronDown,
  ChevronUp,
  Zap
} from 'lucide-react'
import type { RepoData } from '@/lib/github'

type Template = 'minimal' | 'modern' | 'notion' | 'showcase' | 'library'

const TEMPLATES: { id: Template; name: string; description: string }[] = [
  { id: 'minimal', name: 'Minimal', description: 'Clean & simple' },
  { id: 'modern', name: 'Modern', description: 'Professional' },
  { id: 'notion', name: 'Notion', description: 'Documentation' },
  { id: 'showcase', name: 'Showcase', description: 'Visual focus' },
  { id: 'library', name: 'Library', description: 'Package ready' },
]

function TemplateCard({ 
  template, 
  selected, 
  onClick 
}: { 
  template: typeof TEMPLATES[0]
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative p-3 rounded-lg border text-left transition-all duration-200 cursor-pointer
        ${selected 
          ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/20' 
          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
        }
      `}
    >
      <div className={`font-medium text-sm ${selected ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
        {template.name}
      </div>
      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
        {template.description}
      </div>
      {selected && (
        <div className="absolute top-2 right-2">
          <Check className="w-4 h-4 text-emerald-500" />
        </div>
      )}
    </button>
  )
}

function UrlInput({ 
  value, 
  onChange,
  error 
}: { 
  value: string
  onChange: (value: string) => void
  error?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Repository URL
      </label>
      <div className="relative">
        <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://github.com/owner/repo"
          className={`
            w-full pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-zinc-900 
            border text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400
            focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500
            transition-all duration-200
            ${error ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'}
          `}
        />
      </div>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}

function PatInput({
  value,
  onChange,
  isOpen,
  onToggle
}: {
  value: string
  onChange: (value: string) => void
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
      >
        <Zap className="w-4 h-4" />
        <span>Advanced Options</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      
      {isOpen && (
        <div className="pt-2">
          <label className="text-sm text-zinc-600 dark:text-zinc-400">
            GitHub Personal Access Token <span className="text-zinc-400">(optional, for higher rate limits)</span>
          </label>
          <input
            type="password"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxx"
            className="w-full mt-1 px-4 py-2.5 rounded-lg bg-white dark:bg-zinc-900 
              border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 
              placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 
              focus:border-emerald-500 transition-all duration-200"
          />
          <p className="text-xs text-zinc-500 mt-1.5">
            Get higher API rate limits (5,000/hr vs 60/hr). 
            <a 
              href="https://github.com/settings/tokens" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-emerald-600 hover:underline ml-1"
            >
              Generate token →
            </a>
          </p>
        </div>
      )}
    </div>
  )
}

function ActionBar({ markdown, saved }: { markdown: string; saved?: boolean }) {
  const [copied, setCopied] = useState(false)
  const [copiedGh, setCopiedGh] = useState(false)

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyForGithub = async () => {
    await navigator.clipboard.writeText(markdown)
    setCopiedGh(true)
    setTimeout(() => setCopiedGh(false), 2000)
  }

  const download = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'README.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!markdown) return null

  return (
    <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
      {saved && (
        <p className="text-sm text-emerald-400 flex items-center gap-2">
          <Check className="w-4 h-4" />
          Saved to your dashboard
        </p>
      )}
      <div className="flex items-center gap-2">
      <button
        onClick={copyMarkdown}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 
          text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 
          transition-colors text-sm font-medium cursor-pointer"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <button
        onClick={copyForGithub}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 
          text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 
          transition-colors text-sm font-medium cursor-pointer"
      >
        {copiedGh ? <Check className="w-4 h-4" /> : <FileCode className="w-4 h-4" />}
        {copiedGh ? 'Copied!' : 'Copy for GitHub'}
      </button>
      <button
        onClick={download}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 
          text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 
          transition-colors text-sm font-medium cursor-pointer"
      >
        <Download className="w-4 h-4" />
        Download
      </button>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
      <div className="space-y-2 mt-8">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6"></div>
      </div>
      <div className="space-y-2 mt-4">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-4/5"></div>
      </div>
    </div>
  )
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        Something went wrong
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">
        {error}
      </p>
      <button
        onClick={onRetry}
        className="px-6 py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 
          font-medium hover:opacity-90 transition-opacity cursor-pointer"
      >
        Try Again
      </button>
    </div>
  )
}

export default function GeneratorPage() {
  const [repoUrl, setRepoUrl] = useState('')
  const [pat, setPat] = useState('')
  const [patOpen, setPatOpen] = useState(false)
  const [template, setTemplate] = useState<Template>('modern')
  const [urlError, setUrlError] = useState('')
  const [repoData, setRepoData] = useState<RepoData | null>(null)
  const [isFetchingRepo, setIsFetchingRepo] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [saved, setSaved] = useState(false)
  
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createBrowserClient()

  // Pre-fill repo URL from query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const repoParam = params.get('repo')
    if (repoParam) {
      setRepoUrl(repoParam)
    }
  }, [])

  const { markdown, isLoading, error, generate, reset } = useReadmeStream({
    onSuccess: async (generatedMarkdown) => {
      setSaved(false)
      if (user) {
        await saveToDatabase(generatedMarkdown)
      }
    }
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const saveToDatabase = async (generatedMarkdown: string) => {
    if (!user || !repoData) return

    const { error } = await supabase.from('readmes').insert({
      user_id: user.id,
      repo_url: repoData.repoUrl,
      repo_name: repoData.name,
      generated_markdown: generatedMarkdown,
      template: template,
      metadata: {
        stars: repoData.stars,
        languages: repoData.languages,
        techStack: repoData.techStack,
      }
    } as never)

    if (!error) {
      setSaved(true)
    }
  }

  const handleGenerate = useCallback(async () => {
    setUrlError('')
    
    if (!repoUrl.trim()) {
      setUrlError('Please enter a GitHub repository URL')
      return
    }

    if (!repoUrl.includes('github.com')) {
      setUrlError('Please enter a valid GitHub URL')
      return
    }

    setIsFetchingRepo(true)
    reset()

    try {
      const data = await fetchRepoData(repoUrl, pat || undefined)
      setRepoData(data)
      setIsFetchingRepo(false)
      setIsGenerating(true)
      await generate(data, template)
    } catch (err) {
      setUrlError(err instanceof Error ? err.message : 'Failed to fetch repository')
    } finally {
      setIsFetchingRepo(false)
      setIsGenerating(false)
    }
  }, [repoUrl, pat, template, generate, reset])

  const handleRetry = useCallback(async () => {
    if (repoData) {
      setIsFetchingRepo(true)
      try {
        await generate(repoData, template)
      } finally {
        setIsFetchingRepo(false)
      }
    }
  }, [repoData, template, generate])

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 dark:bg-black">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Panel - Form */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
                Generate README
              </h2>
              
              <div className="space-y-6">
                <UrlInput 
                  value={repoUrl}
                  onChange={setRepoUrl}
                  error={urlError}
                />

                <PatInput
                  value={pat}
                  onChange={setPat}
                  isOpen={patOpen}
                  onToggle={() => setPatOpen(!patOpen)}
                />

                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Template
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {TEMPLATES.map((t) => (
                      <TemplateCard
                        key={t.id}
                        template={t}
                        selected={template === t.id}
                        onClick={() => setTemplate(t.id)}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isLoading || isFetchingRepo || isGenerating}
                  className="w-full py-3 px-4 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 
                    font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed 
                    transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isFetchingRepo ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Fetching repo...</span>
                    </>
                  ) : isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate README</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 min-w-0">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Preview
                </h3>
              </div>
              
              <div className="p-6 min-h-[500px]">
                {error ? (
                  <ErrorState error={error} onRetry={handleRetry} />
                ) : isLoading || isFetchingRepo ? (
                  <LoadingState />
                ) : markdown ? (
                  <div className="prose prose-zinc max-w-none 
                    prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-xl 
                    prose-h3:text-lg prose-a:text-emerald-600 dark:prose-a:text-emerald-400 
                    prose-code:bg-emerald-100 dark:prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5
                    prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                    prose-code:text-emerald-700 dark:prose-code:text-emerald-300
                    prose-pre:bg-zinc-100 dark:prose-pre:bg-zinc-950 prose-pre:border 
                    prose-pre:border-zinc-200 dark:prose-pre:border-zinc-800 prose-pre:rounded-xl
                    prose-pre:text-zinc-800 dark:prose-pre:text-zinc-200
                    prose-li:marker:text-zinc-400 dark:prose-li:marker:text-zinc-500
                    prose-th:bg-zinc-100 dark:prose-th:bg-zinc-800
                    prose-td:bg-white dark:prose-td:bg-zinc-900
                    prose-td:border-zinc-200 dark:prose-td:border-zinc-700
                    prose-th:border-zinc-200 dark:prose-th:border-zinc-700
                    prose-blockquote:border-l-emerald-500 dark:prose-blockquote:border-l-emerald-500
                    prose-blockquote:bg-emerald-50 dark:prose-blockquote:bg-zinc-800/50
                    prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
                    prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100
                    prose-p:text-zinc-700 dark:prose-p:text-zinc-300
                    prose-h1:text-zinc-900 dark:prose-h1:text-zinc-100
                    prose-h2:text-zinc-800 dark:prose-h2:text-zinc-200
                    prose-h3:text-zinc-700 dark:prose-h3:text-zinc-300
                    prose-li:text-zinc-700 dark:prose-li:text-zinc-300
                    prose-ul:text-zinc-700 dark:prose-ul:text-zinc-300
                    prose-ol:text-zinc-700 dark:prose-ol:text-zinc-300
                    prose-table:text-zinc-700 dark:prose-table:text-zinc-300
                    prose-thead:text-zinc-900 dark:prose-thead:text-zinc-100
                    prose-hr:border-zinc-300 dark:prose-hr:border-zinc-700">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {markdown}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                      <FileCode className="w-8 h-8 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                      Your README will appear here
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
                      Enter a GitHub repository URL and click generate to create a professional README
                    </p>
                  </div>
                )}
              </div>

              {markdown && (
                <div className="px-6 pb-6">
                  <ActionBar markdown={markdown} saved={saved} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
