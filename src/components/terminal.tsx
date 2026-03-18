'use client'

import { useMemo, memo } from 'react'
import { useTypewriter } from '@/hooks/use-typewriter'

const README_CONTENT = `# My Awesome Project

> AI-generated in seconds

## Features

- ⚡ Lightning fast
- 🎯 TypeScript first  
- 📦 Zero dependencies

## Getting Started

npm install my-project

## License

MIT
`

const CodeLine = memo(function CodeLine({ content }: { content: string }) {
  if (content.startsWith('# ')) {
    return <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{content}</span>
  }
  if (content.startsWith('## ')) {
    return <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{content}</span>
  }
  if (content.startsWith('```')) {
    return <span className="text-emerald-600 dark:text-emerald-400">{content}</span>
  }
  if (content.startsWith('> ')) {
    return <span className="text-zinc-500 dark:text-zinc-500 italic">{content}</span>
  }
  if (content.startsWith('- ')) {
    return (
      <>
        <span className="text-zinc-400 dark:text-zinc-600">- </span>
        <span className="text-zinc-700 dark:text-zinc-300">{content.slice(2)}</span>
      </>
    )
  }
  if (content.startsWith('---')) {
    return <span className="text-zinc-300 dark:text-zinc-800">{content}</span>
  }
  if (content.includes('`') && !content.startsWith('```')) {
    const parts = content.split(/(`[^`]+`)/g)
    return (
      <>
        {parts.map((part, i) =>
          part.startsWith('`') && part.endsWith('`') ? (
            <span
              key={i}
              className="px-1.5 py-0.5 rounded text-xs mx-0.5 bg-zinc-200 dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400"
            >
              {part.slice(1, -1)}
            </span>
          ) : (
            <span key={i} className="text-zinc-700 dark:text-zinc-300">{part}</span>
          )
        )}
      </>
    )
  }
  return <span className="text-zinc-700 dark:text-zinc-300">{content}</span>
})

const LineNumber = memo(function LineNumber({ index }: { index: number }) {
  return (
    <span
      className="select-none w-8 text-right mr-4 text-xs flex-shrink-0 text-zinc-400 dark:text-zinc-700"
    >
      {index + 1}
    </span>
  )
})

const Cursor = memo(function Cursor() {
  return (
    <span
      className="animate-pulse ml-0.5 text-emerald-600 dark:text-emerald-400"
    >
      ▋
    </span>
  )
})

export function Terminal() {
  const { displayText } = useTypewriter({
    text: README_CONTENT,
    speed: 25,
  })

  const lines = useMemo(() => displayText.split('\n'), [displayText])
  const lastLineIndex = lines.length - 1

  return (
    <div
      className="relative w-full max-w-xl mx-auto"
      style={{ animation: 'float 6s ease-in-out infinite' }}
    >
      {/* Glow effect behind - dark only */}
      <div
        className="absolute -inset-8 rounded-3xl hidden dark:block"
        style={{
          background: 'linear-gradient(180deg, rgba(16,185,129,0.25) 0%, transparent 60%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Terminal window */}
      <div
        className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10 shadow-xl dark:shadow-black/50 bg-zinc-100 dark:bg-zinc-900"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05) dark:box-shadow-none',
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center gap-2 px-4 py-3 bg-zinc-200 dark:bg-zinc-800 border-b border-zinc-300 dark:border-zinc-700"
        >
          {/* Traffic lights with glow */}
          <div className="flex gap-2">
            <div
              className="w-3 h-3 rounded-full bg-red-500"
            />
            <div
              className="w-3 h-3 rounded-full bg-yellow-500"
            />
            <div
              className="w-3 h-3 rounded-full bg-green-500"
            />
          </div>

          {/* Title */}
          <div className="flex-1 text-center">
            <span
              className="text-xs font-mono text-zinc-500 dark:text-zinc-400"
            >
              README.md
            </span>
          </div>

          {/* Spacer */}
          <div className="w-10" />
        </div>

        {/* Content */}
        <div
          className="p-5 font-mono text-sm overflow-hidden bg-white dark:bg-zinc-950"
          style={{
            minHeight: '360px',
            maxHeight: '360px',
          }}
        >
          <pre className="text-sm leading-relaxed">
            {lines.map((line, index) => (
              <div key={index} className="flex">
                <LineNumber index={index} />
                <code className="whitespace-pre-wrap break-all flex-1">
                  <CodeLine content={line} />
                  {index === lastLineIndex && <Cursor />}
                </code>
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  )
}
