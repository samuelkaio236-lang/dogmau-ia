const TONES = [
  {
    id: 'divertido',
    emoji: '😛',
    name: 'DIVERTIDO',
    desc: 'Leve, brincalhão, cria clima sem forçar',
  },
  {
    id: 'provocante',
    emoji: '😏',
    name: 'PROVOCANTE',
    desc: 'Irônico, ousado, deixa ela intrigada',
  },
  {
    id: 'cachorrão',
    emoji: '🔥',
    name: 'CACHORRÃO',
    desc: 'Intenso, dominante, você é o prêmio',
  },
]

export default function ToneSelector({ selected, onChange }) {
  return (
    <div className="card">
      <div className="card__title">
        <span className="step-num">4</span>
        Escolha o tom da resposta
      </div>
      <div className="tone-grid">
        {TONES.map((tone) => (
          <button
            key={tone.id}
            className={`tone-btn${selected === tone.id ? ' tone-btn--selected' : ''}`}
            data-tone={tone.id}
            onClick={() => onChange(tone.id)}
            type="button"
          >
            <span className="tone-btn__emoji">{tone.emoji}</span>
            <div className="tone-btn__name">{tone.name}</div>
            <div className="tone-btn__desc">{tone.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
