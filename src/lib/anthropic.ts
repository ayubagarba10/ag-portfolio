import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function generateGiftMessage(): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 150,
    messages: [
      {
        role: 'user',
        content:
          'Write one short, warm, and genuinely encouraging message (2-3 sentences) for a visitor who just opened a surprise gift box on a personal portfolio website. Make it feel personal, uplifting, and unexpected. No generic phrases. No quotation marks. Just the message itself.',
      },
    ],
  })

  const content = message.content[0]
  if (content.type === 'text') return content.text
  return 'You showed up today, and that already makes you remarkable. Keep going.'
}

export async function suggestImprovedContent(
  original: string,
  context: string
): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: `You are a professional copywriter helping someone improve their portfolio website content. The context is: ${context}.

Here is the original text:
"${original}"

Rewrite it to be more compelling, clear, and professional while keeping the owner's authentic voice. Return only the improved text, nothing else.`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type === 'text') return content.text
  return original
}

export async function generatePreviewText(
  fullContent: string,
  context: string
): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 120,
    messages: [
      {
        role: 'user',
        content: `Write a compelling 1-2 sentence preview that makes a visitor want to click and read more. Be specific, confident, and engaging — like a great magazine hook. Context: ${context}.

Content to summarize:
"${fullContent}"

Return only the preview text. No quotation marks. No preamble.`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type === 'text') return content.text.trim()
  return fullContent.slice(0, 120)
}

export async function optimizeTitle(
  title: string,
  context: string
): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 60,
    messages: [
      {
        role: 'user',
        content: `Rewrite this title to be more attractive, memorable, and click-worthy (max 8 words). Context: ${context}.

Title: "${title}"

Return only the improved title. No quotation marks. No explanation.`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type === 'text') return content.text.trim()
  return title
}
