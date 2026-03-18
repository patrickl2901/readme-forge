'use client'

import { useState, useEffect, useRef } from 'react'

interface UseTypewriterOptions {
  text: string
  speed?: number
}

export function useTypewriter({ text, speed = 30 }: UseTypewriterOptions) {
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  
  const charIndexRef = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!text) return

    const timer = setTimeout(() => {
      charIndexRef.current = 0
      setDisplayText('')
      setIsTyping(true)

      const typeChar = () => {
        if (charIndexRef.current < text.length) {
          setDisplayText(text.slice(0, charIndexRef.current + 1))
          charIndexRef.current += 1
          timeoutRef.current = setTimeout(typeChar, speed + Math.random() * 15)
        } else {
          setIsTyping(false)
        }
      }

      typeChar()
    }, 0)

    return () => {
      clearTimeout(timer)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [text, speed])

  return { displayText, isTyping }
}
