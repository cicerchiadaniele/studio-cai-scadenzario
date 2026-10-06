// Calcoli dello Scadenzario: date, scadenze delle locazioni, ISTAT, IMU, agenda unificata.
// Le date viaggiano come stringhe 'AAAA-MM-GG' e si elaborano in UTC per evitare sorprese col fuso orario.
import { PREAVVISO, ND } from './config.js'

// ─── Date ───────────────────────────────────────────────────
export function d(s) {
  if (!s || typeof s !== 'string') return null
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return null
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
}
export const iso = (x) => (x ? x.toISOString().slice(0, 10) : '')
export function oggi(rif) {
  const n = rif || new Date()
  return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()))
}
export function addGiorni(x, n) { const r = new Date(x); r.setUTCDate(r.getUTCDate() + n); return r }
export function addMesi(x, n) {
  const y = x.getUTCFullYear(), m = x.getUTCMonth() + n, g = x.getUTCDate()
  const ultimo = new Date(Date.UTC(y, m + 1, 0)).getUTCDate()
  return new Date(Date.UTC(y, m, Math.min(g, ultimo)))
}
export const addAnni = (x, n) => addMesi(x, 12 * n)
export const giorniTra = (a, b) => Math.round((b - a) / 86400000)
export const meseChiave = (x) => iso(x).slice(0, 7)
export const fmtData = (s) => {
  const x = typeof s === 'string' ? d(s) : s
  return x ? `${String(x.getUTCDate()).padStart(2, '0')}/${String(x.getUTCMonth() + 1).padStart(2, '0')}/${x.getUTCFullYear()}` : '—'
}
const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']
export const nomeMese = (chiave) => {
  const [y, m] = chiave.split('-')
  return `${MESI[+m - 1]} ${y}`
}
export const euro = (n) =>
  typeof n === 'number' && isFinite(n)
    ? n.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 })
    : '—'
export const arrot = (n) => Math.round(n * 100) / 100
export const nd = (v) => v === undefined || v === null || v === '' || v === ND

// ─── Locazioni ──────────────────────────────────────────────
// Periodi contrattuali: fine del primo periodo = decorrenza + durata - 1 giorno, poi rinnovi di "durata rinnovo".
export function finePeriodi(c, quanti = 6) {
  const dec = d(c.Decorrenza)
  const d1 = Number(c['Durata primo periodo (anni)']) || 0
  const d2 = Number(c['Durata rinnovo (anni)']) || 0
  if (!dec || !d1) return []
  const out = [addGiorni(addAnni(dec, d1), -1)]
  if (d2 > 0) for (let i = 1; i < quanti; i++) out.push(addGiorni(addAnni(dec, d1 + d2 * i), -1))
  return out
}

// Prossima fine di periodo da oggi in avanti (o l'ultima, se il contratto non si rinnova ed è già finita).
export function prossimaFine(c, rif = oggi()) {
  const f = finePeriodi(c, 40)
  if (!f.length) return null
  const k = f.findIndex((x) => x >= rif)
  if (k === -1) return { data: f[f.length - 1], indice: f.length - 1 }
  return { data: f[k], indice: k }
}

// Prossimo anniversario della decorrenza (annualità che inizia) dal giorno rif incluso.
export function prossimoAnniversario(c, rif = oggi()) {
  const dec = d(c.Decorrenza)
  if (!dec) return null
  let n = Math.max(1, rif.getUTCFullYear() - dec.getUTCFullYear() - 1)
  let a = addAnni(dec, n)
  while (a < rif) { n++; a = addAnni(dec, n) }
  return a
}

export const percIstat = (c) => (c.ISTAT === '75%' ? 0.75 : c.ISTAT === '100%' ? 1 : 0)

// Indici: mappa 'AAAA-MM' -> { indice, base, varAnnua }
export function mappaIstat(righe) {
  const m = new Map()
  for (const r of righe || []) {
    const f = r.fields || r
    if (f.Mese) m.set(f.Mese, { indice: f['Indice FOI'], base: f.Base, varAnnua: f['Variazione annua %'] })
  }
  return m
}

