import { NextRequest, NextResponse } from 'next/server'
import { suggestImprovedContent } from '@/lib/anthropic'

export async function POST(request: NextRequest) {
  try {
    const { original, context } = await request.json()
    if (!original || typeof original !== 'string') {
      return NextResponse.json({ error: 'Missing original text' }, { status: 400 })
    }
    const suggestion = await suggestImprovedContent(original, context || 'portfolio website')
    return NextResponse.json({ suggestion })
  } catch {
    return NextResponse.json({ error: 'Failed to generate suggestion' }, { status: 500 })
  }
}
