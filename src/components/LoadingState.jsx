export default function LoadingState({ visible, text }) {
  return (
    <div className={`loading${visible ? ' visible' : ''}`} id="loading">
      <div className="loading__bar-wrap">
        <div className="loading__bar" />
        <div className="loading__bar-glow" />
      </div>
      <div className="loading__text" id="loading-text">
        {text || 'Analisando a conversa...'}
      </div>
    </div>
  )
}
