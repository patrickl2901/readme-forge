'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { RepoData } from '@/lib/github'

type Template = 'minimal' | 'modern' | 'notion' | 'showcase' | 'library'

interface UseReadmeStreamOptions {
  onSuccess?: (markdown: string) => void
  onError?: (error: string) => void
}

interface UseReadmeStreamReturn {
  markdown: string
  isLoading: boolean
  error: string | null
  generate: (repoData: RepoData, template: Template) => Promise<void>
  retry: () => void
  reset: () => void
}

export function useReadmeStream(options?: UseReadmeStreamOptions): UseReadmeStreamReturn {
  const [markdown, setMarkdown] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lastRepoData = useRef<RepoData | null>(null)
  const lastTemplate = useRef<Template>('modern')
  const abortControllerRef = useRef<AbortController | null>(null)
  const optionsRef = useRef(options)
  optionsRef.current = options

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const generate = useCallback(async (repoData: RepoData, template: Template) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setIsLoading(true)
    setError(null)
    setMarkdown('')

    lastRepoData.current = repoData
    lastTemplate.current = template

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoData, template }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Generation failed')
      }

      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done || abortControllerRef.current?.signal.aborted) break

        const chunk = decoder.decode(value, { stream: true })

        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const text = JSON.parse(line.slice(2))
              accumulated += text
              setMarkdown(accumulated)
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }

      if (!abortControllerRef.current?.signal.aborted) {
        optionsRef.current?.onSuccess?.(accumulated)
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      optionsRef.current?.onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const retry = useCallback(() => {
    if (lastRepoData.current && lastTemplate.current) {
      generate(lastRepoData.current, lastTemplate.current)
    }
  }, [generate])

  const reset = useCallback(() => {
    setMarkdown('')
    setError(null)
    setIsLoading(false)
    lastRepoData.current = null
  }, [])

  return {
    markdown,
    isLoading,
    error,
    generate,
    retry,
    reset,
  }
}
