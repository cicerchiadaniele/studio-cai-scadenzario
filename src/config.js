// Webhook Make: scenario "Studio CAI – WebApp Scadenzario" (ID 7808867, hook 3853601)
export const WEBHOOK_URL = 'https://hook.eu1.make.com/dq5r421i3uo1kt75r51m3vnq7lz0dlpj'
export const APP_VERSION = '1.2.0'
export const BUILD_DATE = '06/10/2026'
export const TIMEOUT_MS = 30000

// I dati restano in cache sul dispositivo per CACHE_ORE: ogni lettura da Airtable costa ~13 operazioni Make.
export const CACHE_ORE = 12

// Personale dello studio (devono coincidere con le opzioni del campo Responsabile su Airtable)
export const OPERATORI = ['Daniele', 'Marco', 'Paolo', 'Simone']

// Preavvisi predefiniti (giorni) per le scadenze calcolate dalla webapp
export const PREAVVISO = {
  disdetta: 60, // in aggiunta ai mesi di preavviso contrattuale
  istat: 30,
  registro: 30,
  imu: 30,
  ape: 60,
}

export const TIPI_SCADENZA = [
  'CPI',
  'Ascensore – verifica biennale',
  'Impianto di terra (DPR 462/01)',
  'Analisi acqua (potabilità/legionella)',
  'Impianto termico',
  'Sicurezza portieri',
  'Contratto fornitore',
  'APE',
  'Altro',
]

// Periodicità (mesi) e preavviso (giorni) proposti quando si sceglie il tipo
export const DEFAULT_TIPO = {
  CPI: { periodicita: 60, preavviso: 90 },
  'Ascensore – verifica biennale': { periodicita: 24, preavviso: 60 },
  'Impianto di terra (DPR 462/01)': { periodicita: 24, preavviso: 60 },
  'Analisi acqua (potabilità/legionella)': { periodicita: 12, preavviso: 30 },
  'Impianto termico': { periodicita: 12, preavviso: 30 },
  'Sicurezza portieri': { periodicita: 12, preavviso: 30 },
  'Contratto fornitore': { periodicita: 12, preavviso: 90 },
  APE: { periodicita: 120, preavviso: 60 },
  Altro: { periodicita: 0, preavviso: 30 },
}

export const TIPI_CONTRATTO = [
  'Abitativo 4+4',
  'Abitativo 3+2 concordato',
  'Abitativo transitorio',
  'Uso diverso 6+6',
  'Uso diverso 9+9',
  'Altro',
  'NON DISPONIBILE',
]
export const DURATE_CONTRATTO = {
  'Abitativo 4+4': [4, 4, 6],
  'Abitativo 3+2 concordato': [3, 2, 6],
  'Abitativo transitorio': [1, 0, 0],
  'Uso diverso 6+6': [6, 6, 12],
  'Uso diverso 9+9': [9, 9, 12],
}
export const TIPOLOGIE_IMMOBILE = ['Appartamento', 'Locale commerciale', 'Box / posto auto', 'Cantina / magazzino', 'Altro', 'NON DISPONIBILE']
export const STATI_IMMOBILE = ['Locato', 'Libero', 'In uso al portiere', 'NON DISPONIBILE']
export const STATI_CONTRATTO = ['Attivo', 'Da verificare', 'Cessato']
export const STATI_SCADENZA = ['Da fare', 'In corso', 'Fatto', 'NON DISPONIBILE']
export const ND = 'NON DISPONIBILE'

// Aree dello scadenzario: guidano i filtri dell'agenda e la scheda del singolo condominio
export const AREE = [
  { k: 'cpi', nome: 'CPI e antincendio', icona: 'fuoco', tipi: ['CPI'] },
  { k: 'ascensori', nome: 'Ascensori', icona: 'ascensore', tipi: ['Ascensore – verifica biennale'] },
  { k: 'terra', nome: 'Messa a terra', icona: 'fulmine', tipi: ['Impianto di terra (DPR 462/01)'] },
  { k: 'acqua', nome: 'Acqua', icona: 'goccia', tipi: ['Analisi acqua (potabilità/legionella)'] },
  { k: 'locazioni', nome: 'Locazioni', icona: 'chiave', prefisso: 'Locazione' },
  { k: 'imu', nome: 'IMU', icona: 'casa', tipi: ['IMU'] },
  { k: 'altro', nome: 'Altro', icona: 'agenda', tipi: ['Impianto termico', 'Sicurezza portieri', 'Contratto fornitore', 'APE', 'Altro'] },
]
export const areaDi = (tipo = '') => AREE.find((a) => (a.prefisso ? tipo.startsWith(a.prefisso) : a.tipi.includes(tipo)))?.k || 'altro'
