// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login    from './pages/Login'
import Cadastro from './pages/Cadastro'
import AppMain       from './pages/AppMain'
import Analise       from './pages/Analise'
import Historico     from './pages/Historico'
import Perfil        from './pages/Perfil'
import ResetPassword from './pages/ResetPassword'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"               element={<Navigate to="/login" replace />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/cadastro"       element={<Cadastro />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/app"            element={<ProtectedRoute><AppMain /></ProtectedRoute>} />
          <Route path="/analise"        element={<ProtectedRoute><Analise /></ProtectedRoute>} />
          <Route path="/historico"      element={<ProtectedRoute><Historico /></ProtectedRoute>} />
          <Route path="/perfil"         element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
          <Route path="*"               element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
