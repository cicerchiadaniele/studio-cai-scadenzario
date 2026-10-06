import { useState } from 'react'
import Schermata from './Schermata.jsx'
import { Modulo, Avviso, Sezione, Dato, TASTO_PICCOLO } from './ui.jsx'
import { schemaImmobile } from '../schemi.js'
import { imuImmobile, euro, oggi, fmtData, nd } from '../calcoli.js'
import { contrattiDi } from './Immobili.jsx'

function CalcoloImu({ calc }) {
  if (!calc.dovuta) return <Avviso tipo={calc.motivo === 'Esente' ? 'info' : 'attenzione'}>IMU {calc.anno}: {calc.motivo}.</Avviso>
  return (
    <div className="rounded-2xl bg-neutral-50 p-4 ring-1 ring-neutral-200">
      <p className="font-semibold">IMU {calc.anno}: <span className="text-brand">{euro(calc.imposta)}</span></p>
      <p className="mt-1 text-sm text-neutral-600">
        Base imponibile {euro(calc.base)} (rendita × 1,05 × {calc.molt}) × aliquota {calc.aliquota.toLocaleString('it-IT')}‰
        {calc.concordato ? ' × 75% (canone concordato)' : ''}
      </p>
      <p className="mt-1 text-sm text-neutral-600">Acconto 16/06: {euro(calc.acconto)} · Saldo 16/12: {euro(calc.saldo)}</p>
      {calc.aliquotaStimata && <p className="mt-1 text-xs font-semibold text-amber-800">Aliquota {calc.anno} non inserita: usata quella del {calc.annoAliquota}.</p>}
    </div>
  )
}

export default function SchedaImmobile({ dati, id, salva, cancella, indietro, vai, condominio }) {
  const im = id ? dati.immobili.find((x) => x.id === id) : null
  const [modifica, setModifica] = useState(!id)
  const [esito, setEsito] = useState('')
  const [conferma, setConferma] = useState(false)
  if (id && !im) return <Schermata titolo="Unità" onIndietro={indietro}><Avviso tipo="attenzione">Unità non trovata.</Avviso></Schermata>

  const schema = schemaImmobile(dati.condomini)
  const onSalva = async (campi) => {
    const nuovo = await salva('immobili', im?.id || null, campi)
    if (!im) vai('immobile', { id: nuovo })
    setModifica(false)
    setEsito('Unità salvata.')
  }
  if (!im) {
    return (
      <Schermata titolo="Nuova unità" onIndietro={indietro}>
        <Modulo schema={schema} iniziali={{ Stato: 'Libero', Tipologia: 'Appartamento', ...(condominio ? { Condominio: condominio, 'Dropbox ID': dati.condomini.find((c) => c.Condominio === condominio)?.['Dropbox ID'] || '' } : {}) }} onSalva={onSalva} etichettaSalva="Crea unità" onAnnulla={indietro} />
      </Schermata>
    )
  }
  const contratti = contrattiDi(dati, im.id)
  const anno = oggi().getUTCFullYear()

  return (
    <Schermata titolo={im.Denominazione} sopra={`${im.Condominio} · ${im.Stato || ''}`} onIndietro={indietro}>
      {esito && <div className="mb-4"><Avviso tipo="ok">{esito}</Avviso></div>}
      {!modifica && (
        <>
          <Sezione titolo="Dati catastali" azione={<button onClick={() => setModifica(true)} className={TASTO_PICCOLO}>Modifica</button>}>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
              <Dato etichetta="Tipologia" valore={im.Tipologia} />
              <Dato etichetta="Scala / interno / piano" valore={[im.Scala, im.Interno, im.Piano].filter((x) => !nd(x)).join(' / ')} />
              <Dato etichetta="Foglio / part. / sub" valore={[im.Foglio, im.Particella, im.Subalterno].filter((x) => !nd(x)).join(' / ')} />
              <Dato etichetta="Categoria" valore={im['Categoria catastale']} />
              <Dato etichetta="Rendita catastale" valore={im['Rendita catastale'] ? euro(Number(im['Rendita catastale'])) : ''} evidenzia />
              <Dato etichetta="Scadenza APE" valore={im['APE scadenza'] && fmtData(im['APE scadenza'])} />
            </dl>
            {im.Note && <p className="mt-4 whitespace-pre-line rounded-2xl bg-neutral-50 px-4 py-3 text-sm text-neutral-700 ring-1 ring-neutral-200">{im.Note}</p>}
            {im['Cartella documenti'] && <a href={im['Cartella documenti']} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-brand underline">Apri cartella documenti</a>}
          </Sezione>
          <Sezione titolo="IMU">
            <div className="flex flex-col gap-3">
              <CalcoloImu calc={imuImmobile(im, contratti, dati.aliquote, anno)} />
              <CalcoloImu calc={imuImmobile(im, contratti, dati.aliquote, anno + 1)} />
            </div>
            <p className="mt-2 text-xs text-neutral-500">Calcolo per l’intero anno e possesso al 100%. Le parti comuni accatastate autonomamente le dichiara e versa l’amministratore per conto dei condòmini.</p>
          </Sezione>
          <Sezione titolo="Contratti">
            {contratti.length === 0 && <p className="text-sm text-neutral-500">Nessun contratto collegato.</p>}
            <ul className="flex flex-col gap-2">
              {contratti.map((c) => (
                <li key={c.id}>
                  <button onClick={() => vai('contratto', { id: c.id })} className="flex w-full items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-left ring-1 ring-neutral-200 hover:ring-brand/40">
                    <span><span className="font-semibold">{c.Conduttore}</span><span className="block text-xs text-neutral-500">{c['Tipo contratto']} · dal {fmtData(c.Decorrenza)}</span></span>
                    <span className={`text-xs font-bold ${c.Stato === 'Attivo' ? 'text-green-700' : c.Stato === 'Cessato' ? 'text-neutral-500' : 'text-amber-800'}`}>{c.Stato}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Sezione>
        </>
      )}
      {modifica && (
        <Sezione titolo="Modifica unità">
          <Modulo key={JSON.stringify(im)} schema={schema} iniziali={{ ...im }} onSalva={onSalva} etichettaSalva="Salva modifiche" onAnnulla={() => setModifica(false)} />
        </Sezione>
      )}
      <div className="mt-6 border-t border-neutral-200 pt-4 text-center">
        {!conferma ? (
          <button onClick={() => setConferma(true)} className="text-sm font-semibold text-red-700 underline underline-offset-2">Elimina unità</button>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm">Eliminarla definitivamente?</span>
            <button className={TASTO_PICCOLO} onClick={async () => { await cancella('immobili', im.id); indietro() }}>Sì, elimina</button>
            <button className="text-sm font-semibold" onClick={() => setConferma(false)}>No</button>
          </div>
        )}
      </div>
    </Schermata>
  )
}
