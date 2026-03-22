import { useRef, useState, useEffect } from 'react'

export default function BottomSheet({ open, onClose, children }) {
  const [dragY, setDragY] = useState(0)
  const startY = useRef(0)
  const dragging = useRef(false)

  // Trava o scroll do body quando o sheet está aberto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  function handleTouchStart(e) {
    startY.current = e.touches[0].clientY
    dragging.current = true
  }

  function handleTouchMove(e) {
    if (!dragging.current) return
    const delta = e.touches[0].clientY - startY.current
    if (delta > 0) setDragY(delta)
  }

  function handleTouchEnd() {
    dragging.current = false
    if (dragY > 110) onClose()
    setDragY(0)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`bs-backdrop${open ? ' bs-backdrop--visible' : ''}`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`bottom-sheet${open ? ' bottom-sheet--open' : ''}`}
        style={dragY > 0 ? { transform: `translateY(${dragY}px)`, transition: 'none' } : undefined}
      >
        {/* Área de drag — somente o handle responde ao arraste */}
        <div
          className="bs-drag-area"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="bs-handle" />
        </div>

        {/* Botão fechar */}
        <button className="bs-close" onClick={onClose} type="button" aria-label="Fechar">
          ✕
        </button>

        {/* Conteúdo rolável */}
        <div className="bs-content">
          {children}
        </div>
      </div>
    </>
  )
}
