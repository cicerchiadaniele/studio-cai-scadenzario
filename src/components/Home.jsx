import Schermata from './Schermata.jsx'
import { Avviso } from './ui.jsx'
import { fmtData, datiMancanti, euro, imuImmobile, arrot, oggi } from '../calcoli.js'
import { AREE, areaDi } from '../config.js'
import { RigaVoce, apriVoce } from './Agenda.jsx'

function Icona({ d, className = 'h-7 w-7' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d}
    </svg>
  )
}
const ICONE = {
  agenda: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></>,
  fuoco: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14 0-5.5 3-7 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
  chiave: <><circle cx="7.5" cy="15.5" r="5.5" /><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3" /></>,
  casa: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></>,
  grafico: <><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></>,
  ascensore: <><rect x="5" y="2" width="14" height="20" rx="2" /><path d="m9 8 3-3 3 3M9 16l3 3 3-3" /></>,
  fulmine: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />,
  goccia: <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />,
}

function Contatore({ valore, etichetta, tono, onClick }) {
  const cls = { rosso: 'text-red-700 bg-red-50 ring-red-200', ambra: 'text-amber-800 bg-amber-50 ring-amber-200', grigio: 'text-neutral-700 bg-neutral-50 ring-neutral-200' }[tono]
  return (
    <button onClick={onClick} className={`flex flex-col items-start rounded-2xl px-4 py-3 text-left ring-1 transition active:scale-[0.98] ${cls}`}>
      <span className="font-display text-3xl font-semibold leading-none">{valore}</span>
      <span className="mt-1 text-xs font-semibold">{etichetta}</span>
    </button>
  )
}

