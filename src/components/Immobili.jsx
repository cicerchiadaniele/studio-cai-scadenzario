import { useMemo, useState } from 'react'
import Schermata from './Schermata.jsx'
import { Pill, Cerca, TASTO_SECONDARIO, Avviso } from './ui.jsx'
import { imuImmobile, euro, oggi, normalizza, arrot } from '../calcoli.js'

export function contrattiDi(dati, imId) {
  return dati.contratti.filter((c) => (c.Immobile || []).includes(imId))
}

export default function Immobili({ dati, vai, indietro }) {
  const annoCorrente = oggi().getUTCFullYear()
  const [anno, setAnno] = useState(annoCorrente)
  const [q, setQ] = useState('')

  const gruppi = useMemo(() => {
    const n = normalizza(q)
    const m = new Map()
    for (const im of dati.immobili) {
      if (n && !normalizza(`${im.Condominio} ${im.Denominazione}`).includes(n)) continue
      const imu = imuImmobile(im, contrattiDi(dati, im.id), dati.aliquote, anno)
      const g = m.get(im.Condominio) || { condominio: im.Condominio, righe: [], totale: 0, incomplete: 0 }
      g.righe.push({ im, imu })
      if (imu.dovuta) g.totale = arrot(g.totale + imu.imposta)
      else if (imu.motivo !== 'Esente') g.incomplete++
      m.set(im.Condominio, g)
    }
    return [...m.values()].sort((a, b) => a.condominio.localeCompare(b.condominio, 'it'))
  }, [dati, anno, q])

  const totale = gruppi.reduce((s, g) => s + g.totale, 0)
  const stimata = gruppi.some((g) => g.righe.some((r) => r.imu.aliquotaStimata))

  return (
    <Schermata titolo="Immobili e IMU" sotto="Unità condominiali accatastate: per le parti comuni l’IMU la versa l’amministratore" onIndietro={indietro}>
      <div className="flex flex-wrap gap-2">
        {[annoCorrente, annoCorrente + 1].map((a) => <Pill key={a} attivo={anno === a} onClick={() => setAnno(a)}>IMU {a}</Pill>)}
      </div>
      <div className="mt-3"><Cerca valore={q} onChange={setQ} placeholder="Cerca unità" /></div>
      <p className="mt-3 text-sm text-neutral-600">IMU {anno} calcolata: <strong>{euro(arrot(totale))}</strong> (acconto 16/06 e saldo 16/12, metà ciascuno)</p>
      {stimata && <div className="mt-3"><Avviso tipo="attenzione">Aliquote {anno} non ancora inserite: uso quelle dell’ultimo anno disponibile. Aggiornale in “Indici e aliquote”.</Avviso></div>}

      <div className="mt-4 flex flex-col gap-4">
        {gruppi.map((g) => (
          <section key={g.condominio} className="rounded-2xl ring-1 ring-neutral-200">
            <div className="flex items-center justify-between gap-3 rounded-t-2xl bg-neutral-50 px-4 py-2.5">
              <h3 className="font-semibold">{g.condominio}</h3>
              <span className="text-sm font-bold text-brand">{euro(g.totale)}</span>
            </div>
            <ul className="divide-y divide-neutral-100">
              {g.righe.map(({ im, imu }) => (
                <li key={im.id}>
                  <button onClick={() => vai('immobile', { id: im.id })} className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-neutral-50">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-snug">{im.Denominazione}</p>
                      <p className="text-xs text-neutral-500">{[im['Categoria catastale'], im['Rendita catastale'] ? `rendita ${euro(Number(im['Rendita catastale']))}` : null, im.Stato].filter(Boolean).join(' · ')}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      {imu.dovuta ? (
                        <>
                          <p className="font-semibold">{euro(imu.imposta)}</p>
                          {imu.concordato && <p className="text-xs text-green-700">concordato −25%</p>}
                        </>
                      ) : (
                        <p className={`text-xs font-bold ${imu.motivo === 'Esente' ? 'text-neutral-500' : 'text-red-600'}`}>{imu.motivo}</p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {gruppi.length === 0 && <p className="mt-6 text-center text-neutral-500">Nessuna unità.</p>}
      <button onClick={() => vai('immobile', {})} className={`${TASTO_SECONDARIO} mt-5`}>+ Nuova unità</button>
    </Schermata>
  )
}
