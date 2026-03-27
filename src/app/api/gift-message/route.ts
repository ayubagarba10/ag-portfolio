import { NextResponse } from 'next/server'
import { generateGiftMessage } from '@/lib/anthropic'

export async function POST() {
  try {
    const message = await generateGiftMessage()
    return NextResponse.json({ message })
  } catch {
    return NextResponse.json(
      { message: 'You showed up today — and that already makes you remarkable.' },
      { status: 200 }
    )
  }
}
