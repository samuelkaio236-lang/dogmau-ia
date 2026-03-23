import { useState } from 'react'

const OBJETIVO_LABELS = {
  puxar:     'PUXAR ASSUNTO',
  flertar:   'FLERTAR',
  encontro:  'MARCAR ENCONTRO',
  reengajar: 'REENGAJAR',
}

const TONE_LABELS = {
  divertido:  'DIVERTIDO',
  provocante: 'PROVOCANTE',
  cachorrão:  'CACHORRÃO',
}

function ResponseCard({ index, text }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="response-card">
      <div className="response-card__header">
        <div className="response-card__num">0{index + 1}</div>
      </div>
      <div className="response-card__text">{text}</div>
      <button
        className={`copy-btn${copied ? ' copied' : ''}`}
        onClick={handleCopy}
        type="button"
      >
        {copied ? '✓ Copiado!' : '📋 Copiar'}
      </button>
    </div>
  )
}

export default function ResultsSection({ results, objetivo, tone }) {
  if (!results || results.length === 0) return null

  const objetivoLabel = OBJETIVO_LABELS[objetivo] || objetivo?.toUpperCase()
  const toneLabel     = TONE_LABELS[tone]     || tone?.toUpperCase()

  return (
    <section id="results" className="results visible">
      <div className="results__header">
        <div className="results__title">SUAS RESPOSTAS</div>
        <div className="results__tag">✓ Pronto para usar</div>
      </div>

      {objetivoLabel && toneLabel && (
        <div className="results__context-tag">
          {objetivoLabel} · {toneLabel}
        </div>
      )}

      {results.map((text, i) => (
        <ResponseCard key={i} index={i} text={text} />
      ))}
    </section>
  )
}
