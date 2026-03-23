/*
  SQL para rodar no Supabase (Dashboard → SQL Editor):

  alter table public.usuarios
    add column if not exists idade              int,
    add column if not exists cidade            text,
    add column if not exists objetivo_principal text,
    add column if not exists nivel_experiencia text;
*/

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import './Perfil.css'

const PLANO_TOTAL = { free: 5, basico: 30, pro: 999 }
const PLANO_LABEL = { free: 'FREE', basico: 'BÁSICO', pro: 'PRO' }

function iniciais(nome) {
  if (!nome) return '?'
  const parts = nome.trim().split(' ').filter(Boolean)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatarData(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function Perfil() {
  const navigate       = useNavigate()
  const { user, perfil, logout } = useAuth()

  // form editável
  const [nome,              setNome]              = useState('')
  const [idade,             setIdade]             = useState('')
  const [cidade,            setCidade]            = useState('')
  const [objetivoPrincipal, setObjetivoPrincipal] = useState('')
  const [nivelExperiencia,  setNivelExperiencia]  = useState('')
  const [saveMsg,           setSaveMsg]           = useState('')
  const [saveLoad,          setSaveLoad]          = useState(false)

  // estatísticas
  const [stats, setStats] = useState({ respostas: 0, analises: 0, topObjetivo: '—' })

  useEffect(() => {
    if (!perfil) return
    setNome(perfil.nome || '')
    setIdade(perfil.idade || '')
    setCidade(perfil.cidade || '')
    setObjetivoPrincipal(perfil.objetivo_principal || '')
    setNivelExperiencia(perfil.nivel_experiencia || '')
  }, [perfil])

  useEffect(() => {
    if (!user) return
    async function fetchStats() {
      const { data } = await supabase
        .from('historico')
        .select('tipo, objetivo')
        .eq('user_id', user.id)

      if (!data) return

      const respostas = data.filter(r => r.tipo === 'resposta').length
      const analises  = data.filter(r => r.tipo === 'analise').length

      // objetivo mais usado
      const freq = {}
      data.filter(r => r.tipo === 'resposta' && r.objetivo).forEach(r => {
        freq[r.objetivo] = (freq[r.objetivo] || 0) + 1
      })
      const topKey = Object.keys(freq).sort((a, b) => freq[b] - freq[a])[0]
      const OBJ_LABELS = { puxar: 'Puxar Assunto', flertar: 'Flertar', encontro: 'Marcar Encontro', reengajar: 'Reengajar' }
      const topObjetivo = topKey ? (OBJ_LABELS[topKey] || topKey) : '—'

      setStats({ respostas, analises, topObjetivo })
    }
    fetchStats()
  }, [user])

  async function handleSalvar(e) {
    e.preventDefault()
    setSaveMsg('')
    setSaveLoad(true)
    const { error } = await supabase
      .from('usuarios')
      .update({ nome, idade: idade || null, cidade: cidade || null, objetivo_principal: objetivoPrincipal || null, nivel_experiencia: nivelExperiencia || null })
      .eq('id', user.id)
    setSaveLoad(false)
    setSaveMsg(error ? '⚠️ Erro ao salvar.' : '✅ Perfil salvo!')
    setTimeout(() => setSaveMsg(''), 3000)
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const plano       = perfil?.plano || 'free'
  const creditos    = perfil?.creditos_restantes ?? 0
  const totalPlano  = PLANO_TOTAL[plano] || 5
  const usados      = totalPlano === 999 ? 0 : Math.max(0, totalPlano - creditos)
  const pctUsado    = totalPlano === 999 ? 0 : Math.min(100, (usados / totalPlano) * 100)

  return (
    <>
      <div className="orb orb--1" />
      <div className="orb orb--2" />

      <Header />

      <main className="main perfil-main">

        {/* ── SEÇÃO 1: Avatar ───────────────────────────── */}
        <div className="perfil-card">
          <div className="perfil-avatar-row">
            <div className="perfil-avatar">
              {iniciais(perfil?.nome || '')}
            </div>
            <div className="perfil-avatar-info">
              <div className="perfil-nome">{perfil?.nome || 'Usuário'}</div>
              <div className="perfil-email">{user?.email}</div>
              <span className={`perfil-plano-badge perfil-plano-badge--${plano}`}>
                {PLANO_LABEL[plano] || plano.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* ── SEÇÃO 2: Créditos ─────────────────────────── */}
        <div className="perfil-card">
          <div className="perfil-card__label">CRÉDITOS</div>
          {totalPlano === 999 ? (
            <div className="perfil-creditos-text">♾️ Ilimitado — plano PRO</div>
          ) : (
            <>
              <div className="perfil-creditos-text">
                <span>{usados}</span> de <span>{totalPlano}</span> respostas usadas este mês
              </div>
              <div className="perfil-prog-track">
                <div className="perfil-prog-fill" style={{ width: `${pctUsado}%` }} />
              </div>
              <div className="perfil-creditos-rest">{creditos} restantes</div>
            </>
          )}
        </div>

        {/* ── SEÇÃO 3: Informações pessoais ─────────────── */}
        <div className="perfil-card">
          <div className="perfil-card__label">INFORMAÇÕES PESSOAIS</div>

          <form onSubmit={handleSalvar} className="perfil-form">
            <div className="perfil-form-group">
              <label>Nome completo</label>
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Seu nome"
              />
            </div>

            <div className="perfil-form-row">
              <div className="perfil-form-group">
                <label>Idade</label>
                <input
                  type="number"
                  value={idade}
                  onChange={e => setIdade(e.target.value)}
                  placeholder="25"
                  min="16"
                  max="99"
                />
              </div>
              <div className="perfil-form-group">
                <label>Cidade</label>
                <input
                  type="text"
                  value={cidade}
                  onChange={e => setCidade(e.target.value)}
                  placeholder="São Paulo"
                />
              </div>
            </div>

            <div className="perfil-form-group">
              <label>Objetivo principal</label>
              <select value={objetivoPrincipal} onChange={e => setObjetivoPrincipal(e.target.value)}>
                <option value="">Selecione...</option>
                <option value="conhecer_alguem">Conhecer alguém novo</option>
                <option value="reconquistar">Reconquistar alguém</option>
                <option value="vida_social">Melhorar minha vida social</option>
                <option value="friendzone">Sair da friendzone</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div className="perfil-form-group">
              <label>Nível de experiência</label>
              <select value={nivelExperiencia} onChange={e => setNivelExperiencia(e.target.value)}>
                <option value="">Selecione...</option>
                <option value="iniciante">Iniciante — ainda me perco nas conversas</option>
                <option value="intermediario">Intermediário — às vezes trava na hora H</option>
                <option value="avancado">Avançado — só preciso de ajuda pontual</option>
              </select>
            </div>

            {saveMsg && (
              <div className={saveMsg.startsWith('⚠️') ? 'auth-erro' : 'auth-sucesso'}>
                {saveMsg}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={saveLoad}>
              {saveLoad ? 'Salvando...' : '💾 SALVAR PERFIL'}
            </button>
          </form>
        </div>

        {/* ── SEÇÃO 4: Estatísticas ─────────────────────── */}
        <div className="perfil-card">
          <div className="perfil-card__label">ESTATÍSTICAS</div>
          <div className="perfil-stats-grid">
            <div className="perfil-stat">
              <span className="perfil-stat__icon">🔢</span>
              <span className="perfil-stat__val">{stats.respostas}</span>
              <span className="perfil-stat__desc">Respostas geradas</span>
            </div>
            <div className="perfil-stat">
              <span className="perfil-stat__icon">🔍</span>
              <span className="perfil-stat__val">{stats.analises}</span>
              <span className="perfil-stat__desc">Análises feitas</span>
            </div>
            <div className="perfil-stat">
              <span className="perfil-stat__icon">📅</span>
              <span className="perfil-stat__val perfil-stat__val--sm">
                {formatarData(user?.created_at)}
              </span>
              <span className="perfil-stat__desc">Membro desde</span>
            </div>
            <div className="perfil-stat">
              <span className="perfil-stat__icon">🏆</span>
              <span className="perfil-stat__val perfil-stat__val--sm">{stats.topObjetivo}</span>
              <span className="perfil-stat__desc">Objetivo mais usado</span>
            </div>
          </div>
        </div>

        {/* ── SEÇÃO 5: Zona de perigo ───────────────────── */}
        <div className="perfil-card perfil-card--danger">
          <div className="perfil-card__label">ZONA DE PERIGO</div>
          <div className="perfil-danger-btns">
            <button className="btn-primary perfil-btn-logout" onClick={handleLogout} type="button">
              🚪 SAIR DA CONTA
            </button>
            <button
              className="perfil-btn-delete"
              type="button"
              onClick={() => alert('Para excluir sua conta, entre em contato com o suporte: suporte@dogmauia.com')}
            >
              🗑️ EXCLUIR CONTA
            </button>
          </div>
        </div>

      </main>

      <BottomNav />
    </>
  )
}
