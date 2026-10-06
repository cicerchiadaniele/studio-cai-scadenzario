// Campi dei moduli di inserimento/modifica. I nomi "k" coincidono con i campi Airtable della base SCADENZARIO.
import {
  OPERATORI, TIPI_SCADENZA, DEFAULT_TIPO, TIPI_CONTRATTO, DURATE_CONTRATTO,
  TIPOLOGIE_IMMOBILE, STATI_IMMOBILE, STATI_CONTRATTO, STATI_SCADENZA,
} from './config.js'

// Il condominio si sceglie dall'elenco (Registro Chiavi, sincronizzato da Dropbox) e porta con sé il Dropbox ID.
function campoCondominio(condomini) {
  const nomi = condomini.map((c) => c.Condominio)
  return {
    k: 'Condominio', label: 'Condominio', tipo: 'select', opzioni: nomi, obbligatorio: true,
    onCambia: (v) => ({ 'Dropbox ID': condomini.find((c) => c.Condominio === v)?.['Dropbox ID'] || '' }),
  }
}
const dbx = { k: 'Dropbox ID', label: 'Dropbox ID', tipo: 'nascosto' }

export const schemaScadenza = (condomini) => [
  campoCondominio(condomini),
  {
    k: 'Tipo', label: 'Tipo', tipo: 'select', opzioni: TIPI_SCADENZA, obbligatorio: true,
    onCambia: (v, s) => (DEFAULT_TIPO[v] && !s['Periodicità (mesi)'] ? { 'Periodicità (mesi)': DEFAULT_TIPO[v].periodicita, 'Preavviso (giorni)': DEFAULT_TIPO[v].preavviso } : {}),
  },
  { k: 'Scadenza', label: 'Descrizione', tipo: 'text', obbligatorio: true, largo: true, placeholder: 'Es. Rinnovo CPI – autorimessa (att. 75)' },
  { k: 'Data scadenza', label: 'Data scadenza', tipo: 'date' },
  { k: 'Stato', label: 'Stato', tipo: 'select', opzioni: STATI_SCADENZA },
  { k: 'Periodicità (mesi)', label: 'Si ripete ogni (mesi)', tipo: 'number', aiuto: '0 o vuoto = non si ripete' },
  { k: 'Preavviso (giorni)', label: 'Preavviso (giorni)', tipo: 'number' },
  { k: 'Responsabile', label: 'Responsabile', tipo: 'select', opzioni: OPERATORI },
  { k: 'Fatto il', label: 'Fatto il', tipo: 'date' },
  { k: 'Riferimento', label: 'Riferimento', tipo: 'text', largo: true, placeholder: 'Pratica VVF, matricola impianto, ente, contratto…' },
  { k: 'Note', label: 'Note', tipo: 'textarea', largo: true },
]

