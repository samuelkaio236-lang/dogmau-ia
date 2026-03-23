// src/pages/ResetPassword.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Auth.css'

export default function ResetPassword() {
  const navigate    = useNavigate()
  const [nova,      setNova]      = useState('')
  const [confirma,  setConfirma]  = useState('')
  const [erro,      setErro]      = useState('')
  const [loading,   setLoading]   = useState(false)

  const handleReset = async (e) => {
    e.preventDefault()
    setErro('')

    if (nova.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (nova !== confirma) {
      setErro('As senhas não coincidem.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: nova })
    if (error) {
      setErro('Erro ao redefinir senha. O link pode ter expirado.')
    } else {
      navigate('/app')
    }
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

        <h2 className="auth-title">Nova senha</h2>
        <p className="auth-subtitle-dark">Escolha uma senha segura para sua conta.</p>

        <form onSubmit={handleReset} className="auth-form">
          <div className="form-group">
            <label>Nova senha</label>
            <input
              type="password"
              value={nova}
              onChange={e => setNova(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          <div className="form-group">
            <label>Confirmar senha</label>
            <input
              type="password"
              value={confirma}
              onChange={e => setConfirma(e.target.value)}
              placeholder="Repita a senha"
              required
            />
          </div>

          {erro && <div className="auth-erro">⚠️ {erro}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Salvando...' : '🔐 SALVAR NOVA SENHA'}
          </button>
        </form>

      </div>
    </div>
  )
}
