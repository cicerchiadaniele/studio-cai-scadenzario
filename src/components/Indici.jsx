import { useMemo, useState } from 'react'
import Schermata from './Schermata.jsx'
import { Modulo, Sezione, Avviso, CAMPO, Pill, TASTO_SECONDARIO } from './ui.jsx'
import { schemaIstat, schemaAliquota } from '../schemi.js'
import { euro, nomeMese, arrot } from '../calcoli.js'

function Calcolatore({ righe }) {
  const [canone, setCanone] = useState('')
  const [mese, setMese] = useState(righe[0]?.Mese || '')
  const [perc, setPerc] = useState(0.75)
  const r = righe.find((x) => x.Mese === mese)
  const c = Number(String(canone).replace(',', '.'))
  const aumento = r && c ? arrot(c * (r['Variazione annua %'] / 100) * perc) : null
  return (
    <div className="rounded-2xl bg-neutral-50 p-4 ring-1 ring-neutral-200">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-sm font-semibold text-neutral-700">Canone annuo (€)
          <input type="number" inputMode="decimal" step="0.01" value={canone} onChange={(e) => setCanone(e.target.value)} className={`${CAMPO} mt-1`} />
        </label>
        <label className="block text-sm font-semibold text-neutral-700">Indice del mese
          <select value={mese} onChange={(e) => setMese(e.target.value)} className={`${CAMPO} mt-1`}>
            {righe.map((x) => <option key={x.Mese} value={x.Mese}>{nomeMese(x.Mese)} ({x['Variazione annua %'].toLocaleString('it-IT')}%)</option>)}
          </select>
        </label>
        <div className="text-sm font-semibold text-neutral-700">Percentuale
          <div className="mt-2 flex gap-2">
            <Pill attivo={perc === 0.75} onClick={() => setPerc(0.75)}>75%</Pill>
            <Pill attivo={perc === 1} onClick={() => setPerc(1)}>100%</Pill>
          </div>
        </div>
      </div>
      {aumento !== null && (
        <p className="mt-3">Aumento annuo <strong>{euro(aumento)}</strong> · nuovo canone <strong className="text-brand">{euro(arrot(c + aumento))}</strong> annui ({euro(arrot((c + aumento) / 12))} al mese)</p>
      )}
    </div>
  )
}

export default function Indici({ dati, salva, indietro }) {
  const [nuovoIstat, setNuovoIstat] = useState(false)
  const [nuovaAliquota, setNuovaAliquota] = useState(false)
  const [esito, setEsito] = useState('')
  const righe = useMemo(() => [...dati.istat].filter((x) => typeof x['Variazione annua %'] === 'number').sort((a, b) => b.Mese.localeCompare(a.Mese)), [dati.istat])
  const aliquote = useMemo(() => [...dati.aliquote].sort((a, b) => b.Anno - a.Anno || String(a.Tipologia).localeCompare(String(b.Tipologia))), [dati.aliquote])
  const ultimo = righe[0]

  return (
    <Schermata titolo="Indici e aliquote" sotto="Indice FOI senza tabacchi (ISTAT) e aliquote IMU di Roma Capitale" onIndietro={indietro}>
      {esito && <div className="mb-4"><Avviso tipo="ok">{esito}</Avviso></div>}
      <Sezione titolo="Calcolo rapido ISTAT"><Calcolatore righe={righe} /></Sezione>

      <Sezione titolo="Indici FOI" azione={!nuovoIstat && <button onClick={() => setNuovoIstat(true)} className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-brand ring-1 ring-brand/30">+ Nuovo mese</button>}>
        {ultimo && <p className="mb-2 text-sm text-neutral-600">Ultimo indice inserito: <strong>{nomeMese(ultimo.Mese)}</strong>. L’ISTAT pubblica il dato definitivo a metà del mese successivo.</p>}
        {nuovoIstat && (
          <div className="mb-4 rounded-2xl p-4 ring-1 ring-brand/30">
            <Modulo schema={schemaIstat} iniziali={{ Base: '2025=100' }} etichettaSalva="Aggiungi indice"
              onSalva={async (campi) => { await salva('istat', null, campi); setNuovoIstat(false); setEsito(`Indice di ${nomeMese(campi.Mese)} aggiunto.`) }}
              onAnnulla={() => setNuovoIstat(false)} />
          </div>
        )}
        <div className="max-h-96 overflow-y-auto rounded-2xl ring-1 ring-neutral-200">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
              <tr><th className="px-3 py-2">Mese</th><th className="px-3 py-2 text-right">Indice</th><th className="px-3 py-2">Base</th><th className="px-3 py-2 text-right">Var. annua</th></tr>
            </thead>
            <tbody>
              {[...dati.istat].sort((a, b) => b.Mese.localeCompare(a.Mese)).map((r) => (
                <tr key={r.id} className="border-t border-neutral-100">
                  <td className="px-3 py-1.5">{nomeMese(r.Mese)}</td>
                  <td className="px-3 py-1.5 text-right">{r['Indice FOI']?.toLocaleString('it-IT', { minimumFractionDigits: 1 })}</td>
                  <td className="px-3 py-1.5 text-neutral-500">{r.Base}</td>
                  <td className="px-3 py-1.5 text-right font-semibold">{typeof r['Variazione annua %'] === 'number' ? `${r['Variazione annua %'].toLocaleString('it-IT')}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-neutral-500">Dal gennaio 2026 l’indice FOI ha base 2025=100 (coefficiente di raccordo con la base 2015: 1,214). Per gli aggiornamenti si usa la variazione annua pubblicata.</p>
      </Sezione>

      <Sezione titolo="Aliquote IMU Roma" azione={!nuovaAliquota && <button onClick={() => setNuovaAliquota(true)} className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-brand ring-1 ring-brand/30">+ Nuova aliquota</button>}>
        {nuovaAliquota && (
          <div className="mb-4 rounded-2xl p-4 ring-1 ring-brand/30">
            <Modulo schema={schemaAliquota} iniziali={{ Anno: new Date().getFullYear() + 1, Tipologia: 'Altri fabbricati' }} etichettaSalva="Aggiungi aliquota"
              onSalva={async (campi) => { await salva('aliquote', null, { ...campi, Voce: `${campi.Anno} – ${campi.Tipologia}` }); setNuovaAliquota(false); setEsito('Aliquota aggiunta.') }}
              onAnnulla={() => setNuovaAliquota(false)} />
          </div>
        )}
        <ul className="flex flex-col gap-2">
          {aliquote.map((a) => (
            <li key={a.id} className="flex items-start justify-between gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-neutral-200">
              <span><span className="font-semibold">{a.Anno} · {a.Tipologia}</span><span className="block text-xs text-neutral-500">{a.Fonte}</span></span>
              <span className="font-display text-lg font-semibold text-brand">{Number(a['Aliquota (per mille)']).toLocaleString('it-IT')}‰</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-neutral-500">Le aliquote di ogni anno sono nel prospetto pubblicato sul portale del MEF (Dipartimento Finanze) entro il 28 ottobre.</p>
      </Sezione>
      <button onClick={indietro} className={`${TASTO_SECONDARIO} mt-6`}>Indietro</button>
    </Schermata>
  )
}
