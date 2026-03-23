import { useNavigate, useLocation } from 'react-router-dom'

export default function BottomNav() {
  const navigate  = useNavigate()
  const { pathname } = useLocation()

  const tabs = [
    { path: '/app',     label: 'RESPOSTAS', icon: '⚡' },
    { path: '/analise', label: 'ANÁLISE',   icon: '🔍' },
  ]

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.path}
          className={`bottom-nav__tab${pathname === tab.path ? ' bottom-nav__tab--active' : ''}`}
          onClick={() => navigate(tab.path)}
          type="button"
        >
          <span className="bottom-nav__icon">{tab.icon}</span>
          <span className="bottom-nav__label">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
