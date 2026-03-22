export default function GenerateButton({ onClick, disabled }) {
  return (
    <button
      className="gen-btn"
      id="gen-btn"
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      ⚡ GERAR RESPOSTAS AGORA
    </button>
  )
}
