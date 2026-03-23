import { useState, useEffect, useCallback } from 'react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import './Historico.css'

const OBJETIVO_LABELS = {
  puxar:     'PUXAR ASSUNTO',
  flertar:   'FLERTAR',
  encontro:  'MARCAR ENCONTRO',
  reengajar: 'REENGAJAR',
}

const TOM_LABELS = {
  divertido:  'DIVERTIDO',
  provocante: 'PROVOCANTE',
  cachorrão:  'CACHORRÃO',
}

const TEMP_EMOJI = {
  'FRIA':        '🧊',
  'MORNA':       '🌡️',
  'QUENTE':      '🔥',
  'MUITO QUENTE':'🌋',
}

function formatDate(iso) {
  const date = new Date(iso)
  const now   = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yest  = new Date(today); yest.setDate(yest.getDate() - 1)
  const d     = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const time  = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  if (d.getTime() === today.getTime()) return `hoje às ${time}`
  if (d.getTime() === yest.getTime())  return `ontem às ${time}`
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ` às ${time}`
}

// ── Mini cópia ─────────────────────────────────────────────
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  async function handleCopy() {
    try { await navigator.clipboard.writeText(text) } catch { /* ignore */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button className={`copy-btn hist-copy${copied ? ' copied' : ''}`} onClick={handleCopy} type="button">
      {copied ? '✓ Copiado!' : '📋 Copiar'}
    </button>
  )
}

