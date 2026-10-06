import { WEBHOOK_URL, TIMEOUT_MS, APP_VERSION, CACHE_ORE } from './config.js'

const CHIAVE_CACHE = 'scadenzario:dati:v1'

// Invio come form-urlencoded: richiesta "semplice", nessun preflight CORS.
async function chiama(dati) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: new URLSearchParams({ ...dati, versione: APP_VERSION }),
      signal: ctrl.signal,
    })
    const testo = await res.text()
    let json
    try { json = JSON.parse(testo) } catch { json = null }
    if (!res.ok || !json || json.ok !== true) throw new Error('Airtable non ha confermato l’operazione.')
    return json
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('Nessuna risposta entro 30 secondi.')
    if (e instanceof TypeError) throw new Error('Connessione assente o servizio non raggiungibile.')
    throw e
  } finally {
    clearTimeout(timer)
  }
}

// Record Airtable -> oggetto piatto { id, ...campi }
const piatto = (r) => ({ id: r.id, ...(r.fields || {}) })

function normalizzaDati(json) {
  return {
    condomini: (json.condomini || []).map(piatto).filter((c) => c.Condominio),
    immobili: (json.immobili || []).map(piatto),
    contratti: (json.contratti || []).map(piatto),
    scadenze: (json.scadenze || []).map(piatto),
    aliquote: (json.aliquote || []).map(piatto),
    istat: (json.istat || []).map(piatto),
    incompleto: json.incompleto === true,
    letto: new Date().toISOString(),
  }
}

export function leggiCache() {
  try {
    const raw = localStorage.getItem(CHIAVE_CACHE)
    if (!raw) return null
    const dati = JSON.parse(raw)
    return dati && dati.letto ? dati : null
  } catch { return null }
}
export function scriviCache(dati) {
  try { localStorage.setItem(CHIAVE_CACHE, JSON.stringify(dati)) } catch { /* facoltativo */ }
}
export const cacheValida = (dati) => !!dati && Date.now() - new Date(dati.letto).getTime() < CACHE_ORE * 3600000

export async function caricaDati() {
  const dati = normalizzaDati(await chiama({ azione: 'elenco' }))
  scriviCache(dati)
  return dati
}

// Rimuove i campi calcolati o di sola lettura prima di scrivere su Airtable
const SOLA_LETTURA = new Set(['id', 'createdTime', 'Contratti'])
function pulisci(campi) {
  const out = {}
  for (const [k, v] of Object.entries(campi)) {
    if (SOLA_LETTURA.has(k)) continue
    out[k] = v === '' || v === undefined ? null : v
  }
  return out
}

// tabella: immobili | contratti | scadenze | aliquote | istat
export async function crea(tabella, campi) {
  const lista = Array.isArray(campi) ? campi : [campi]
  const records = lista.map((c) => ({ fields: pulisci(c) }))
  const json = await chiama({ azione: 'salva', metodo: 'crea', tabella, n: String(records.length), records: JSON.stringify(records) })
  return String(json.ids || '').split(',').filter(Boolean)
}

export async function aggiorna(tabella, id, campi) {
  const records = [{ id, fields: pulisci(campi) }]
  await chiama({ azione: 'salva', metodo: 'aggiorna', tabella, n: '1', records: JSON.stringify(records) })
  return id
}

export async function elimina(tabella, id) {
  await chiama({ azione: 'elimina', tabella, id })
}
