import { useRef, useState } from 'react'

export default function UploadCard({ onInputChange }) {
  const [tab, setTab] = useState('print') // 'print' | 'texto'
  const [preview, setPreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [text, setText] = useState('')
  const fileInputRef = useRef(null)

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64Full = e.target.result
      const [header, data] = base64Full.split(',')
      const mediaType = header.match(/:(.*?);/)[1]
      setPreview(base64Full)
      onInputChange({ type: 'image', base64: data, mediaType, previewUrl: base64Full })
    }
    reader.readAsDataURL(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  function handleRemoveImage() {
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    onInputChange(null)
  }

  function handleTextChange(e) {
    setText(e.target.value)
    onInputChange(e.target.value.trim() ? { type: 'text', text: e.target.value } : null)
  }

  function switchTab(next) {
    setTab(next)
    // Limpa o input do modo anterior ao trocar de aba
    if (next === 'print') {
      setText('')
      onInputChange(preview ? { type: 'image' } : null) // mantém imagem se houver
    } else {
      onInputChange(text.trim() ? { type: 'text', text } : null)
    }
  }

  return (
    <div className="card">
      <div className="card__title">
        <span className="step-num">1</span>
        Manda a conversa
      </div>

      <div className="input-tabs">
        <button
          className={`input-tab${tab === 'print' ? ' input-tab--active' : ''}`}
          onClick={() => switchTab('print')}
          type="button"
        >
          📲 Print
        </button>
        <button
          className={`input-tab${tab === 'texto' ? ' input-tab--active' : ''}`}
          onClick={() => switchTab('texto')}
          type="button"
        >
          💬 Colar texto
        </button>
      </div>

      {tab === 'print' && (
        <>
          {!preview && (
            <div
              className={`upload-area${dragOver ? ' drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFile(e.target.files[0])}
                style={{ display: 'none' }}
              />
              <span className="upload-area__icon">📲</span>
              <div className="upload-area__title">Arraste o print aqui ou clique para escolher</div>
              <div className="upload-area__desc">
                Print do WhatsApp, Instagram, Tinder...<br />JPG, PNG, WEBP
              </div>
            </div>
          )}

          {preview && (
            <div className="preview-container visible">
              <img src={preview} alt="Preview da conversa" />
              <button className="preview-remove" onClick={handleRemoveImage} aria-label="Remover imagem">
                ✕
              </button>
            </div>
          )}
        </>
      )}

      {tab === 'texto' && (
        <textarea
          className="context-input text-convo-input"
          placeholder={`Cole aqui o texto da conversa:\n\nEla: Oi, tudo bem?\nVocê: Tudo ótimo e você?\nEla: Bem também! Vi que você curte trilha...`}
          value={text}
          onChange={handleTextChange}
        />
      )}
    </div>
  )
}
