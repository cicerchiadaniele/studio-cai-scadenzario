import { useMemo, useState } from 'react'
import Schermata from './Schermata.jsx'
import { BadgeLivello, Pill, Cerca, CAMPO, TASTO_SECONDARIO } from './ui.jsx'
import { d, fmtData, giorniTra, oggi, normalizza, addMesi, datiMancanti } from '../calcoli.js'

const GRUPPI = {
  tutte: { nome: 'Tutte', test: () => true },
  impianti: { nome: 'CPI e verifiche', test: (v) => ['CPI', 'Ascensore – verifica biennale', 'Impianto di terra (DPR 462/01)', 'Impianto termico'].includes(v.tipo) },
  locazioni: { nome: 'Locazioni', test: (v) => v.tipo.startsWith('Locazione') },
  imu: { nome: 'IMU', test: (v) => v.tipo === 'IMU' },
  altro: { nome: 'Altro', test: (v) => ['Sicurezza portieri', 'Contratto fornitore', 'APE', 'Altro'].includes(v.tipo) },
}
const LIVELLI = {
  gestire: { nome: 'Da gestire', test: (v) => v.stato !== 'Fatto' && (v.livello === 'scaduto' || v.livello === 'imminente') },
  scaduto: { nome: 'Scadute', test: (v) => v.stato !== 'Fatto' && v.livello === 'scaduto' },
  imminente: { nome: 'In scadenza', test: (v) => v.stato !== 'Fatto' && v.livello === 'imminente' },
  anno: { nome: 'Prossimi 12 mesi', test: (v, rif) => v.stato !== 'Fatto' && v.data && d(v.data) <= addMesi(rif, 12) },
  tutte: { nome: 'Tutte', test: () => true },
  nd: { nome: 'Dati mancanti', test: () => false },
}

function quando(voce, rif) {
  const x = d(voce.data)
  if (!x) return 'senza data'
  const g = giorniTra(rif, x)
  if (g === 0) return 'oggi'
  if (g === 1) return 'domani'
  if (g > 0) return g < 60 ? `tra ${g} giorni` : `tra ${Math.round(g / 30)} mesi`
  return -g < 60 ? `${-g} giorni fa` : `${Math.round(-g / 30)} mesi fa`
}

export function RigaVoce({ voce, onApri }) {
  const rif = oggi()
  return (
    <li>
      <button onClick={() => onApri(voce)} className="flex w-full items-start gap-3 rounded-2xl bg-white px-3.5 py-3 text-left ring-1 ring-neutral-200 transition hover:ring-brand/40 active:bg-neutral-50 sm:px-4">
        <div className="w-12 shrink-0 pt-0.5 text-center sm:w-14">
          <p className="font-display text-base font-semibold leading-tight text-brand sm:text-lg">{voce.data ? fmtData(voce.data).slice(0, 5) : '—'}</p>
          <p className="text-xs text-neutral-500">{voce.data ? voce.data.slice(0, 4) : ''}</p>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 truncate text-xs font-semibold uppercase tracking-wide text-neutral-500">{voce.condominio}</p>
            <BadgeLivello livello={voce.livello}>{voce.livello === 'nd' ? 'Da completare' : voce.stato === 'Fatto' ? 'Fatta' : quando(voce, rif)}</BadgeLivello>
          </div>
          <p className="mt-0.5 font-semibold leading-snug">{voce.titolo}</p>
          <p className="mt-0.5 text-sm text-neutral-600">{[voce.tipo, voce.sotto].filter(Boolean).join(' · ')}</p>
          {voce.responsabile && <p className="mt-0.5 text-xs text-neutral-500">Responsabile: {voce.responsabile}</p>}
        </div>
      </button>
    </li>
  )
}

export function apriVoce(voce, vai) {
  if (voce.fonte === 'scadenza') vai('scadenza', { id: voce.ref })
  else if (voce.fonte === 'contratto') vai('contratto', { id: voce.ref })
  else if (voce.fonte === 'immobile') vai('immobile', { id: voce.ref })
  else if (voce.fonte === 'imu') vai('immobili', { condominio: voce.condominio })
}

export default function Agenda({ dati, agenda, vai, indietro, filtro }) {
  const [gruppo, setGruppo] = useState(filtro?.gruppo || 'tutte')
  const [livello, setLivello] = useState(filtro?.livello || 'gestire')
  const [condominio, setCondominio] = useState(filtro?.condominio || '')
  const [q, setQ] = useState('')
  const rif = oggi()

  const condomini = useMemo(() => [...new Set(agenda.map((v) => v.condominio))].sort((a, b) => a.localeCompare(b, 'it')), [agenda])
  const base = useMemo(() => {
    const n = normalizza(q)
    return agenda.filter((v) =>
      GRUPPI[gruppo].test(v) &&
      (!condominio || v.condominio === condominio) &&
      (!n || normalizza(`${v.condominio} ${v.titolo} ${v.sotto || ''}`).includes(n)))
  }, [agenda, gruppo, condominio, q])
  const voci = base.filter((v) => LIVELLI[livello].test(v, rif))

  // Dati mancanti: scadenze senza data, ISTAT da verificare, contratti da verificare, unità senza rendita
  const mancanti = useMemo(() => {
    if (livello !== 'nd') return []
    const n = normalizza(q)
    return datiMancanti(dati, agenda).filter((v) => GRUPPI[gruppo].test({ tipo: v.tipo || '' }) || gruppo === 'tutte')
      .filter((v) => (!condominio || v.condominio === condominio) && (!n || normalizza(`${v.condominio} ${v.titolo}`).includes(n)))
  }, [livello, dati, agenda, condominio, q, gruppo])

  const elenco = livello === 'nd' ? mancanti : voci
  const conta = (k) => (k === 'nd' ? undefined : base.filter((v) => LIVELLI[k].test(v, rif)).length)

  return (
    <Schermata titolo="Scadenze" sotto="Scadenze periodiche, locazioni e IMU di tutti i condomini" onIndietro={indietro}>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {Object.entries(LIVELLI).map(([k, l]) => <Pill key={k} attivo={livello === k} onClick={() => setLivello(k)} conteggio={conta(k)}>{l.nome}</Pill>)}
      </div>
      <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1">
        {Object.entries(GRUPPI).map(([k, g]) => <Pill key={k} attivo={gruppo === k} onClick={() => setGruppo(k)}>{g.nome}</Pill>)}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <select value={condominio} onChange={(e) => setCondominio(e.target.value)} className={CAMPO} aria-label="Condominio">
          <option value="">Tutti i condomini</option>
          {condomini.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <Cerca valore={q} onChange={setQ} placeholder="Cerca (descrizione, conduttore…)" />
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {elenco.map((v) => <RigaVoce key={v.chiave} voce={v} onApri={(x) => apriVoce(x, vai)} />)}
      </ul>
      {elenco.length === 0 && <p className="mt-6 text-center text-neutral-500">Nessuna scadenza con questi filtri.</p>}

      <button onClick={() => vai('scadenza', {})} className={`${TASTO_SECONDARIO} mt-5`}>+ Nuova scadenza</button>
    </Schermata>
  )
}