// ── Card de RESPOSTA ───────────────────────────────────────
function RespostaCard({ item, expanded, onToggle, onDelete }) {
  return (
    <div className={`hist-card hist-card--resposta${expanded ? ' hist-card--expanded' : ''}`}
         style={{ animationDelay: `${item._delay}ms` }}>
      <div className="hist-card__top">
        <div className="hist-card__info">
          <span className="hist-card__icon">⚡</span>
          <div className="hist-card__badges">
            <span className="hist-badge hist-badge--objetivo">
              {OBJETIVO_LABELS[item.objetivo] || item.objetivo?.toUpperCase() || '—'}
            </span>
            <span className="hist-badge hist-badge--tom">
              {TOM_LABELS[item.tom] || item.tom?.toUpperCase() || '—'}
            </span>
            {item.tem_imagem && <span className="hist-badge">🖼️</span>}
          </div>
        </div>
        <div className="hist-card__actions">
          <span className="hist-card__date">{formatDate(item.created_at)}</span>
          <button className="hist-icon-btn" onClick={onToggle} type="button" aria-label="Expandir">
            {expanded ? '▲' : '▼'}
          </button>
          <button className="hist-icon-btn hist-icon-btn--del" onClick={onDelete} type="button" aria-label="Deletar">
            🗑️
          </button>
        </div>
      </div>

      {expanded && Array.isArray(item.respostas) && (
        <div className="hist-card__body">
          {item.respostas.map((r, i) => (
            <div key={i} className="hist-resp">
              <div className="hist-resp__num">0{i + 1}</div>
              <div className="hist-resp__text">{r}</div>
              <CopyBtn text={r} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Card de ANÁLISE ────────────────────────────────────────
function AnaliseCard({ item, expanded, onToggle, onDelete }) {
  const analise = item.analise || {}
  const tempEmoji = TEMP_EMOJI[analise.temperatura] || '🌡️'

  return (
    <div className={`hist-card hist-card--analise${expanded ? ' hist-card--expanded' : ''}`}
         style={{ animationDelay: `${item._delay}ms` }}>
      <div className="hist-card__top">
        <div className="hist-card__info">
          <span className="hist-card__icon">🔍</span>
          <div className="hist-card__badges">
            <span className="hist-badge hist-badge--analise">ANÁLISE</span>
            {analise.nota != null && (
              <span className="hist-badge hist-badge--nota">{analise.nota}/10</span>
            )}
            {analise.temperatura && (
              <span className="hist-badge">
                {tempEmoji} {analise.temperatura}
              </span>
            )}
            {item.tem_imagem && <span className="hist-badge">🖼️</span>}
          </div>
        </div>
        <div className="hist-card__actions">
          <span className="hist-card__date">{formatDate(item.created_at)}</span>
          <button className="hist-icon-btn" onClick={onToggle} type="button" aria-label="Expandir">
            {expanded ? '▲' : '▼'}
          </button>
          <button className="hist-icon-btn hist-icon-btn--del" onClick={onDelete} type="button" aria-label="Deletar">
            🗑️
          </button>
        </div>
      </div>

      {expanded && (
        <div className="hist-card__body">
          {analise.momentoAtual && (
            <div className="hist-analise-section">
              <div className="hist-analise-label">MOMENTO ATUAL</div>
              <p className="hist-analise-text">{analise.momentoAtual}</p>
            </div>
          )}
          {Array.isArray(analise.proximosPassos) && analise.proximosPassos.length > 0 && (
            <div className="hist-analise-section">
              <div className="hist-analise-label">PRÓXIMOS PASSOS</div>
              <ol className="hist-steps">
                {analise.proximosPassos.map((p, i) => (
                  <li key={i}><span>{i + 1}</span>{p}</li>
                ))}
              </ol>
            </div>
          )}
          {analise.frase && (
            <div className="hist-analise-section">
              <div className="hist-analise-label">FRASE DO MOMENTO</div>
              <blockquote className="hist-quote">"{analise.frase}"</blockquote>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Página ─────────────────────────────────────────────────
export default function Historico() {
  const { user }            = useAuth()
  const [registros, setRegistros] = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('tudo')
  const [expandedId, setExpandedId] = useState(null)

  const fetchHistorico = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('historico')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    setRegistros((data || []).map((r, i) => ({ ...r, _delay: i * 40 })))
    setLoading(false)
  }, [user])

  useEffect(() => { fetchHistorico() }, [fetchHistorico])

  async function handleDelete(id) {
    if (!window.confirm('Remover esse registro do histórico?')) return
    setRegistros(prev => prev.filter(r => r.id !== id))
    await supabase.from('historico').delete().eq('id', id)
  }

  function toggleExpand(id) {
    setExpandedId(prev => prev === id ? null : id)
  }

  const filtered = registros.filter(r => {
    if (filter === 'tudo')     return true
    if (filter === 'resposta') return r.tipo === 'resposta'
    if (filter === 'analise')  return r.tipo === 'analise'
    return true
  })

  return (
    <>
      <div className="orb orb--1" />
      <div className="orb orb--2" />

      <Header />

      <main className="main hist-main">

        {/* Título */}
        <div className="an-hero">
          <div className="hero__tag">📋 Seu Histórico</div>
          <h1 className="an-hero__title">MINHAS <span>GERAÇÕES</span></h1>
          <p className="hero__desc">Todas as suas respostas e análises salvas.</p>
        </div>

        {/* Filtros */}
        <div className="hist-filters">
          {[
            { key: 'tudo',     label: 'TUDO' },
            { key: 'resposta', label: '⚡ RESPOSTAS' },
            { key: 'analise',  label: '🔍 ANÁLISES' },
          ].map(f => (
            <button
              key={f.key}
              className={`hist-filter-btn${filter === f.key ? ' hist-filter-btn--active' : ''}`}
              onClick={() => setFilter(f.key)}
              type="button"
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Estados */}
        {loading && (
          <div className="hist-empty">
            <div className="hist-empty__icon">⏳</div>
            <div className="hist-empty__title">Carregando...</div>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="hist-empty">
            <div className="hist-empty__icon">📭</div>
            <div className="hist-empty__title">Nenhum histórico ainda</div>
            <div className="hist-empty__sub">
              Suas gerações e análises vão aparecer aqui
            </div>
          </div>
        )}

        {/* Lista */}
        {!loading && filtered.length > 0 && (
          <div className="hist-list">
            {filtered.map(item =>
              item.tipo === 'resposta' ? (
                <RespostaCard
                  key={item.id}
                  item={item}
                  expanded={expandedId === item.id}
                  onToggle={() => toggleExpand(item.id)}
                  onDelete={() => handleDelete(item.id)}
                />
              ) : (
                <AnaliseCard
                  key={item.id}
                  item={item}
                  expanded={expandedId === item.id}
                  onToggle={() => toggleExpand(item.id)}
                  onDelete={() => handleDelete(item.id)}
                />
              )
            )}
          </div>
        )}

      </main>

      <BottomNav />
    </>
  )
}
