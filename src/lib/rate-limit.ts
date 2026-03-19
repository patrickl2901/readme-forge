import { NextResponse } from 'next/server'

const rateLimitStore = new Map<string, { count: number; timestamp: number }>()

export function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now()
  const key = identifier
  const record = rateLimitStore.get(key)

  if (!record || now - record.timestamp > windowMs) {
    rateLimitStore.set(key, { count: 1, timestamp: now })
    return { success: true, remaining: limit - 1, reset: now + windowMs }
  }

  if (record.count >= limit) {
    return { 
      success: false, 
      remaining: 0, 
      reset: record.timestamp + windowMs 
    }
  }

  record.count++
  return { 
    success: true, 
    remaining: limit - record.count, 
    reset: record.timestamp + windowMs 
  }
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || 'anonymous'
}

export function rateLimitResponse(reset: number) {
  const seconds = Math.ceil((reset - Date.now()) / 1000)
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.', retryAfter: seconds },
    { 
      status: 429, 
      headers: { 
        'Retry-After': String(seconds),
        'X-RateLimit-Reset': String(reset),
      } 
    }
  )
}
