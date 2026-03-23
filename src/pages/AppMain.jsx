import { useState, useRef, useEffect } from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import UploadCard from '../components/UploadCard'
import ContextCard from '../components/ContextCard'
import ToneSelector from '../components/ToneSelector'
import ObjectiveSelector from '../components/ObjectiveSelector'
import GenerateButton from '../components/GenerateButton'
import LoadingState from '../components/LoadingState'
import ResultsSection from '../components/ResultsSection'
import BottomSheet from '../components/BottomSheet'
import { useIsMobile } from '../hooks/useIsMobile'
import { generateResponses } from '../utils/api'

const LOADING_MESSAGES = [
  'Analisando a conversa...',
  'Decodificando o contexto...',
  'Gerando respostas certeiras...',
  'Afinando o tom...',
]

export default function AppMain() {
  const [input, setInput] = useState(null)
  const [girlName, setGirlName] = useState('')
  const [context, setContext] = useState('')
  const [objetivo, setObjetivo] = useState('puxar')
  const [tone, setTone] = useState('divertido')
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState(LOADING_MESSAGES[0])
  const [results, setResults] = useState([])
  const [error, setError] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)

  const loadingIntervalRef = useRef(null)
  const resultsRef = useRef(null)
  const isMobile = useIsMobile()

  function startLoadingCycle() {
    let i = 0
    setLoadingText(LOADING_MESSAGES[0])
    loadingIntervalRef.current = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length
      setLoadingText(LOADING_MESSAGES[i])
    }, 2200)
  }

  function stopLoadingCycle() {
    clearInterval(loadingIntervalRef.current)
  }

  useEffect(() => {
    if (results.length === 0) return
    if (isMobile) {
      setSheetOpen(true)
    } else {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [results]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleGenerate() {
    if (!input) {
      setError('Envie um print ou cole o texto da conversa primeiro.')
      return
    }

    setError('')
    setResults([])
    setSheetOpen(false)
    setLoading(true)
    startLoadingCycle()

    try {
      const responses = await generateResponses({ input, context, tone, objetivo, girlName })
      setResults(responses)
    } catch (err) {
      setError(err.message || 'Erro ao gerar respostas. Tente novamente.')
    } finally {
      setLoading(false)
      stopLoadingCycle()
    }
  }

  return (
    <>
      <div className="orb orb--1" />
      <div className="orb orb--2" />

      <Header />

      <main className="main">
        <Hero />

        <UploadCard onInputChange={setInput} />

        <ContextCard
          girlName={girlName}
          onNameChange={setGirlName}
          context={context}
          onContextChange={setContext}
        />

        <ObjectiveSelector selected={objetivo} onChange={setObjetivo} />

        <ToneSelector selected={tone} onChange={setTone} />

        <GenerateButton onClick={handleGenerate} disabled={loading || !input} />

        {error && <div className="error-card visible">{error}</div>}

        <LoadingState visible={loading} text={loadingText} />

        {isMobile ? (
          <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
            <ResultsSection results={results} objetivo={objetivo} tone={tone} />
          </BottomSheet>
        ) : (
          <div ref={resultsRef}>
            <ResultsSection results={results} objetivo={objetivo} tone={tone} />
          </div>
        )}
      </main>

      <footer className="footer">
        DOG MAU IA © 2025 — Feito para homens que jogam pra ganhar 🐺
      </footer>
    </>
  )
}
