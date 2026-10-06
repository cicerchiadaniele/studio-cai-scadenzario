import { useState } from 'react'
import Schermata from './Schermata.jsx'
import { Modulo, Avviso, Sezione, CAMPO, TASTO_PRIMARIO, TASTO_PICCOLO, BadgeLivello } from './ui.jsx'
import { schemaScadenza } from '../schemi.js'
import { DEFAULT_TIPO } from '../config.js'
import { addMesi, d, fmtData, iso, oggi, livello } from '../calcoli.js'

// Chiusura di una scadenza: la segna "Fatto" e, se periodica, crea la successiva a partire dalla data dell'adempimento.
function ChiudiScadenza({ s, salva, onFatto }) {
  const [data, setData] = useState(iso(oggi()))
  const [stato, setStato] = useState({ invio: false, errore: '', esito: '' })
  const mesi = Number(s['Periodicità (mesi)']) || 0
  const prossima = mesi && d(data) ? iso(addMesi(d(data), mesi)) : ''
  const conferma = async () => {
    setStato({ invio: true, errore: '', esito: '' })
    try {
      await salva('scadenze', s.id, { Stato: 'Fatto', 'Fatto il': data })
      if (prossima) {
        const { id, Stato, 'Fatto il': _f, 'Data scadenza': _d, ...resto } = s
        await salva('scadenze', null, { ...resto, 'Data scadenza': prossima, Stato: 'Da fare', Note: `${s.Note ? `${s.Note}\n` : ''}Precedente adempimento: ${fmtData(data)}.` })
      }
      setStato({ invio: false, errore: '', esito: prossima ? `Fatta. Creata la prossima scadenza al ${fmtData(prossima)}.` : 'Fatta.' })
      onFatto?.()
    } catch (e) {
      setStato({ invio: false, errore: e.message, esito: '' })
    }
  }
  if (stato.esito) return <Avviso tipo="ok">{stato.esito}</Avviso>
  return (
    <div className="rounded-2xl bg-green-50/60 p-4 ring-1 ring-green-200">
      <p className="font-semibold text-green-900">Adempimento eseguito?</p>
      <label className="mt-2 block text-sm text-neutral-700">
        Data dell’adempimento (attestazione, verifica, invio…)
        <input type="date" value={data} onChange={(e) => setData(e.target.value)} className={`${CAMPO} mt-1`} />
      </label>
      {prossima && <p className="mt-2 text-sm text-neutral-700">Prossima scadenza: <strong>{fmtData(prossima)}</strong> (ogni {mesi} mesi)</p>}
      {stato.errore && <div className="mt-2"><Avviso tipo="errore">{stato.errore}</Avviso></div>}
      <button onClick={conferma} disabled={stato.invio || !data} className={`${TASTO_PRIMARIO} mt-3`}>
        {stato.invio ? 'Registro…' : 'Segna come fatta'}
      </button>
    </div>
  )
}

export default function SchedaScadenza({ dati, id, salva, cancella, indietro, condominio, tipo }) {
  const s = id ? dati.scadenze.find((x) => x.id === id) : null
  const [esito, setEsito] = useState('')
  const [conferma, setConferma] = useState(false)
  if (id && !s) return <Schermata titolo="Scadenza" onIndietro={indietro}><Avviso tipo="attenzione">Scadenza non trovata (forse eliminata).</Avviso></Schermata>

  const schema = schemaScadenza(dati.condomini)
  const dbx = dati.condomini.find((c) => c.Condominio === condominio)?.['Dropbox ID']
  const pred = tipo ? DEFAULT_TIPO[tipo] : null
  const iniziali = s ? { ...s } : {
    Stato: 'Da fare', 'Preavviso (giorni)': pred?.preavviso ?? 30,
    ...(tipo ? { Tipo: tipo, 'Periodicità (mesi)': pred?.periodicita } : {}),
    ...(condominio ? { Condominio: condominio, 'Dropbox ID': dbx || '' } : {}),
  }
  const onSalva = async (campi) => {
    await salva('scadenze', s?.id || null, campi)
    if (!s) indietro()
    else setEsito('Modifiche salvate.')
  }
  const lv = s ? livello({ data: s['Data scadenza'], preavviso: Number(s['Preavviso (giorni)']) || 30, stato: s.Stato }) : null

  return (
    <Schermata titolo={s ? s.Scadenza : 'Nuova scadenza'} sopra={s ? `${s.Condominio} · ${s.Tipo || ''}` : ''} onIndietro={indietro}>
      {s && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <BadgeLivello livello={lv} />
          <span className="text-sm text-neutral-600">{s['Data scadenza'] ? `Scadenza ${fmtData(s['Data scadenza'])}` : 'Data da inserire'}</span>
        </div>
      )}
      {s && s.Stato !== 'Fatto' && s['Data scadenza'] && <div className="mb-6"><ChiudiScadenza s={s} salva={salva} /></div>}
      <Sezione titolo={s ? 'Dati della scadenza' : 'Dati'}>
        {esito && <div className="mb-3"><Avviso tipo="ok">{esito}</Avviso></div>}
        <Modulo key={s ? JSON.stringify(s) : 'nuova'} schema={schema} iniziali={iniziali} onSalva={onSalva} etichettaSalva={s ? 'Salva modifiche' : 'Crea scadenza'} onAnnulla={s ? null : indietro} />
      </Sezione>
      {s && (
        <div className="mt-6 border-t border-neutral-200 pt-4 text-center">
          {!conferma ? (
            <button onClick={() => setConferma(true)} className="text-sm font-semibold text-red-700 underline underline-offset-2">Elimina scadenza</button>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <span className="text-sm">Eliminarla definitivamente?</span>
              <button className={TASTO_PICCOLO} onClick={async () => { await cancella('scadenze', s.id); indietro() }}>Sì, elimina</button>
              <button className="text-sm font-semibold" onClick={() => setConferma(false)}>No</button>
            </div>
          )}
        </div>
      )}
    </Schermata>
  )
}
