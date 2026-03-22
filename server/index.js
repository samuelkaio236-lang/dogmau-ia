import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'

const app = express()
const PORT = process.env.PORT || 3001

// ── Middleware ──────────────────────────────────────────────
app.use(express.json({ limit: '20mb' })) // imagens base64 podem ser grandes
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['POST'],
  })
)

// ── Cliente Anthropic ───────────────────────────────────────
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// ── Rota principal ──────────────────────────────────────────
app.post('/api/gerar', async (req, res) => {
  const { messages, model, system, max_tokens } = req.body

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Campo "messages" é obrigatório e deve ser um array.' })
  }

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'sua-chave-aqui') {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada no servidor.' })
  }

  try {
    const response = await anthropic.messages.create({
      model: model || 'claude-opus-4-6',
      max_tokens: max_tokens || 1024,
      system: system,
      messages,
    })

    res.json(response)
  } catch (err) {
    console.error('[/api/gerar]', err.message)

    const status = err.status || 500
    const message = err.message || 'Erro interno no servidor.'
    res.status(status).json({ error: message })
  }
})

// ── Health check ────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ ok: true, model: 'claude-opus-4-6' })
})

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🐺 DOG MAU IA — servidor rodando em http://localhost:${PORT}`)
  console.log(`   POST http://localhost:${PORT}/api/gerar\n`)
})
