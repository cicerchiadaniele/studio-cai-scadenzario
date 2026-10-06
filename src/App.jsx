import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { caricaDati, leggiCache, cacheValida, scriviCache, crea, aggiorna, elimina } from './api.js'
import { costruisciAgenda } from './calcoli.js'
import { Sfondo, Intestazione, PiePagina } from './components/Cornice.jsx'
import Home from './components/Home.jsx'
import Agenda from './components/Agenda.jsx'
import SchedaScadenza from './components/SchedaScadenza.jsx'
import Locazioni from './components/Locazioni.jsx'
import SchedaContratto from './components/SchedaContratto.jsx'
import Immobili from './components/Immobili.jsx'
import SchedaImmobile from './components/SchedaImmobile.jsx'
import Indici from './components/Indici.jsx'

const VUOTI = { condomini: [], immobili: [], contratti: [], scadenze: [], aliquote: [], istat: [], incompleto: false, letto: null }

export default function App() {
  const [dati, setDati] = useState(() => leggiCache() || VUOTI)
  const [caricamento, setCaricamento] = useState(() => (cacheValida(leggiCache()) ? 'pronto' : 'attesa'))
  const [pila, setPila] = useState([{ v: 'home' }])

  const ricarica = useCallback(async () => {
    setCaricamento((c) => (c === 'pronto' ? 'aggiorno' : 'attesa'))
    try {
      setDati(await caricaDati())
      setCaricamento('pronto')
    } catch {
      setCaricamento((c) => (c === 'aggiorno' || leggiCache() ? 'pronto-errore' : 'errore'))
    }
  }, [])

  // Lettura da Airtable solo se la cache del dispositivo è scaduta (risparmio di operazioni Make)
  useEffect(() => { if (!cacheValida(leggiCache())) ricarica() }, [ricarica])

  const agenda = useMemo(() => costruisciAgenda(dati), [dati])

  const vai = (v, p) => { setPila((s) => [...s, { v, p }]); window.scrollTo?.({ top: 0 }) }
  const indietro = () => setPila((s) => (s.length > 1 ? s.slice(0, -1) : s))
  const home = () => setPila([{ v: 'home' }])

  // Scritture: dopo la conferma di Airtable aggiorno i dati locali senza rileggere tutto.
  const aggiornaLocale = (tabella, fn) =>
    setDati((s) => { const n = { ...s, [tabella]: fn(s[tabella]) }; scriviCache(n); return n })

  const salva = async (tabella, id, campi) => {
    if (id) {
      await aggiorna(tabella, id, campi)
      aggiornaLocale(tabella, (lista) => lista.map((r) => (r.id === id ? { ...r, ...campi } : r)))
      return id
    }
    const [nuovo] = await crea(tabella, campi)
    aggiornaLocale(tabella, (lista) => [...lista, { id: nuovo, ...campi }])
    return nuovo
  }
  const cancella = async (tabella, id) => {
    await elimina(tabella, id)
    aggiornaLocale(tabella, (lista) => lista.filter((r) => r.id !== id))
  }

  const corrente = pila[pila.length - 1]
  const comune = { dati, agenda, vai, indietro, salva, cancella }

  return (
    <div className="relative flex min-h-screen flex-col bg-paper bg-noise text-neutral-900">
      <Sfondo />
      <Intestazione />
      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pt-4 sm:pt-6">
        <AnimatePresence mode="wait">
          {corrente.v === 'home' && <Home key="home" {...comune} caricamento={caricamento} onRicarica={ricarica} />}
          {corrente.v === 'agenda' && <Agenda key={`agenda-${pila.length}`} {...comune} filtro={corrente.p} />}
          {corrente.v === 'scadenza' && <SchedaScadenza key={`sc-${corrente.p?.id || 'nuova'}`} {...comune} id={corrente.p?.id} />}
          {corrente.v === 'locazioni' && <Locazioni key="loc" {...comune} />}
          {corrente.v === 'contratto' && <SchedaContratto key={`co-${corrente.p?.id || 'nuovo'}`} {...comune} id={corrente.p?.id} />}
          {corrente.v === 'immobili' && <Immobili key="imm" {...comune} filtro={corrente.p} />}
          {corrente.v === 'immobile' && <SchedaImmobile key={`im-${corrente.p?.id || 'nuovo'}`} {...comune} id={corrente.p?.id} />}
          {corrente.v === 'indici' && <Indici key="ind" {...comune} />}
        </AnimatePresence>
        {corrente.v !== 'home' && (
          <button onClick={home} className="mx-auto mt-4 text-sm font-semibold text-brand underline underline-offset-2">Torna all’inizio</button>
        )}
      </div>
      <PiePagina />
    </div>
  )
}
