const OBJECTIVES = [
  {
    id: 'puxar',
    emoji: '💬',
    name: 'PUXAR ASSUNTO',
    desc: 'Iniciar ou reativar conversa',
  },
  {
    id: 'flertar',
    emoji: '💘',
    name: 'FLERTAR',
    desc: 'Criar tensão e interesse',
  },
  {
    id: 'encontro',
    emoji: '📍',
    name: 'MARCAR ENCONTRO',
    desc: 'Sair do virtual pro real',
  },
  {
    id: 'reengajar',
    emoji: '🔥',
    name: 'REENGAJAR',
    desc: 'Retomar após silêncio',
  },
]

export default function ObjectiveSelector({ selected, onChange }) {
  return (
    <div className="card">
      <div className="card__title">
        <span className="step-num">3</span>
        Qual é o seu objetivo?
      </div>
      <div className="obj-grid">
        {OBJECTIVES.map((obj) => (
          <button
            key={obj.id}
            className={`tone-btn${selected === obj.id ? ' tone-btn--selected' : ''}`}
            onClick={() => onChange(obj.id)}
            type="button"
          >
            <span className="tone-btn__emoji">{obj.emoji}</span>
            <div className="tone-btn__name">{obj.name}</div>
            <div className="tone-btn__desc">{obj.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