// Adeguamenti ISTAT annuali dovuti dall'ultimo applicato (o dalla decorrenza) fino a oggi.
// Per ogni anniversario si usa la variazione annua dell'indice FOI del mese precedente l'anniversario.
// Il canone si concatena anno per anno: canone × (1 + variazione × percentuale).
export function adeguamentiIstat(c, istat, rif = oggi()) {
  const perc = percIstat(c)
  const dec = d(c.Decorrenza)
  const canoneBase = Number(c['Canone attuale annuo']) || Number(c['Canone iniziale annuo']) || 0
  if (!perc || !dec || !canoneBase) return { righe: [], perc, canoneBase, canoneNuovo: canoneBase, mancanti: [] }
  const ultimo = d(c['Ultimo adeguamento ISTAT'])
  // Il canone attuale vale dall'ultimo adeguamento; se non c'è, dalla decorrenza.
  let n = 1
  while (addAnni(dec, n) <= (ultimo || dec)) n++
  const righe = []
  const mancanti = []
  let canone = canoneBase
  for (; addAnni(dec, n) <= rif; n++) {
    const anniv = addAnni(dec, n)
    const meseRif = meseChiave(addMesi(anniv, -1))
    const dato = istat.get(meseRif)
    if (!dato || typeof dato.varAnnua !== 'number') { mancanti.push(meseRif); break }
    const aumento = arrot(canone * (dato.varAnnua / 100) * perc)
    righe.push({ decorrenza: iso(anniv), meseRif, varAnnua: dato.varAnnua, canonePrima: canone, aumento, canoneDopo: arrot(canone + aumento) })
    canone = arrot(canone + aumento)
  }
  return { righe, perc, canoneBase, canoneNuovo: canone, mancanti }
}

// Scadenze calcolate di un contratto attivo.
export function scadenzeContratto(c, istat, rif = oggi()) {
  if (c.Stato === 'Cessato') return []
  const out = []
  const base = { condominio: c.Condominio, fonte: 'contratto', ref: c.id, sotto: c.Conduttore }
  const pf = prossimaFine(c, rif)
  if (pf) {
    const etichetta = pf.indice === 0 ? 'Fine primo periodo' : `Fine rinnovo n. ${pf.indice}`
    out.push({ ...base, chiave: `${c.id}-fine`, tipo: 'Locazione – scadenza', data: iso(pf.data), titolo: `${etichetta} – ${c['Tipo contratto'] || 'contratto'}`, preavviso: 30 })
    const mesi = Number(c['Preavviso disdetta (mesi)']) || 0
    if (mesi) {
      const lim = addMesi(pf.data, -mesi)
      out.push({ ...base, chiave: `${c.id}-disdetta`, tipo: 'Locazione – disdetta', data: iso(lim), titolo: `Termine invio disdetta (${mesi} mesi prima della scadenza del ${fmtData(pf.data)})`, preavviso: PREAVVISO.disdetta })
    }
  }
  const anniv = prossimoAnniversario(c, rif)
  if (anniv && percIstat(c)) {
    const mr = meseChiave(addMesi(anniv, -1))
    out.push({ ...base, chiave: `${c.id}-istat`, tipo: 'Locazione – ISTAT', data: iso(anniv), titolo: `Aggiornamento ISTAT ${c.ISTAT} (indice di ${nomeMese(mr)})`, preavviso: PREAVVISO.istat })
  }
  if (anniv && c['Imposta di registro'] === 'Annuale') {
    out.push({ ...base, chiave: `${c.id}-registro`, tipo: 'Locazione – imposta di registro', data: iso(addGiorni(anniv, 30)), titolo: 'Imposta di registro annualità successiva (F24 Elide, entro 30 giorni)', preavviso: PREAVVISO.registro })
  }
  const dec = d(c.Decorrenza)
  if (dec && nd(c['Data registrazione']) && giorniTra(dec, rif) <= 60) {
    out.push({ ...base, chiave: `${c.id}-rli`, tipo: 'Locazione – registrazione', data: iso(addGiorni(dec, 30)), titolo: 'Registrazione del contratto (RLI entro 30 giorni)', preavviso: 30 })
  }
  // Interventi ISTAT arretrati non applicati
  const adeg = adeguamentiIstat(c, istat, rif)
  if (adeg.righe.length) {
    // Se l'ultimo adeguamento non è mai stato registrato non sappiamo se gli aumenti sono già stati applicati:
    // la voce va tra i dati da completare invece che tra le scadute.
    const ignoto = !c['Ultimo adeguamento ISTAT'] && adeg.righe.length > 1
    out.push({
      ...base, chiave: `${c.id}-istat-arretrato`, tipo: 'Locazione – ISTAT', data: adeg.righe[0].decorrenza, preavviso: 0,
      forzaLivello: ignoto ? 'nd' : undefined,
      titolo: ignoto
        ? `Ultimo adeguamento ISTAT non registrato: verificare (fino a ${adeg.righe.length} annualità, canone da ${euro(adeg.canoneBase)} a ${euro(adeg.canoneNuovo)})`
        : `${adeg.righe.length === 1 ? 'Adeguamento ISTAT da applicare' : `${adeg.righe.length} adeguamenti ISTAT da applicare`}: canone da ${euro(adeg.canoneBase)} a ${euro(adeg.canoneNuovo)} annui`,
    })
  }
  return out
}

