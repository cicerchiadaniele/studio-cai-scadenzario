// Elementi comuni dello Scadenzario, nello stile di casa Studio CAI.
import { useState } from 'react'
import { ND } from '../config.js'

const LIVELLI = {
  scaduto: { cls: 'bg-red-50 text-red-700 ring-red-200', testo: 'Scaduta' },
  imminente: { cls: 'bg-amber-50 text-amber-800 ring-amber-200', testo: 'In scadenza' },
  futuro: { cls: 'bg-neutral-100 text-neutral-600 ring-neutral-200', testo: 'Prevista' },
  fatto: { cls: 'bg-green-50 text-green-700 ring-green-200', testo: 'Fatta' },
  nd: { cls: 'bg-red-50 text-red-700 ring-red-200', testo: 'Data mancante' },
}

export function BadgeLivello({ livello, children }) {
  const l = LIVELLI[livello] || LIVELLI.futuro
  return (
    <span className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${l.cls}`}>
      {children || l.testo}
    </span>
  )
}

export function Pill({ attivo, onClick, children, conteggio }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold ring-1 transition ${
        attivo ? 'bg-brand text-white ring-brand' : 'bg-white text-neutral-700 ring-neutral-200 hover:ring-neutral-300'
      }`}
    >
      {children}
      {typeof conteggio === 'number' && (
        <span className={`rounded-full px-1.5 text-xs ${attivo ? 'bg-white/20' : 'bg-neutral-100 text-neutral-500'}`}>{conteggio}</span>
      )}
    </button>
  )
}

export const CAMPO =
  'w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-base outline-none transition placeholder:text-neutral-400 hover:border-neutral-400 focus:border-brand focus:ring-2 focus:ring-brand/20'
export const TASTO_PRIMARIO =
  'w-full rounded-2xl bg-gradient-to-br from-brand to-brand-dark py-4 text-base font-bold text-white shadow-[0_10px_24px_-10px_rgba(139,21,56,0.6)] transition active:scale-[0.98] disabled:from-neutral-200 disabled:to-neutral-200 disabled:text-neutral-400 disabled:shadow-none'
export const TASTO_SECONDARIO =
  'w-full rounded-2xl bg-white py-3.5 font-bold text-brand ring-1 ring-brand/30 transition active:scale-[0.98] disabled:opacity-50'
export const TASTO_PICCOLO =
  'rounded-xl bg-white px-3 py-2 text-sm font-bold text-brand ring-1 ring-brand/30 transition active:scale-[0.98] disabled:opacity-50'

export function Sezione({ titolo, azione, children }) {
  return (
    <section className="mt-6 first:mt-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-neutral-900">{titolo}</h3>
        {azione}
      </div>
      {children}
    </section>
  )
}

export function Dato({ etichetta, valore, evidenzia }) {
  const mancante = valore === undefined || valore === null || valore === '' || valore === ND
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{etichetta}</dt>
      <dd className={`mt-0.5 break-words ${mancante ? 'font-semibold text-red-600' : evidenzia ? 'font-bold text-brand' : 'text-neutral-900'}`}>
        {mancante ? ND : valore}
      </dd>
    </div>
  )
}

export function Avviso({ tipo = 'info', children }) {
  const cls = {
    info: 'bg-neutral-50 text-neutral-700 ring-neutral-200',
    ok: 'bg-green-50 text-green-800 ring-green-200',
    attenzione: 'bg-amber-50 text-amber-800 ring-amber-200',
    errore: 'bg-red-50 text-red-700 ring-red-200',
  }[tipo]
  return <div className={`rounded-2xl px-4 py-3 text-sm ring-1 ${cls}`} role={tipo === 'errore' ? 'alert' : 'status'}>{children}</div>
}

