export default function ContextCard({ girlName, onNameChange, context, onContextChange }) {
  return (
    <div className="card">
      <div className="card__title">
        <span className="step-num">2</span>
        Contexto extra (opcional)
      </div>

      <div className="name-field">
        <label className="name-field__label" htmlFor="girl-name">
          Nome dela
        </label>
        <input
          id="girl-name"
          className="name-input"
          type="text"
          placeholder="Ex: Juliana"
          maxLength={40}
          value={girlName}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>

      <textarea
        className="context-input"
        placeholder="Ex: 'A gente se conheceu na academia, segunda vez que conversamos, ela parece tímida...' — quanto mais contexto, melhor a resposta"
        value={context}
        onChange={(e) => onContextChange(e.target.value)}
      />
    </div>
  )
}
