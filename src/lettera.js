// Lettera di aggiornamento ISTAT al conduttore: si apre in una nuova finestra pronta da stampare o salvare in PDF.
// Carattere Calibri 12, firma "Studio CAI".
import { fmtData, euro, nomeMese, oggi } from './calcoli.js'

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

export function stampaLetteraIstat(c, unita, adeg) {
  const ultima = adeg.righe[adeg.righe.length - 1]
  const dettagli = adeg.righe
    .map((r) => `dal ${fmtData(r.decorrenza)}: variazione annua dell’indice FOI di ${nomeMese(r.meseRif)} pari al ${r.varAnnua.toLocaleString('it-IT')}%, applicata nella misura del ${adeg.perc * 100}%, con aumento annuo di ${euro(r.aumento)} e canone annuo di ${euro(r.canoneDopo)}`)
    .join('; ')
  const unitaTesto = unita ? `${unita.Denominazione}` : 'l’unità immobiliare condotta in locazione'
  const html = `<!doctype html><html lang="it"><head><meta charset="utf-8"><title>Aggiornamento ISTAT – ${esc(c.Conduttore)}</title>
<style>
  @page { size: A4; margin: 2.2cm 2.2cm 2.5cm; }
  body { font-family: Calibri, Carlito, 'Segoe UI', Arial, sans-serif; font-size: 12pt; line-height: 1.45; color: #111; }
  header { display: flex; align-items: center; gap: 14px; border-bottom: 2px solid #8B1538; padding-bottom: 10px; margin-bottom: 28px; }
  header img { height: 64px; }
  .dest { margin-left: 55%; margin-bottom: 26px; }
  .ogg { font-weight: bold; margin: 18px 0; }
  p { text-align: justify; margin: 0 0 10px; }
  .firma { margin-top: 36px; margin-left: 55%; font-weight: bold; }
  .nota { margin-top: 40px; font-size: 9pt; color: #666; }
  @media print { .noprint { display: none; } }
</style></head><body>
<header><img src="${location.origin}/logo.jpg" alt=""></header>
<p class="noprint" style="background:#fff7e6;padding:8px 12px;border:1px solid #f0c36d;border-radius:8px;font-size:10pt">Controlla dati e importi, poi stampa o salva in PDF (Ctrl+P / Condividi › Stampa).</p>
<div class="dest">Spett.le<br>${esc(c.Conduttore)}${unita ? `<br>${esc(unita.Denominazione)}` : ''}</div>
<p>Roma, ${fmtData(oggi())}</p>
<p class="ogg">Oggetto: Condominio ${esc(c.Condominio)} – aggiornamento ISTAT del canone di locazione</p>
<p>Con riferimento al contratto di locazione relativo a ${esc(unitaTesto)}, con decorrenza ${fmtData(c.Decorrenza)}, che prevede l’aggiornamento annuale del canone nella misura del ${adeg.perc * 100}% della variazione dell’indice ISTAT dei prezzi al consumo per le famiglie di operai e impiegati (FOI), si comunica l’adeguamento del canone come segue: ${esc(dettagli)}.</p>
<p>Per effetto di quanto sopra, a decorrere dal ${fmtData(ultima.decorrenza)} il canone annuo è pari a ${euro(adeg.canoneNuovo)}, corrispondente a ${euro(adeg.canoneNuovo / 12)} mensili, oltre agli oneri accessori previsti dal contratto.</p>
<p>Si resta a disposizione per qualsiasi chiarimento e si porgono cordiali saluti.</p>
<p class="firma">Studio CAI</p>
</body></html>`
  const w = window.open('', '_blank')
  if (!w) { alert('Il browser ha bloccato la nuova finestra: consenti i popup per questo sito.'); return }
  w.document.open(); w.document.write(html); w.document.close()
}