// Campo di un modulo: tipo text | number | euro | date | select | textarea | check
export function Campo({ def, valore, onChange }) {
  const id = `c-${def.k.replace(/\W/g, '')}`
  const comune = { id, className: CAMPO, value: valore ?? '', onChange: (e) => onChange(e.target.value) }
  let input
  if (def.tipo === 'select') {
    input = (
      <select {...comune}>
        <option value="">—</option>
        {def.opzioni.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    )
  } else if (def.tipo === 'textarea') {
    input = <textarea {...comune} rows={3} />
  } else if (def.tipo === 'check') {
    return (
      <label className="flex items-center gap-3 rounded-2xl bg-neutral-50 px-4 py-3 ring-1 ring-neutral-200">
        <input type="checkbox" checked={!!valore} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-[#8B1538]" />
        <span className="font-semibold">{def.label}</span>
      </label>
    )
  } else {
    const t = def.tipo === 'date' ? 'date' : def.tipo === 'number' || def.tipo === 'euro' ? 'number' : 'text'
    input = <input {...comune} type={t} step={def.tipo === 'euro' ? '0.01' : def.tipo === 'number' ? 'any' : undefined} inputMode={t === 'number' ? 'decimal' : undefined} placeholder={def.placeholder} list={def.lista ? `${id}-l` : undefined} />
  }
  return (
    <label htmlFor={id} className={`block ${def.largo ? 'sm:col-span-2' : ''}`}>
      <span className="mb-1 block text-sm font-semibold text-neutral-700">{def.label}{def.obbligatorio && <span className="text-brand"> *</span>}</span>
      {input}
      {def.lista && <datalist id={`${id}-l`}>{def.lista.map((o) => <option key={o} value={o} />)}</datalist>}
      {def.aiuto && <span className="mt-1 block text-xs text-neutral-500">{def.aiuto}</span>}
    </label>
  )
}

// Converte i valori dei campi del modulo nei tipi giusti per Airtable
export function valoriPerAirtable(schema, valori) {
  const out = {}
  for (const def of schema) {
    let v = valori[def.k]
    if (def.tipo === 'number' || def.tipo === 'euro') v = v === '' || v === null || v === undefined ? null : Number(String(v).replace(',', '.'))
    else if (def.tipo === 'check') v = !!v
    else if (typeof v === 'string') v = v.trim()
    out[def.k] = v
  }
  // Il Dropbox ID arriva dalla scelta del condominio e non ha un campo visibile
  if (valori['Dropbox ID'] !== undefined) out['Dropbox ID'] = valori['Dropbox ID']
  return out
}

export function Modulo({ schema, iniziali, onSalva, onAnnulla, etichettaSalva = 'Salva', extra }) {
  const [valori, setValori] = useState(() => ({ ...iniziali }))
  const [stato, setStato] = useState({ invio: false, errore: '' })
  const mancanti = schema.filter((d) => d.obbligatorio && !String(valori[d.k] ?? '').trim())
  const salva = async (e) => {
    e.preventDefault()
    if (mancanti.length) return
    setStato({ invio: true, errore: '' })
    try {
      await onSalva(valoriPerAirtable(schema, valori), valori)
    } catch (err) {
      setStato({ invio: false, errore: err.message })
      return
    }
    setStato({ invio: false, errore: '' })
  }
  return (
    <form onSubmit={salva} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {schema.map((def) => (
          <Campo key={def.k} def={def} valore={valori[def.k]} onChange={(v) => setValori((s) => ({ ...s, ...(def.onCambia ? def.onCambia(v, s) : {}), [def.k]: v }))} />
        ))}
      </div>
      {extra}
      {stato.errore && <Avviso tipo="errore">{stato.errore} Riprova.</Avviso>}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="submit" disabled={stato.invio || mancanti.length > 0} className={TASTO_PRIMARIO}>
          {stato.invio ? 'Salvataggio…' : etichettaSalva}
        </button>
        {onAnnulla && <button type="button" onClick={onAnnulla} className={TASTO_SECONDARIO}>Annulla</button>}
      </div>
      {mancanti.length > 0 && <p className="text-center text-xs text-neutral-500">Compila: {mancanti.map((d) => d.label).join(', ')}</p>}
    </form>
  )
}

export function Cerca({ valore, onChange, placeholder = 'Cerca' }) {
  return (
    <label className="block">
      <span className="sr-only">{placeholder}</span>
      <input type="search" inputMode="search" autoComplete="off" value={valore} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={CAMPO} />
    </label>
  )
}
