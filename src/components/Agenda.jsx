import { useMemo, useState } from 'react'
import Schermata from './Schermata.jsx'
import { BadgeLivello, Pill, Cerca, TASTO_SECONDARIO } from './ui.jsx'
import { d, fmtData, giorniTra, oggi, normalizza, addMesi, datiMancanti } from '../calcoli.js'
import { AREE, areaDi } from '../config.js'

const GRUPPI = {
  tutte: { nome: 'Tutte', test: () => true },
  ...Object.fromEntries(AREE.map((a) => [a.k, { nome: a.nome, test: (v) => areaDi(v.tipo || '') === a.k }])),
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

export function RigaVoce({ voce, onApri, senzaCondominio }) {
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
            <p className="min-w-0 truncate text-xs font-semibold uppercase tracking-wide text-neutral-500">{senzaCondominio ? '' : voce.condominio}</p>
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

export default function Agenda({ dati, agenda, vai, indietro, filtro, condominio: condSel }) {
  const [gruppo, setGruppo] = useState(GRUPPI[filtro?.gruppo] ? filtro.gruppo : 'tutte')
  const [livello, setLivello] = useState(filtro?.livello || 'gestire')
  const [q, setQ] = useState('')
  const rif = oggi()

  const base = useMemo(() => {
    const n = normalizza(q)
    return agenda.filter((v) =>
      GRUPPI[gruppo].test(v) &&
      (!n || normalizza(`${v.condominio} ${v.titolo} ${v.sotto || ''}`).includes(n)))
  }, [agenda, gruppo, q])
  const voci = base.filter((v) => LIVELLI[livello].test(v, rif))

  // Dati mancanti: scadenze senza data, ISTAT da verificare, contratti da verificare, unità senza rendita
  const mancanti = useMemo(() => {
    if (livello !== 'nd') return []
    const n = normalizza(q)
    return datiMancanti(dati, agenda).filter((v) => gruppo === 'tutte' || GRUPPI[gruppo].test({ tipo: v.tipo || '' }))
      .filter((v) => !n || normalizza(`${v.condominio} ${v.titolo}`).includes(n))
  }, [livello, dati, agenda, q, gruppo])

  const elenco = livello === 'nd' ? mancanti : voci
  const conta = (k) => (k === 'nd' ? undefined : base.filter((v) => LIVELLI[k].test(v, rif)).length)

  return (
    <Schermata titolo="Scadenze" sotto={condSel ? `Tutte le scadenze di ${condSel}` : 'Scadenze periodiche, locazioni e IMU di tutti i condomini'} onIndietro={indietro}>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {Object.entries(LIVELLI).map(([k, l]) => <Pill key={k} attivo={livello === k} onClick={() => setLivello(k)} conteggio={conta(k)}>{l.nome}</Pill>)}
      </div>
      <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1">
        {Object.entries(GRUPPI).map(([k, g]) => <Pill key={k} attivo={gruppo === k} onClick={() => setGruppo(k)}>{g.nome}</Pill>)}
      </div>
      <div className="mt-3">
        <Cerca valore={q} onChange={setQ} placeholder={condSel ? 'Cerca (descrizione, conduttore…)' : 'Cerca (condominio, descrizione, conduttore…)'} />
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {elenco.map((v) => <RigaVoce key={v.chiave} voce={v} senzaCondominio={!!condSel} onApri={(x) => apriVoce(x, vai)} />)}
      </ul>
      {elenco.length === 0 && <p className="mt-6 text-center text-neutral-500">Nessuna scadenza con questi filtri.</p>}

      <button onClick={() => vai('scadenza', {})} className={`${TASTO_SECONDARIO} mt-5`}>+ Nuova scadenza</button>
    </Schermata>
  )
}
