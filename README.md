# Studio CAI – Scadenzario (v1.0.0)

Webapp interna con tutte le scadenze dei condomini: CPI e verifiche periodiche, locazioni delle unità condominiali (abitative e commerciali) con rivalutazione ISTAT, IMU delle proprietà condominiali.

## Sezioni
- **Scadenze**: agenda unica dalla più vicina, con filtri (da gestire, scadute, in scadenza, 12 mesi, tutte, dati mancanti), per gruppo (CPI e verifiche, locazioni, IMU, altro) e per condominio. Le scadenze periodiche si chiudono con "Segna come fatta": la webapp registra la data e crea da sola la successiva (es. CPI +5 anni, ascensore +2 anni).
- **Locazioni**: contratti per condominio; per ciascuno fine dei periodi, termine di disdetta, anniversario ISTAT, imposta di registro annuale, registrazione RLI dei nuovi contratti. Calcolo degli adeguamenti ISTAT arretrati (indice FOI senza tabacchi del mese precedente l'anniversario, 75% o 100%), "Applica al canone" e lettera al conduttore pronta da stampare/salvare in PDF.
- **Immobili e IMU**: unità condominiali con dati catastali; IMU dell'anno in corso e del successivo (rendita × 1,05 × moltiplicatore × aliquota di Roma; −25% per canone concordato), acconto 16/06 e saldo 16/12.
- **Indici e aliquote**: tabella FOI (inserimento del nuovo mese), calcolo rapido ISTAT, aliquote IMU di Roma per anno.

Scadenze calcolate (non salvate su Airtable): locazioni, IMU, APE. Scadenze salvate (tabella Scadenze): CPI, ascensori, impianti di terra, impianti termici, sicurezza portieri, contratti fornitori, altro.

## Dati e collegamenti
- Airtable, base dedicata **SCADENZARIO** (appwqvvWn15lawCde): tabelle Immobili, Contratti (collegati all'unità), Scadenze, Aliquote IMU, Indici ISTAT. Dato mancante = "NON DISPONIBILE".
- Elenco condomini: tabella Chiavi del Registro Chiavi (sincronizzata ogni mese da Dropbox `/STUDIO CAI/scritti_cai`), sola lettura.
- Webhook Make: `src/config.js` → scenario "Studio CAI – WebApp Scadenzario" (ID 7808867, hook 3853601). Azioni: `elenco`, `salva` (crea/aggiorna), `elimina`.

## Consumo operazioni Make
- Lettura completa: ~13 operazioni. I dati restano in cache sul dispositivo per 12 ore; "Aggiorna dati" rilegge a richiesta.
- Ogni salvataggio: 2 operazioni (4 per "Segna come fatta" con creazione della successiva). Dopo un salvataggio la webapp non rilegge tutto.

## Pubblicazione su Vercel
Importa la cartella come nuovo progetto (framework Vite, build `npm run build`, output `dist`). Il logo è in `public/logo.jpg`.
Test dei calcoli: `npm test`.

## Limiti noti
- 100 record per tabella per lettura (oltre compare un avviso). Gli indici ISTAT si leggono dal più recente.
- IMU calcolata per anno intero e possesso al 100%.
- Gli avvisi automatici (email/Telegram) non sono ancora attivi: da progettare in base alle scadenze.
