import { SYSTEM_PROMPT, buildUserMessage } from './prompt'

const BACKEND_URL = 'http://localhost:3001/api/gerar'

export async function generateResponses({ input, context, tone, girlName }) {
  const userText = buildUserMessage(context, tone, girlName)

  let messageContent

  if (input.type === 'image') {
    messageContent = [
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
    messageContent = [
      {
        type: 'text',
        text: `CONVERSA COLADA PELO USUÁRIO:\n"""\n${input.text}\n"""\n\n${userText}`,
      },
    ]
  }

  const res = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: messageContent }],
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