// ─── IMU ────────────────────────────────────────────────────
export function categoria(cat) {
  const m = String(cat || '').toUpperCase().replace(/\s/g, '').match(/([A-F])\/?(\d{1,2})/)
  return m ? { gruppo: m[1], classe: +m[2], testo: `${m[1]}/${+m[2]}` } : null
}
// Moltiplicatori art. 1 c. 745 L. 160/2019
export function moltiplicatore(cat) {
  const c = categoria(cat)
  if (!c) return null
  if (c.gruppo === 'A') return c.classe === 10 ? 80 : 160
  if (c.gruppo === 'B') return 140
  if (c.gruppo === 'C') {
    if (c.classe === 1) return 55
    if ([3, 4, 5].includes(c.classe)) return 140
    return 160 // C/2, C/6, C/7
  }
  if (c.gruppo === 'D') return c.classe === 5 ? 80 : 65
  return null
}

export function aliquotaPer(aliquote, anno, gruppoD) {
  const tip = gruppoD ? 'Gruppo D' : 'Altri fabbricati'
  const righe = (aliquote || []).map((r) => r.fields || r).filter((f) => f.Tipologia === tip && f['Aliquota (per mille)'])
  const esatta = righe.find((f) => Number(f.Anno) === anno)
  if (esatta) return { aliquota: esatta['Aliquota (per mille)'], anno, stimata: false }
  const prec = righe.filter((f) => Number(f.Anno) < anno).sort((a, b) => b.Anno - a.Anno)[0]
  if (prec) return { aliquota: prec['Aliquota (per mille)'], anno: prec.Anno, stimata: true }
  return null
}

// IMU annua di un immobile. contratti = contratti collegati all'immobile.
export function imuImmobile(im, contratti, aliquote, anno) {
  const esito = { anno, dovuta: false, motivo: '', imposta: 0, acconto: 0, saldo: 0 }
  if (im['Esente IMU']) return { ...esito, motivo: 'Esente' }
  const molt = moltiplicatore(im['Categoria catastale'])
  const rendita = Number(im['Rendita catastale'])
  if (!rendita) return { ...esito, motivo: 'Rendita catastale mancante' }
  if (!molt) return { ...esito, motivo: 'Categoria catastale mancante o non valida' }
  const cat = categoria(im['Categoria catastale'])
  const al = aliquotaPer(aliquote, anno, cat.gruppo === 'D')
  if (!al) return { ...esito, motivo: `Aliquota ${anno} mancante` }
  const concordato = (contratti || []).some((c) => c.Stato !== 'Cessato' && c['Tipo contratto'] === 'Abitativo 3+2 concordato')
  const base = arrot(rendita * 1.05 * molt)
  let imposta = (base * al.aliquota) / 1000
  if (concordato) imposta *= 0.75
  imposta = arrot(imposta)
  const acconto = arrot(imposta / 2)
  return { ...esito, dovuta: true, base, molt, aliquota: al.aliquota, aliquotaStimata: al.stimata, annoAliquota: al.anno, concordato, imposta, acconto, saldo: arrot(imposta - acconto) }
}

