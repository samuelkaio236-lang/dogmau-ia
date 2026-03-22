// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'center',
      height:'100vh', background:'#080000',
      color:'#e8001a', fontFamily:'Bebas Neue, sans-serif',
      fontSize:'22px', letterSpacing:'4px'
    }}>
      CARREGANDO...
    </div>
  )

  return user ? children : <Navigate to="/login" replace />
}
