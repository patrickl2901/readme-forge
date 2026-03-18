// app/api/test-github/route.ts
import { fetchRepoData } from '@/lib/github'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const repoData = await fetchRepoData(
      'https://github.com/facebook/react'
    )

    return NextResponse.json({ success: true, data: repoData })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