// Scadenze IMU per condominio (16/06 acconto, 16/12 saldo) dell'anno in corso e del successivo.
export function scadenzeImu(immobili, contrattiPerImmobile, aliquote, rif = oggi()) {
  const perCond = new Map()
  for (const im of immobili) {
    const cs = contrattiPerImmobile.get(im.id) || []
    for (const anno of [rif.getUTCFullYear(), rif.getUTCFullYear() + 1]) {
      const calc = imuImmobile(im, cs, aliquote, anno)
      const k = `${im.Condominio}|${anno}`
      const v = perCond.get(k) || { condominio: im.Condominio, anno, totale: 0, unita: 0, incomplete: 0 }
      if (calc.dovuta) { v.totale += calc.imposta; v.unita++ } else if (calc.motivo !== 'Esente') v.incomplete++
      perCond.set(k, v)
    }
  }
  const out = []
  for (const v of perCond.values()) {
    const nota = v.incomplete ? ` · ${v.incomplete} unità senza dati` : ''
    for (const [mese, nome, quota] of [[6, 'Acconto', 0.5], [12, 'Saldo', 0.5]]) {
      const data = `${v.anno}-${String(mese).padStart(2, '0')}-16`
      out.push({
        chiave: `imu-${v.condominio}-${data}`, condominio: v.condominio, fonte: 'imu', tipo: 'IMU',
        data, titolo: `${nome} IMU ${v.anno}${v.unita ? ` – ${euro(arrot(v.totale * quota))}` : ''}`,
        sotto: `${v.unita} unità calcolate${nota}`, preavviso: PREAVVISO.imu,
      })
    }
  }
  return out
}

// ─── Agenda unificata ───────────────────────────────────────
export function livello(voce, rif = oggi()) {
  if (voce.forzaLivello) return voce.forzaLivello
  if (voce.stato === 'Fatto') return 'fatto'
  const x = d(voce.data)
  if (!x) return 'nd'
  const g = giorniTra(rif, x)
  if (g < 0) return 'scaduto'
  if (g <= (voce.preavviso ?? 30)) return 'imminente'
  return 'futuro'
}

export function costruisciAgenda({ scadenze, contratti, immobili, aliquote, istat }, rif = oggi()) {
  const voci = []
  for (const s of scadenze) {
    voci.push({
      chiave: s.id, fonte: 'scadenza', ref: s.id, condominio: s.Condominio, tipo: s.Tipo || 'Altro',
      data: s['Data scadenza'] || '', titolo: s.Scadenza || '(senza descrizione)', sotto: s.Riferimento && !nd(s.Riferimento) ? s.Riferimento : '',
      preavviso: Number(s['Preavviso (giorni)']) || 30, stato: s.Stato || 'Da fare', responsabile: s.Responsabile || '',
    })
  }
  const mIstat = mappaIstat(istat)
  for (const c of contratti) voci.push(...scadenzeContratto(c, mIstat, rif))
  const cpi = new Map()
  for (const c of contratti) for (const imId of c.Immobile || []) { const a = cpi.get(imId) || []; a.push(c); cpi.set(imId, a) }
  voci.push(...scadenzeImu(immobili, cpi, aliquote, rif))
  for (const im of immobili) {
    if (im['APE scadenza']) voci.push({ chiave: `${im.id}-ape`, fonte: 'immobile', ref: im.id, condominio: im.Condominio, tipo: 'APE', data: im['APE scadenza'], titolo: `Scadenza APE – ${im.Denominazione}`, preavviso: PREAVVISO.ape })
  }
  for (const v of voci) v.livello = livello(v, rif)
  return voci.sort((a, b) => (a.data || '9999').localeCompare(b.data || '9999'))
}

export const normalizza = (s) =>
  String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')

// Elenco dei dati da completare: voci senza data o da verificare, contratti "Da verificare", unità senza rendita
export function datiMancanti(dati, agenda) {
  const out = agenda.filter((v) => v.livello === 'nd').map((v) => ({ ...v, sotto: v.sotto || (v.fonte === 'scadenza' ? 'Manca la data di scadenza' : v.sotto) }))
  for (const c of dati.contratti) if (c.Stato === 'Da verificare') out.push({ chiave: `${c.id}-verifica`, condominio: c.Condominio, tipo: 'Locazione', titolo: `Contratto ${c.Conduttore}`, sotto: 'Contratto da verificare (in corso o cessato?)', fonte: 'contratto', ref: c.id, livello: 'nd' })
  for (const i of dati.immobili) if (!i['Rendita catastale'] && !i['Esente IMU']) out.push({ chiave: `${i.id}-rendita`, condominio: i.Condominio, tipo: 'Immobile', titolo: i.Denominazione, sotto: 'Manca la rendita catastale (serve la visura)', fonte: 'immobile', ref: i.id, livello: 'nd' })
  return out.sort((a, b) => a.condominio.localeCompare(b.condominio, 'it'))
}
