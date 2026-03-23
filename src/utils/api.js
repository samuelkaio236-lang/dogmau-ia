import { SYSTEM_PROMPT, buildUserMessage } from './prompt'

export async function generateResponses({ input, context, tone, objetivo, girlName }) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('API key não encontrada. Adicione VITE_ANTHROPIC_API_KEY no .env')

  const contextWithName = girlName?.trim()
    ? `Nome dela: ${girlName.trim()}. ${context || ''}`.trim()
    : context

  const userText = buildUserMessage(contextWithName, tone, objetivo)

  let userContent

  if (input.type === 'image') {
    userContent = [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: input.mediaType,
          data: input.base64,
        },
      },
      {
        type: 'text',
        text: userText,
      },
    ]
  } else {
    userContent = [
      {
        type: 'text',
        text: `CONVERSA COLADA PELO USUÁRIO:\n"""\n${input.text}\n"""\n\n${userText}`,
      },
    ]
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error || `Erro ${res.status}`)
  }

  const data = await res.json()
  const raw = data.content?.[0]?.text || ''
  return parseResponses(raw)
}

function parseResponses(raw) {
  const parts = raw
    .split(/RESPOSTA\s+\d+/i)
    .map((s) => s.trim())
    .filter(Boolean)

  if (parts.length >= 3) return parts.slice(0, 3)

  const lines = raw.split('\n\n').map((s) => s.trim()).filter(Boolean)
  if (lines.length >= 3) return lines.slice(0, 3)

  return raw ? [raw] : ['Não foi possível gerar respostas. Tente novamente.']
}
