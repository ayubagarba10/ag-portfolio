import { NextRequest, NextResponse } from 'next/server'
import { suggestImprovedContent, generatePreviewText, optimizeTitle } from '@/lib/anthropic'

export async function POST(request: NextRequest) {
  try {
    const { original, context, suggestion_type } = await request.json()
    if (!original || typeof original !== 'string') {
      return NextResponse.json({ error: 'Missing original text' }, { status: 400 })
    }

    const ctx = context || 'portfolio website'
    let suggestion: string

    if (suggestion_type === 'preview_text') {
      suggestion = await generatePreviewText(original, ctx)
    } else if (suggestion_type === 'title') {
      suggestion = await optimizeTitle(original, ctx)
    } else {
      suggestion = await suggestImprovedContent(original, ctx)
    }

    return NextResponse.json({ suggestion })
  } catch {
    return NextResponse.json({ error: 'Failed to generate suggestion' }, { status: 500 })
  }
}
