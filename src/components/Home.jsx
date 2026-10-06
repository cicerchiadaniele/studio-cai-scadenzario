import Schermata from './Schermata.jsx'
import { Avviso } from './ui.jsx'
import { fmtData, datiMancanti } from '../calcoli.js'

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

export default function Home({ dati, agenda, vai, caricamento, onRicarica }) {
  const aperte = agenda.filter((v) => v.stato !== 'Fatto')
  const scadute = aperte.filter((v) => v.livello === 'scaduto').length
  const imminenti = aperte.filter((v) => v.livello === 'imminente').length
  const daCompletare = datiMancanti(dati, agenda).length
  const attivi = dati.contratti.filter((c) => c.Stato === 'Attivo').length
  const cpi = dati.scadenze.filter((s) => s.Tipo === 'CPI').length

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

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Voce primaria icona="agenda" titolo="Scadenze" sotto="Tutte le scadenze, dalla più vicina" onClick={() => vai('agenda')} />
            <Voce icona="fuoco" titolo="CPI e verifiche" sotto={`${cpi} CPI · ascensori · impianti di terra`} onClick={() => vai('agenda', { gruppo: 'impianti', livello: 'tutte' })} />
            <Voce icona="chiave" titolo="Locazioni" sotto={`${attivi} contratti attivi · ISTAT`} onClick={() => vai('locazioni')} />
            <Voce icona="casa" titolo="Immobili e IMU" sotto={`${dati.immobili.length} unità condominiali`} onClick={() => vai('immobili')} />
            <Voce icona="grafico" titolo="Indici e aliquote" sotto="FOI ISTAT · aliquote IMU Roma" onClick={() => vai('indici')} />
          </div>

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
