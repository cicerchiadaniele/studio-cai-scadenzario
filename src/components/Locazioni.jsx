import { useMemo, useState } from 'react'
import Schermata from './Schermata.jsx'
import { Pill, Cerca, TASTO_SECONDARIO } from './ui.jsx'
import { adeguamentiIstat, mappaIstat, prossimaFine, fmtData, euro, normalizza, nd } from '../calcoli.js'

const FILTRI = { Attivo: 'Attivi', 'Da verificare': 'Da verificare', Cessato: 'Cessati', tutti: 'Tutti' }

export default function Locazioni({ dati, vai, indietro }) {
  const [filtro, setFiltro] = useState('Attivo')
  const [q, setQ] = useState('')
  const istat = useMemo(() => mappaIstat(dati.istat), [dati.istat])
  const immobili = useMemo(() => new Map(dati.immobili.map((i) => [i.id, i])), [dati.immobili])

  const righe = useMemo(() => {
    const n = normalizza(q)
    return dati.contratti
      .filter((c) => (filtro === 'tutti' || c.Stato === filtro) && (!n || normalizza(`${c.Condominio} ${c.Conduttore}`).includes(n)))
      .map((c) => ({ c, fine: prossimaFine(c), adeg: adeguamentiIstat(c, istat), unita: immobili.get((c.Immobile || [])[0]) }))
      .sort((a, b) => a.c.Condominio.localeCompare(b.c.Condominio, 'it') || String(a.c.Conduttore).localeCompare(String(b.c.Conduttore), 'it'))
  }, [dati.contratti, filtro, q, istat, immobili])

  const conta = (k) => (k === 'tutti' ? dati.contratti.length : dati.contratti.filter((c) => c.Stato === k).length)
  const totale = righe.filter((r) => r.c.Stato === 'Attivo').reduce((s, r) => s + (Number(r.c['Canone attuale annuo']) || Number(r.c['Canone iniziale annuo']) || 0), 0)

  return (
    <Schermata titolo="Locazioni" sotto="Appartamenti, locali, box e cantine di proprietà condominiale" onIndietro={indietro}>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {Object.entries(FILTRI).map(([k, n]) => <Pill key={k} attivo={filtro === k} onClick={() => setFiltro(k)} conteggio={conta(k)}>{n}</Pill>)}
      </div>
      <div className="mt-3"><Cerca valore={q} onChange={setQ} placeholder="Cerca condominio o conduttore" /></div>
      {filtro === 'Attivo' && <p className="mt-3 text-sm text-neutral-600">Canoni annui dei contratti attivi in elenco: <strong>{euro(totale)}</strong></p>}

      <ul className="mt-4 flex flex-col gap-2">
        {righe.map(({ c, fine, adeg, unita }) => {
          const canone = Number(c['Canone attuale annuo']) || Number(c['Canone iniziale annuo'])
          return (
            <li key={c.id}>
              <button onClick={() => vai('contratto', { id: c.id })} className="flex w-full items-start gap-3 rounded-2xl bg-white px-4 py-3.5 text-left ring-1 ring-neutral-200 transition hover:ring-brand/40 active:bg-neutral-50">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{c.Condominio}{unita ? ` · ${unita.Tipologia || ''}` : ''}</p>
                  <p className="font-semibold leading-snug">{c.Conduttore}</p>
                  <p className="mt-0.5 text-sm text-neutral-600">
                    {nd(c['Tipo contratto']) ? 'Tipo contratto da completare' : c['Tipo contratto']}
                    {fine && c.Stato !== 'Cessato' ? ` · scade ${fmtData(fine.data)}` : ''}
                  </p>
                  {adeg.righe.length > 0 && c.Stato !== 'Cessato' && (
                    <p className="mt-1 text-xs font-bold text-amber-800">ISTAT da applicare: {adeg.righe.length} {adeg.righe.length === 1 ? 'annualità' : 'annualità'}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display text-lg font-semibold text-brand">{canone ? euro(canone / 12) : '—'}</p>
                  <p className="text-xs text-neutral-500">al mese</p>
                  {c.Stato !== 'Attivo' && <p className={`mt-1 text-xs font-bold ${c.Stato === 'Cessato' ? 'text-neutral-500' : 'text-amber-800'}`}>{c.Stato}</p>}
                </div>
              </button>
            </li>
          )
        })}
      </ul>
      {righe.length === 0 && <p className="mt-6 text-center text-neutral-500">Nessun contratto.</p>}
      <button onClick={() => vai('contratto', {})} className={`${TASTO_SECONDARIO} mt-5`}>+ Nuovo contratto</button>
    </Schermata>
  )
}
