import { useMemo, useState } from 'react'
import Schermata from './Schermata.jsx'
import { Modulo, Avviso, Sezione, Dato, BadgeLivello, TASTO_PRIMARIO, TASTO_SECONDARIO, TASTO_PICCOLO } from './ui.jsx'
import { schemaContratto } from '../schemi.js'
import { adeguamentiIstat, mappaIstat, scadenzeContratto, finePeriodi, livello, fmtData, euro, nomeMese, nd } from '../calcoli.js'
import { stampaLetteraIstat } from '../lettera.js'

function TabellaIstat({ adeg }) {
  return (
    <div className="overflow-x-auto rounded-2xl ring-1 ring-neutral-200">
      <table className="w-full min-w-[30rem] text-sm">
        <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
          <tr><th className="px-3 py-2">Dal</th><th className="px-3 py-2">Indice di</th><th className="px-3 py-2 text-right">Var. annua</th><th className="px-3 py-2 text-right">Aumento annuo</th><th className="px-3 py-2 text-right">Nuovo canone annuo</th></tr>
        </thead>
        <tbody>
          {adeg.righe.map((r) => (
            <tr key={r.decorrenza} className="border-t border-neutral-100">
              <td className="px-3 py-2">{fmtData(r.decorrenza)}</td>
              <td className="px-3 py-2">{nomeMese(r.meseRif)}</td>
              <td className="px-3 py-2 text-right">{r.varAnnua.toLocaleString('it-IT')}% × {adeg.perc * 100}%</td>
              <td className="px-3 py-2 text-right">{euro(r.aumento)}</td>
              <td className="px-3 py-2 text-right font-semibold">{euro(r.canoneDopo)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function SchedaContratto({ dati, id, salva, cancella, indietro, vai }) {
  const c = id ? dati.contratti.find((x) => x.id === id) : null
  const [modifica, setModifica] = useState(!id)
  const [esito, setEsito] = useState('')
  const [errore, setErrore] = useState('')
  const [invio, setInvio] = useState(false)
  const [conferma, setConferma] = useState(false)
  const istat = useMemo(() => mappaIstat(dati.istat), [dati.istat])
  if (id && !c) return <Schermata titolo="Contratto" onIndietro={indietro}><Avviso tipo="attenzione">Contratto non trovato.</Avviso></Schermata>

  const unita = c ? dati.immobili.find((i) => i.id === (c.Immobile || [])[0]) : null
  const schema = schemaContratto(dati.condomini, dati.immobili)
  const iniziali = c ? { ...c, ImmobileId: unita?.Denominazione || '' } : { Stato: 'Attivo', ISTAT: '75%', 'Imposta di registro': 'Annuale' }

  const onSalva = async (campi) => {
    const { ImmobileId, ...resto } = campi
    const im = dati.immobili.find((i) => i.Denominazione === ImmobileId)
    resto.Immobile = im ? [im.id] : []
    resto.Contratto = `${resto.Condominio} – ${resto.Conduttore}`
    const nuovo = await salva('contratti', c?.id || null, resto)
    if (!c) vai('contratto', { id: nuovo })
    setModifica(false)
    setEsito('Contratto salvato.')
  }

  const adeg = c ? adeguamentiIstat(c, istat) : null
  const scad = c ? scadenzeContratto(c, istat).filter((v) => !v.chiave.endsWith('arretrato')).sort((a, b) => a.data.localeCompare(b.data)) : []
  const canone = c ? Number(c['Canone attuale annuo']) || Number(c['Canone iniziale annuo']) : 0

  const applica = async () => {
    setInvio(true); setErrore('')
    try {
      const ultima = adeg.righe[adeg.righe.length - 1]
      await salva('contratti', c.id, { 'Canone attuale annuo': adeg.canoneNuovo, 'Ultimo adeguamento ISTAT': ultima.decorrenza })
      setEsito(`Canone aggiornato a ${euro(adeg.canoneNuovo)} annui dal ${fmtData(ultima.decorrenza)}.`)
    } catch (e) { setErrore(e.message) }
    setInvio(false)
  }

  if (!c) {
    return (
      <Schermata titolo="Nuovo contratto" onIndietro={indietro}>
        <Modulo schema={schema} iniziali={iniziali} onSalva={onSalva} etichettaSalva="Crea contratto" onAnnulla={indietro} />
      </Schermata>
    )
  }

  return (
    <Schermata titolo={c.Conduttore} sopra={`${c.Condominio} · ${c.Stato}`} sotto={unita ? unita.Denominazione : 'Unità non collegata'} onIndietro={indietro}>
      {esito && <div className="mb-4"><Avviso tipo="ok">{esito}</Avviso></div>}
      {errore && <div className="mb-4"><Avviso tipo="errore">{errore}</Avviso></div>}

      {!modifica && (
        <>
          <Sezione titolo="Contratto" azione={<button onClick={() => setModifica(true)} className={TASTO_PICCOLO}>Modifica</button>}>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
              <Dato etichetta="Tipo" valore={c['Tipo contratto']} />
              <Dato etichetta="Decorrenza" valore={c.Decorrenza && fmtData(c.Decorrenza)} />
              <Dato etichetta="Periodi" valore={finePeriodi(c, 3).map((x) => fmtData(x)).join(' · ')} />
              <Dato etichetta="Canone annuo" valore={canone ? euro(canone) : ''} evidenzia />
              <Dato etichetta="Canone mensile" valore={canone ? euro(canone / 12) : ''} />
              <Dato etichetta="ISTAT" valore={c.ISTAT} />
              <Dato etichetta="Ultimo adeguamento" valore={c['Ultimo adeguamento ISTAT'] ? fmtData(c['Ultimo adeguamento ISTAT']) : 'nessuno registrato'} />
              <Dato etichetta="Deposito" valore={c['Deposito cauzionale'] ? euro(Number(c['Deposito cauzionale'])) : ''} />
              <Dato etichetta="Preavviso disdetta" valore={c['Preavviso disdetta (mesi)'] ? `${c['Preavviso disdetta (mesi)']} mesi` : ''} />
              <Dato etichetta="Garante" valore={c.Garante} />
              <Dato etichetta="Imposta di registro" valore={c['Imposta di registro']} />
              <Dato etichetta="Registrazione" valore={[c['Data registrazione'] && fmtData(c['Data registrazione']), !nd(c['Estremi registrazione']) && c['Estremi registrazione']].filter(Boolean).join(' · ')} />
            </dl>
            {c.Note && <p className="mt-4 whitespace-pre-line rounded-2xl bg-neutral-50 px-4 py-3 text-sm text-neutral-700 ring-1 ring-neutral-200">{c.Note}</p>}
            {c.Fonte && !nd(c.Fonte) && <p className="mt-2 break-all text-xs text-neutral-500">Documento: {c.Fonte}</p>}
            {unita && <button onClick={() => vai('immobile', { id: unita.id })} className="mt-3 text-sm font-semibold text-brand underline underline-offset-2">Apri l’unità e il calcolo IMU</button>}
          </Sezione>

          {c.Stato !== 'Cessato' && (
            <Sezione titolo="Prossime scadenze">
              <ul className="flex flex-col gap-2">
                {scad.map((v) => (
                  <li key={v.chiave} className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-neutral-200">
                    <span className="w-24 shrink-0 font-semibold text-brand">{fmtData(v.data)}</span>
                    <span className="min-w-0 flex-1 text-sm">{v.titolo}</span>
                    <BadgeLivello livello={livello(v)} />
                  </li>
                ))}
              </ul>
            </Sezione>
          )}

          {adeg.perc > 0 && c.Stato !== 'Cessato' && (
            <Sezione titolo={`Rivalutazione ISTAT (${c.ISTAT})`}>
              {adeg.righe.length === 0 && !adeg.mancanti.length && <Avviso tipo="ok">Nessun adeguamento da applicare: il canone è aggiornato.</Avviso>}
              {adeg.righe.length > 0 && (
                <>
                  <p className="mb-3 text-sm text-neutral-700">
                    Dall’ultimo adeguamento {c['Ultimo adeguamento ISTAT'] ? `(${fmtData(c['Ultimo adeguamento ISTAT'])})` : 'registrato (nessuno: si parte dalla decorrenza)'} risultano {adeg.righe.length} annualità da adeguare.
                    Il canone passa da <strong>{euro(adeg.canoneBase)}</strong> a <strong>{euro(adeg.canoneNuovo)}</strong> annui ({euro(adeg.canoneNuovo / 12)} al mese).
                  </p>
                  <TabellaIstat adeg={adeg} />
                  <p className="mt-2 text-xs text-neutral-500">Variazione annua dell’indice FOI senza tabacchi del mese precedente ogni anniversario. Gli arretrati si possono chiedere solo se l’aggiornamento era stato richiesto: verifica prima di inviare.</p>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <button onClick={() => stampaLetteraIstat(c, unita, adeg)} className={TASTO_SECONDARIO}>Lettera al conduttore</button>
                    <button onClick={applica} disabled={invio} className={TASTO_PRIMARIO}>{invio ? 'Aggiorno…' : 'Applica al canone'}</button>
                  </div>
                </>
              )}
              {adeg.mancanti.length > 0 && (
                <div className="mt-3"><Avviso tipo="attenzione">Manca l’indice FOI di {nomeMese(adeg.mancanti[0])}: inseriscilo in “Indici e aliquote” appena pubblicato dall’ISTAT.</Avviso></div>
              )}
            </Sezione>
          )}
        </>
      )}

      {modifica && (
        <Sezione titolo="Modifica contratto">
          <Modulo key={JSON.stringify(c)} schema={schema} iniziali={iniziali} onSalva={onSalva} etichettaSalva="Salva modifiche" onAnnulla={() => setModifica(false)} />
        </Sezione>
      )}

      <div className="mt-6 border-t border-neutral-200 pt-4 text-center">
        {!conferma ? (
          <button onClick={() => setConferma(true)} className="text-sm font-semibold text-red-700 underline underline-offset-2">Elimina contratto</button>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm">Eliminarlo? Se è solo finito, meglio impostare lo stato “Cessato”.</span>
            <button className={TASTO_PICCOLO} onClick={async () => { await cancella('contratti', c.id); indietro() }}>Sì, elimina</button>
            <button className="text-sm font-semibold" onClick={() => setConferma(false)}>No</button>
          </div>
        )}
      </div>
    </Schermata>
  )
}

