// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [perfil,  setPerfil]  = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchPerfil = async (userId) => {
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single()
    setPerfil(data)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchPerfil(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) fetchPerfil(session.user.id)
        else setPerfil(null)
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setPerfil(null)
  }

  const descontarCredito = async () => {
    if (!perfil) return
    const novos = Math.max(0, perfil.creditos_restantes - 1)
    setPerfil(prev => ({ ...prev, creditos_restantes: novos }))
    await supabase
      .from('usuarios')
      .update({ creditos_restantes: novos })
      .eq('id', perfil.id)
  }

  return (
    <AuthContext.Provider value={{ user, perfil, loading, logout, descontarCredito }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
