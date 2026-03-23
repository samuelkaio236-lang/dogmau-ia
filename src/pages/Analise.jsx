import { useState, useRef } from 'react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import LoadingState from '../components/LoadingState'
import {
  SYSTEM_PROMPT_ANALISE,
  buildAnaliseMessage,
  buildAnaliseTextMessage,
} from '../utils/promptAnalise'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import './Analise.css'

const LOADING_MESSAGES = [
  'Lendo os sinais dela...',
  'Analisando o comportamento...',
  'Calculando a temperatura...',
  'Montando o diagnóstico...',
]

const TEMP_CONFIG = {
  'FRIA':         { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  label: '🧊 FRIA' },
  'MORNA':        { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  label: '🌡️ MORNA' },
  'QUENTE':       { color: '#f97316', bg: 'rgba(249,115,22,0.08)',  label: '🔥 QUENTE' },
  'MUITO QUENTE': { color: '#e8001a', bg: 'rgba(232,0,26,0.08)',    label: '🌋 MUITO QUENTE' },
}

const ESTAGIOS = [
  'DESCONHECIDOS', 'INTERESSE', 'RAPPORT', 'ATRAÇÃO', 'ENCONTRO', 'RELACIONAMENTO',
]

const TOM_CONFIG = {
  divertido:  { badge: '😛 DIVERTIDO',   color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.25)' },
  provocante: { badge: '😏 PROVOCANTE',  color: '#fbbf24', bg: 'rgba(251,191,36,0.06)',  border: 'rgba(251,191,36,0.25)' },
  cacherrão:  { badge: '🔥 CACHORRÃO',   color: '#e8001a', bg: 'rgba(232,0,26,0.06)',    border: 'rgba(232,0,26,0.3)' },
}

function ProgressBar({ value, color }) {
  return (
    <div className="an-progress-track">
      <div className="an-progress-fill" style={{ width: `${(value / 10) * 100}%`, background: color }} />
    </div>
  )
}

