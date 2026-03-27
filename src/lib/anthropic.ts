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
