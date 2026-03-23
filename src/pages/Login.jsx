// src/pages/Login.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Auth.css'

export default function Login() {
  const navigate = useNavigate()

  // login
  const [email,   setEmail]   = useState('')
  const [senha,   setSenha]   = useState('')
  const [erro,    setErro]    = useState('')
  const [loading, setLoading] = useState(false)

  // esqueci senha
  const [showForgot,  setShowForgot]  = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotMsg,   setForgotMsg]   = useState('')
  const [forgotLoad,  setForgotLoad]  = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setErro('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) setErro('Email ou senha incorretos.')
    else navigate('/app')
    setLoading(false)
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    setForgotLoad(true)
    setForgotMsg('')
    await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setForgotMsg('✅ Enviamos um link para seu email. Verifique sua caixa de entrada.')
    setForgotLoad(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          <img src="/logo.png" alt="Dog Mau IA" />
          <div className="auth-logo-name">DOG MAU IA</div>
          <div className="auth-logo-sub">Inteligência de Conquista</div>
        </div>

        {!showForgot ? (
          <>
            <h2 className="auth-title">Bem-vindo de volta</h2>

            <form onSubmit={handleLogin} className="auth-form">
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
                  placeholder="••••••••"
                  required
                />
              </div>

              {erro && <div className="auth-erro">⚠️ {erro}</div>}

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Entrando...' : '⚡ ENTRAR'}
              </button>
            </form>

            <p className="auth-link auth-forgot-link">
              <button type="button" className="auth-link-btn" onClick={() => setShowForgot(true)}>
                Esqueci minha senha
              </button>
            </p>

            <p className="auth-link">
              Primeiro acesso? <Link to="/cadastro">Crie sua conta</Link>
            </p>
          </>
        ) : (
          <>
            <h2 className="auth-title">Redefinir senha</h2>
            <p className="auth-subtitle-dark">
              Digite seu email e enviaremos um link para criar uma nova senha.
            </p>

            <form onSubmit={handleForgot} className="auth-form">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              {forgotMsg && <div className="auth-sucesso">{forgotMsg}</div>}

              <button type="submit" className="btn-primary" disabled={forgotLoad}>
                {forgotLoad ? 'Enviando...' : '📧 ENVIAR LINK'}
              </button>
            </form>

            <p className="auth-link">
              <button type="button" className="auth-link-btn" onClick={() => setShowForgot(false)}>
                ← Voltar para o login
              </button>
            </p>
          </>
        )}

      </div>
    </div>
  )
}