function AnCard({ children, accent }) {
  return (
    <div className="an-card" style={accent ? { borderTopColor: accent } : {}}>
      {children}
    </div>
  )
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  async function handleCopy() {
    try { await navigator.clipboard.writeText(text) } catch { /* ignore */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button className={`copy-btn an-copy-btn${copied ? ' copied' : ''}`} onClick={handleCopy} type="button">
      {copied ? '✓' : '📋'}
    </button>
  )
}

export default function Analise() {
  const [tab, setTab]               = useState('print')
  const [preview, setPreview]       = useState(null)
  const [imageData, setImageData]   = useState(null)
  const [textoConversa, setTextoConversa] = useState('')
  const [conversa, setConversa]     = useState('')
  const [contexto, setContexto]     = useState('')
  const fileInputRef                = useRef(null)
  const [dragOver, setDragOver]     = useState(false)

  const [loading, setLoading]         = useState(false)
  const [loadingText, setLoadingText] = useState(LOADING_MESSAGES[0])
  const [error, setError]             = useState('')
  const [resultado, setResultado]     = useState(null)
  const loadingIntervalRef            = useRef(null)
  const resultsRef                    = useRef(null)
  const { user }                      = useAuth()

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64Full = e.target.result
      const [header, data] = base64Full.split(',')
      const mediaType = header.match(/:(.*?);/)[1]
      setPreview(base64Full)
      setImageData({ base64: data, mediaType })
    }
    reader.readAsDataURL(file)
  }

  function handleRemoveImage() {
    setPreview(null)
    setImageData(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function startLoadingCycle() {
    let i = 0
    setLoadingText(LOADING_MESSAGES[0])
    loadingIntervalRef.current = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length
      setLoadingText(LOADING_MESSAGES[i])
    }, 2200)
  }

  function stopLoadingCycle() { clearInterval(loadingIntervalRef.current) }

  async function handleAnalisar() {
    const temImagem = tab === 'print' && imageData
    const temTexto  = tab === 'texto' && textoConversa.trim()
    if (!temImagem && !temTexto) {
      setError('Envie um print ou cole o texto da conversa primeiro.')
      return
    }

    setError('')
    setResultado(null)
    setLoading(true)
    startLoadingCycle()

    try {
      let messageContent
      if (temImagem) {
        messageContent = [
          { type: 'image', source: { type: 'base64', media_type: imageData.mediaType, data: imageData.base64 } },
          { type: 'text', text: buildAnaliseMessage(conversa, contexto) },
        ]
      } else {
        messageContent = [
          { type: 'text', text: buildAnaliseTextMessage(textoConversa, conversa, contexto) },
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
          max_tokens: 3000,
          system: SYSTEM_PROMPT_ANALISE,
          messages: [{ role: 'user', content: messageContent }],
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error?.message || `Erro ${res.status}`)
      }

      const data    = await res.json()
      const raw     = data.content?.[0]?.text || ''
      const jsonStr = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
      const parsed  = JSON.parse(jsonStr)
      setResultado(parsed)

      if (user) {
        supabase.from('historico').insert({
          user_id: user.id, tipo: 'analise',
          contexto: contexto || null, tem_imagem: !!imageData, analise: parsed,
        }).then()
      }

      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err) {
      setError(err.message || 'Erro ao analisar. Tente novamente.')
    } finally {
      setLoading(false)
      stopLoadingCycle()
    }
  }

  const tempCfg   = resultado ? (TEMP_CONFIG[resultado.temperatura] || TEMP_CONFIG['MORNA']) : null
  const estagioIdx = resultado ? ESTAGIOS.indexOf(resultado.estagio) : -1

  return (
    <>
      <div className="orb orb--1" />
      <div className="orb orb--2" />
      <Header />

      <main className="main an-main">
        <div className="an-hero">
          <div className="hero__tag">🔍 Diagnóstico de Conversa</div>
          <h1 className="an-hero__title">ANÁLISE <span>PROFUNDA</span></h1>
          <p className="hero__desc">Descubra onde você está, o que ela está sentindo e o que fazer a seguir.</p>
        </div>

        {/* Passo 1: Conversa */}
        <div className="card">
          <div className="card__title"><span className="step-num">1</span>Manda a conversa</div>
          <div className="input-tabs">
            <button className={`input-tab${tab === 'print' ? ' input-tab--active' : ''}`} onClick={() => setTab('print')} type="button">📲 Print</button>
            <button className={`input-tab${tab === 'texto' ? ' input-tab--active' : ''}`} onClick={() => setTab('texto')} type="button">💬 Colar texto</button>
          </div>
          {tab === 'print' && (
            <>
              {!preview && (
                <div
                  className={`upload-area${dragOver ? ' drag-over' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} style={{ display: 'none' }} />
                  <span className="upload-area__icon">📲</span>
                  <div className="upload-area__title">Arraste o print aqui ou clique para escolher</div>
                  <div className="upload-area__desc">Print do WhatsApp, Instagram, Tinder...<br />JPG, PNG, WEBP</div>
                </div>
              )}
              {preview && (
                <div className="preview-container visible">
                  <img src={preview} alt="Preview da conversa" />
                  <button className="preview-remove" onClick={handleRemoveImage} aria-label="Remover imagem">✕</button>
                </div>
              )}
            </>
          )}
          {tab === 'texto' && (
            <textarea
              className="context-input text-convo-input"
              placeholder={`Cole aqui o texto da conversa:\n\nEla: Oi, tudo bem?\nVocê: Tudo ótimo e você?\nEla: Bem também!`}
              value={textoConversa}
              onChange={(e) => setTextoConversa(e.target.value)}
            />
          )}
        </div>

        {/* Passo 2 */}
        <div className="card">
          <div className="card__title"><span className="step-num">2</span>O que você enviou (opcional)</div>
          <textarea className="context-input" placeholder="Ex: 'Mandei uma foto nossa na praia...' ou 'Perguntei se ela topava sair no sábado'" value={conversa} onChange={(e) => setConversa(e.target.value)} />
        </div>

        {/* Passo 3 */}
        <div className="card">
          <div className="card__title"><span className="step-num">3</span>Contexto extra (opcional)</div>
          <textarea className="context-input" placeholder="Ex: 'A gente se conheceu há 2 semanas, foi em 1 encontro, ela ficou bem à vontade...'" value={contexto} onChange={(e) => setContexto(e.target.value)} />
        </div>

        <button className="gen-btn" onClick={handleAnalisar} disabled={loading} type="button">
          🔍 ANALISAR CONVERSA
        </button>

        {error && <div className="error-card visible">{error}</div>}
        <LoadingState visible={loading} text={loadingText} />

        {/* ── RESULTADOS ── */}
        {resultado && (
          <div className="an-results" ref={resultsRef}>

            {/* 1. Termômetro + Nota */}
            <AnCard accent={tempCfg.color}>
              <div className="an-card__label">DIAGNÓSTICO GERAL</div>
              <div className="an-thermo">
                <div className="an-nota" style={{ color: tempCfg.color }}>{resultado.nota}</div>
                <div className="an-thermo__right">
                  <div className="an-temp-badge" style={{ color: tempCfg.color, background: tempCfg.bg }}>
                    {tempCfg.label}
                  </div>
                  <div className="an-estagio-track">
                    {ESTAGIOS.map((s, i) => (
                      <div key={s} className={`an-estagio-step${i === estagioIdx ? ' an-estagio-step--active' : ''}${i < estagioIdx ? ' an-estagio-step--done' : ''}`} title={s}>
                        <div className="an-estagio-dot" />
                        <div className="an-estagio-name">{s}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnCard>

            {/* 2. Momento Atual */}
            <AnCard>
              <div className="an-card__label">📍 MOMENTO ATUAL</div>
              <p className="an-text">{resultado.momentoAtual}</p>
            </AnCard>

            {/* 3. Sinais Dela — objetos { sinal, interpretacao } */}
            <AnCard>
              <div className="an-card__label">👁️ SINAIS DELA</div>
              <ul className="an-list an-list--sinais">
                {resultado.sinais_dela?.map((s, i) => (
                  <li key={i} className="an-sinal-item">
                    <span className="an-list__icon">👁️</span>
                    <div className="an-sinal-body">
                      <div className="an-sinal-texto">{s.sinal ?? s}</div>
                      {s.interpretacao && (
                        <div className="an-sinal-interp">→ {s.interpretacao}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </AnCard>

            {/* 4. Acertos & Erros */}
            <AnCard>
              <div className="an-card__label">✅ ACERTOS & ❌ ERROS</div>
              <div className="an-split">
                <div className="an-split__col an-split__col--green">
                  <div className="an-split__title">✅ Acertou</div>
                  <ul className="an-split__list">{resultado.acertos?.map((a, i) => <li key={i}>{a}</li>)}</ul>
                </div>
                <div className="an-split__col an-split__col--red">
                  <div className="an-split__title">❌ Errou</div>
                  <ul className="an-split__list">{resultado.erros?.map((e, i) => <li key={i}>{e}</li>)}</ul>
                </div>
              </div>
            </AnCard>

            {/* 5. Alerta Crítico */}
            {resultado.alerta && (
              <AnCard accent="#f59e0b">
                <div className="an-alerta">
                  <span className="an-alerta__icon">⚠️</span>
                  <div>
                    <div className="an-card__label" style={{ color: '#f59e0b' }}>ALERTA CRÍTICO</div>
                    <p className="an-alerta__text">{resultado.alerta}</p>
                  </div>
                </div>
              </AnCard>
            )}

            {/* 6. O Que Evitar */}
            {resultado.o_que_evitar?.length > 0 && (
              <AnCard accent="#f97316">
                <div className="an-card__label" style={{ color: '#f97316' }}>⛔ O QUE EVITAR</div>
                <ul className="an-evitar-list">
                  {resultado.o_que_evitar.map((item, i) => (
                    <li key={i} className="an-evitar-item">
                      <span className="an-evitar-icon">⛔</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </AnCard>
            )}

            {/* 7. Dicas do Dog Mau */}
            {resultado.dicas_dog_mau?.length > 0 && (
              <AnCard accent="#e8001a">
                <div className="an-card__label">🐺 DICAS DO DOG MAU</div>
                <div className="an-dicas">
                  {resultado.dicas_dog_mau.map((d, i) => (
                    <div key={i} className="an-dica-item">
                      <div className="an-dica-texto">{d.dica}</div>
                      {d.porque && <div className="an-dica-porque">Por quê funciona: {d.porque}</div>}
                      {i < resultado.dicas_dog_mau.length - 1 && <div className="an-dica-sep" />}
                    </div>
                  ))}
                </div>
              </AnCard>
            )}

            {/* 8. Mensagens Sugeridas */}
            {resultado.mensagens_sugeridas && (
              <div className="an-card an-card--msgs">
                <div className="an-card__label">💬 MANDE AGORA</div>
                <p className="an-msgs-sub">3 opções prontas — escolha seu tom</p>
                <div className="an-msgs-list">
                  {Object.entries(resultado.mensagens_sugeridas).map(([tom, val]) => {
                    const cfg = TOM_CONFIG[tom] || TOM_CONFIG['divertido']
                    return (
                      <div key={tom} className="an-msg-card" style={{ borderColor: cfg.border }}>
                        <div className="an-msg-badge" style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>
                          {cfg.badge}
                        </div>
                        <div className="an-msg-body">
                          <div className="an-msg-texto">"{val.mensagem}"</div>
                          {val.comentario && (
                            <div className="an-msg-comentario">💡 {val.comentario}</div>
                          )}
                        </div>
                        <CopyBtn text={val.mensagem} />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 9. Próximos Passos */}
            <AnCard>
              <div className="an-card__label">👣 PRÓXIMOS PASSOS</div>
              <ol className="an-steps">
                {resultado.proximosPassos?.map((p, i) => (
                  <li key={i} className="an-steps__item">
                    <span className="an-steps__num">{i + 1}</span>
                    {p}
                  </li>
                ))}
              </ol>
            </AnCard>

            {/* 10. Frase do Momento */}
            <AnCard accent="#e8001a">
              <div className="an-card__label">FRASE DO MOMENTO</div>
              <blockquote className="an-quote">"{resultado.frase}"</blockquote>
            </AnCard>

            {/* 11. Previsão */}
            <AnCard>
              <div className="an-card__label">🔮 PREVISÃO</div>
              <p className="an-text">{resultado.previsao}</p>
            </AnCard>

            {/* 12. Notas por Objetivo */}
            <AnCard>
              <div className="an-card__label">📊 NOTAS POR OBJETIVO</div>
              <div className="an-obj-bars">
                {[
                  { key: 'puxar',     label: '💬 Puxar Assunto',   color: '#60a5fa' },
                  { key: 'flertar',   label: '💘 Flertar',         color: '#f472b6' },
                  { key: 'encontro',  label: '📍 Marcar Encontro', color: '#34d399' },
                  { key: 'reengajar', label: '🔥 Reengajar',       color: '#f97316' },
                ].map(({ key, label, color }) => (
                  <div key={key} className="an-obj-bar">
                    <div className="an-obj-bar__header">
                      <span className="an-obj-bar__label">{label}</span>
                      <span className="an-obj-bar__value" style={{ color }}>{resultado.notasObjetivo?.[key] ?? '—'}</span>
                    </div>
                    <ProgressBar value={resultado.notasObjetivo?.[key] ?? 0} color={color} />
                  </div>
                ))}
              </div>
            </AnCard>

          </div>
        )}
      </main>

      <BottomNav />
    </>
  )
}
