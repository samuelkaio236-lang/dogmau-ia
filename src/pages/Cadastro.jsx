// src/pages/Cadastro.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Auth.css'

export default function Cadastro() {
  const navigate  = useNavigate()
  const [nome,    setNome]    = useState('')
  const [email,   setEmail]   = useState('')
  const [senha,   setSenha]   = useState('')
  const [erro,    setErro]    = useState('')
  const [loading, setLoading] = useState(false)

  const handleCadastro = async (e) => {
    e.preventDefault()
    setErro('')

    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)

    // 1. Cria o usuário
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome } },
    })

    if (error) {
      setErro('Erro ao criar conta. Tente outro email.')
      setLoading(false)
      return
    }

    // 2. Cria o perfil com plano free (5 créditos)
    if (data.user) {
      await supabase.from('usuarios').insert({
        id:                 data.user.id,
        email,
        nome,
        plano:              'free',
        creditos_restantes: 5,
      })
    }

    navigate('/app')
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          <img src="/logo.png" alt="Dog Mau IA" />
          <div className="auth-logo-name">DOG MAU IA</div>
          <div className="auth-logo-sub">Inteligência de Conquista</div>
        </div>

        <h2 className="auth-title">Primeiro acesso? Crie sua conta</h2>

        <form onSubmit={handleCadastro} className="auth-form">
          <div className="form-group">
            <label>Nome</label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Seu nome"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          {erro && <div className="auth-erro">⚠️ {erro}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Criando conta...' : '⚡ CRIAR MINHA CONTA'}
          </button>
        </form>

        <p className="auth-link">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>

      </div>
    </div>
  )
}