function Voce({ icona, titolo, sotto, onClick, primaria }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex min-h-[7rem] flex-col justify-between overflow-hidden rounded-3xl p-5 text-left transition active:scale-[0.98] ${
        primaria
          ? 'bg-gradient-to-br from-brand via-brand-dark to-brand-deep text-white shadow-[0_10px_24px_-10px_rgba(139,21,56,0.6)] sm:col-span-2'
          : 'bg-white ring-1 ring-brand/25 active:bg-brand/5'
      }`}
    >
      <span className={primaria ? 'text-white/90' : 'text-brand'}><Icona d={ICONE[icona]} /></span>
      <span>
        <span className={`block font-display text-2xl font-semibold ${primaria ? '' : 'text-brand'}`}>{titolo}</span>
        <span className={`mt-0.5 block text-sm ${primaria ? 'text-white/85' : 'text-neutral-600'}`}>{sotto}</span>
      </span>
    </button>
  )
}

const ORDINE = { scaduto: 0, imminente: 1, nd: 2, futuro: 3, fatto: 4 }

// Scheda del singolo condominio: tutte le aree, ciascuna con le sue scadenze
function SchedaCondominio({ dati, agenda, vai, condominio }) {
  const aperte = agenda.filter((v) => v.stato !== 'Fatto')
  const anno = oggi().getUTCFullYear()
  const contrattiAttivi = dati.contratti.filter((c) => c.Stato === 'Attivo')
  const daVerificare = dati.contratti.filter((c) => c.Stato === 'Da verificare').length
  const canoni = contrattiAttivi.reduce((t, c) => t + (Number(c['Canone attuale annuo']) || Number(c['Canone iniziale annuo']) || 0), 0)
  const imu = dati.immobili.reduce((t, im) => {
    const r = imuImmobile(im, dati.contratti.filter((c) => (c.Immobile || []).includes(im.id)), dati.aliquote, anno)
    return r.dovuta ? arrot(t + r.imposta) : t
  }, 0)
  const aree = AREE.map((a) => {
    const voci = aperte.filter((v) => areaDi(v.tipo) === a.k).sort((x, y) => (ORDINE[x.livello] ?? 9) - (ORDINE[y.livello] ?? 9) || (x.data || '9999').localeCompare(y.data || '9999'))
    return { ...a, voci }
  })
  const conDati = aree.filter((a) => a.voci.length || (a.k === 'locazioni' && dati.contratti.length) || (a.k === 'imu' && dati.immobili.length))
  const senza = aree.filter((a) => !conDati.includes(a) && a.k !== 'altro')

  return (
    <div className="mt-5 flex flex-col gap-4">
      {conDati.map((a) => {
        const brutte = a.voci.filter((v) => v.livello === 'scaduto' || v.livello === 'imminente').length
        return (
          <section key={a.k} className="overflow-hidden rounded-3xl bg-white ring-1 ring-neutral-200">
            <button onClick={() => vai('agenda', { gruppo: a.k, livello: 'tutte' })} className="flex w-full items-center gap-3 border-b border-neutral-100 bg-neutral-50/70 px-4 py-3 text-left">
              <span className="text-brand"><Icona d={ICONE[a.icona]} className="h-5 w-5" /></span>
              <span className="flex-1 font-display text-lg font-semibold">{a.nome}</span>
              {brutte > 0 && <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700 ring-1 ring-red-200">{brutte} da gestire</span>}
              <span className="text-xs font-semibold text-neutral-500">{a.voci.length}</span>
            </button>
            {a.k === 'locazioni' && (
              <button onClick={() => vai('locazioni')} className="flex w-full items-center justify-between gap-3 px-4 pt-3 text-left text-sm">
                <span>{contrattiAttivi.length === 1 ? '1 contratto in corso' : `${contrattiAttivi.length} contratti in corso`}{daVerificare ? ` · ${daVerificare} da verificare` : ''}</span>
                <span className="font-bold text-brand">{canoni ? `${euro(canoni)} / anno` : 'Apri'}</span>
              </button>
            )}
            {a.k === 'imu' && (
              <button onClick={() => vai('immobili')} className="flex w-full items-center justify-between gap-3 px-4 pt-3 text-left text-sm">
                <span>{dati.immobili.length} unità condominiali</span>
                <span className="font-bold text-brand">IMU {anno}: {euro(imu)}</span>
              </button>
            )}
            <ul className="flex flex-col gap-2 p-3">
              {a.voci.slice(0, 4).map((v) => <RigaVoce key={v.chiave} voce={v} senzaCondominio onApri={(x) => apriVoce(x, vai)} />)}
            </ul>
            {a.voci.length > 4 && (
              <button onClick={() => vai('agenda', { gruppo: a.k, livello: 'tutte' })} className="w-full pb-3 text-sm font-bold text-brand">Vedi tutte ({a.voci.length})</button>
            )}
          </section>
        )
      })}
      {senza.length > 0 && (
        <p className="rounded-2xl bg-neutral-50 px-4 py-3 text-sm text-neutral-600 ring-1 ring-neutral-200">
          Nessun dato per: <strong>{senza.map((a) => a.nome).join(', ')}</strong>.
          {senza.some((a) => a.k !== 'imu' && a.k !== 'locazioni') && <span className="block">Se il condominio ha questi impianti, aggiungi la scadenza:</span>}
          <span className="mt-2 flex flex-wrap gap-2 empty:hidden">
            {senza.filter((a) => a.tipi?.length && a.k !== 'imu').map((a) => (
              <button key={a.k} onClick={() => vai('scadenza', { tipo: a.tipi[0] })} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-brand ring-1 ring-brand/30">+ {a.nome}</button>
            ))}
          </span>
        </p>
      )}
      <button onClick={() => vai('scadenza', {})} className="rounded-2xl bg-white py-3.5 font-bold text-brand ring-1 ring-brand/30">+ Nuova scadenza per {condominio}</button>
    </div>
  )
}

export default function Home({ dati, agenda, vai, caricamento, onRicarica, condominio }) {
  const aperte = agenda.filter((v) => v.stato !== 'Fatto')
  const scadute = aperte.filter((v) => v.livello === 'scaduto').length
  const imminenti = aperte.filter((v) => v.livello === 'imminente').length
  const daCompletare = datiMancanti(dati, agenda).length
  const attivi = dati.contratti.filter((c) => c.Stato === 'Attivo').length
  const cpi = dati.scadenze.filter((s) => s.Tipo === 'CPI').length
  const conta = (k) => dati.scadenze.filter((s) => areaDi(s.Tipo) === k).length

  return (
    <Schermata>
      {caricamento === 'attesa' && <Avviso>Carico le scadenze…</Avviso>}
      {caricamento === 'errore' && (
        <Avviso tipo="errore">Dati non disponibili: controlla la connessione. <button onClick={onRicarica} className="ml-1 font-bold underline">Riprova</button></Avviso>
      )}
      {caricamento === 'pronto-errore' && <Avviso tipo="attenzione">Aggiornamento non riuscito: stai vedendo i dati salvati sul dispositivo.</Avviso>}
      {dati.incompleto && <Avviso tipo="attenzione">Una tabella supera i 100 record: alcuni dati potrebbero mancare. Avvisa Daniele.</Avviso>}

      {dati.letto && (
        <>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Contatore valore={scadute} etichetta="Scadute" tono="rosso" onClick={() => vai('agenda', { livello: 'scaduto' })} />
            <Contatore valore={imminenti} etichetta="In scadenza" tono="ambra" onClick={() => vai('agenda', { livello: 'imminente' })} />
            <Contatore valore={daCompletare} etichetta="Dati da completare" tono="grigio" onClick={() => vai('agenda', { livello: 'nd' })} />
          </div>

          {condominio ? (
            <SchedaCondominio dati={dati} agenda={agenda} vai={vai} condominio={condominio} />
          ) : (
            <>
              <p className="mt-4 text-sm text-neutral-600">Scegli un condominio qui sopra per vedere tutte le sue scadenze, area per area.</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Voce primaria icona="agenda" titolo="Scadenze" sotto="Tutte le scadenze, dalla più vicina" onClick={() => vai('agenda')} />
                <Voce icona="fuoco" titolo="CPI e antincendio" sotto={`${cpi} pratiche CPI`} onClick={() => vai('agenda', { gruppo: 'cpi', livello: 'tutte' })} />
                <Voce icona="ascensore" titolo="Ascensori" sotto={`${conta('ascensori')} verifiche biennali`} onClick={() => vai('agenda', { gruppo: 'ascensori', livello: 'tutte' })} />
                <Voce icona="fulmine" titolo="Messa a terra" sotto={`${conta('terra')} verifiche DPR 462/01`} onClick={() => vai('agenda', { gruppo: 'terra', livello: 'tutte' })} />
                <Voce icona="goccia" titolo="Acqua" sotto={`${conta('acqua')} analisi potabilità e legionella`} onClick={() => vai('agenda', { gruppo: 'acqua', livello: 'tutte' })} />
                <Voce icona="chiave" titolo="Locazioni" sotto={`${attivi} contratti attivi · ISTAT`} onClick={() => vai('locazioni')} />
                <Voce icona="casa" titolo="Immobili e IMU" sotto={`${dati.immobili.length} unità condominiali`} onClick={() => vai('immobili')} />
                <Voce icona="grafico" titolo="Indici e aliquote" sotto="FOI ISTAT · aliquote IMU Roma" onClick={() => vai('indici')} />
              </div>
            </>
          )}

          <div className="mt-5 flex items-center justify-between gap-3 text-xs text-neutral-500">
            <span>Dati letti il {fmtData(new Date(dati.letto))} alle {new Date(dati.letto).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
            <button onClick={onRicarica} disabled={caricamento === 'aggiorno'} className="font-bold text-brand underline underline-offset-2 disabled:opacity-50">
              {caricamento === 'aggiorno' ? 'Aggiorno…' : 'Aggiorna dati'}
            </button>
          </div>
        </>
      )}
    </Schermata>
  )
}