export const schemaContratto = (condomini, immobili) => [
  campoCondominio(condomini),
  { k: 'Conduttore', label: 'Conduttore', tipo: 'text', obbligatorio: true },
  {
    k: 'ImmobileId', label: 'Unità locata', tipo: 'select',
    opzioni: immobili.map((i) => i.Denominazione), aiuto: 'Se manca, aggiungila prima in Immobili e IMU',
  },
  { k: 'Garante', label: 'Garante', tipo: 'text' },
  { k: 'Recapiti conduttore', label: 'Recapiti conduttore', tipo: 'text', largo: true },
  {
    k: 'Tipo contratto', label: 'Tipo contratto', tipo: 'select', opzioni: TIPI_CONTRATTO,
    onCambia: (v) => (DURATE_CONTRATTO[v] ? { 'Durata primo periodo (anni)': DURATE_CONTRATTO[v][0], 'Durata rinnovo (anni)': DURATE_CONTRATTO[v][1], 'Preavviso disdetta (mesi)': DURATE_CONTRATTO[v][2] } : {}),
  },
  { k: 'Stato', label: 'Stato', tipo: 'select', opzioni: STATI_CONTRATTO },
  { k: 'Decorrenza', label: 'Decorrenza', tipo: 'date' },
  { k: 'Durata primo periodo (anni)', label: 'Durata primo periodo (anni)', tipo: 'number' },
  { k: 'Durata rinnovo (anni)', label: 'Durata rinnovo (anni)', tipo: 'number' },
  { k: 'Preavviso disdetta (mesi)', label: 'Preavviso disdetta locatore (mesi)', tipo: 'number' },
  { k: 'Canone iniziale annuo', label: 'Canone iniziale annuo (€)', tipo: 'euro' },
  { k: 'Canone attuale annuo', label: 'Canone attuale annuo (€)', tipo: 'euro' },
  { k: 'ISTAT', label: 'Aggiornamento ISTAT', tipo: 'select', opzioni: ['75%', '100%', 'Non previsto', 'NON DISPONIBILE'] },
  { k: 'Ultimo adeguamento ISTAT', label: 'Ultimo adeguamento ISTAT (decorrenza)', tipo: 'date' },
  { k: 'Deposito cauzionale', label: 'Deposito cauzionale (€)', tipo: 'euro' },
  { k: 'Imposta di registro', label: 'Imposta di registro', tipo: 'select', opzioni: ['Annuale', 'Unica soluzione', 'NON DISPONIBILE'] },
  { k: 'Data registrazione', label: 'Data registrazione', tipo: 'date' },
  { k: 'Estremi registrazione', label: 'Estremi registrazione', tipo: 'text' },
  { k: 'Responsabile', label: 'Responsabile', tipo: 'select', opzioni: OPERATORI },
  { k: 'Fonte', label: 'Documento (percorso Dropbox)', tipo: 'text', largo: true },
  { k: 'Note', label: 'Note', tipo: 'textarea', largo: true },
]

export const schemaImmobile = (condomini) => [
  campoCondominio(condomini),
  { k: 'Denominazione', label: 'Denominazione', tipo: 'text', obbligatorio: true, largo: true, placeholder: 'Es. Appartamento ex portiere int. C1a' },
  { k: 'Tipologia', label: 'Tipologia', tipo: 'select', opzioni: TIPOLOGIE_IMMOBILE },
  { k: 'Stato', label: 'Stato', tipo: 'select', opzioni: STATI_IMMOBILE },
  { k: 'Scala', label: 'Scala', tipo: 'text' },
  { k: 'Interno', label: 'Interno', tipo: 'text' },
  { k: 'Piano', label: 'Piano', tipo: 'text' },
  { k: 'Foglio', label: 'Foglio', tipo: 'text' },
  { k: 'Particella', label: 'Particella', tipo: 'text' },
  { k: 'Subalterno', label: 'Subalterno', tipo: 'text' },
  { k: 'Categoria catastale', label: 'Categoria catastale', tipo: 'text', lista: ['A/2', 'A/3', 'A/4', 'A/10', 'C/1', 'C/2', 'C/6', 'D/8'] },
  { k: 'Rendita catastale', label: 'Rendita catastale (€)', tipo: 'euro' },
  { k: 'APE scadenza', label: 'Scadenza APE', tipo: 'date' },
  { k: 'Esente IMU', label: 'Esente IMU', tipo: 'check' },
  { k: 'Cartella documenti', label: 'Link cartella documenti', tipo: 'text', largo: true },
  { k: 'Note', label: 'Note', tipo: 'textarea', largo: true },
]

export const schemaIstat = [
  { k: 'Mese', label: 'Mese (AAAA-MM)', tipo: 'text', obbligatorio: true, placeholder: '2026-09' },
  { k: 'Indice FOI', label: 'Indice FOI senza tabacchi', tipo: 'number', obbligatorio: true },
  { k: 'Base', label: 'Base', tipo: 'select', opzioni: ['2025=100', '2015=100'] },
  { k: 'Variazione annua %', label: 'Variazione annua % (pubblicata)', tipo: 'number', obbligatorio: true },
]

export const schemaAliquota = [
  { k: 'Anno', label: 'Anno', tipo: 'number', obbligatorio: true },
  { k: 'Tipologia', label: 'Tipologia', tipo: 'select', opzioni: ['Altri fabbricati', 'Gruppo D'], obbligatorio: true },
  { k: 'Aliquota (per mille)', label: 'Aliquota (‰)', tipo: 'number', obbligatorio: true },
  { k: 'Fonte', label: 'Fonte (delibera)', tipo: 'text', largo: true },
]

export { dbx }
