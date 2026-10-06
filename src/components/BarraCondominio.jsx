import { IconaPalazzo } from './Cornice.jsx'

// Filtro principale dello Scadenzario: scelto il condominio, tutte le schermate mostrano solo i suoi dati.
export default function BarraCondominio({ condomini, valore, onCambia }) {
  const nomi = [...new Set((condomini || []).map((c) => c.Condominio))].sort((a, b) => a.localeCompare(b, 'it'))
  return (
    <div className="relative z-30 mx-auto w-full max-w-3xl px-4 pt-4">
      <div className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ring-1 transition sm:px-4 ${valore ? 'bg-brand text-white ring-brand shadow-[0_10px_24px_-12px_rgba(139,21,56,0.6)]' : 'bg-white ring-neutral-200'}`}>
        <IconaPalazzo className={`h-6 w-6 shrink-0 ${valore ? 'text-white' : 'text-brand'}`} />
        <label className="min-w-0 flex-1">
          <span className={`block text-[11px] font-bold uppercase tracking-wider ${valore ? 'text-white/80' : 'text-neutral-500'}`}>Condominio</span>
          <select
            value={valore}
            onChange={(e) => onCambia(e.target.value)}
            className={`-ml-1 w-full cursor-pointer truncate bg-transparent py-0.5 font-display text-lg font-semibold outline-none ${valore ? 'text-white' : 'text-neutral-900'}`}
            aria-label="Scegli il condominio"
          >
            <option value="" className="text-neutral-900">Tutti i condomini</option>
            {nomi.map((n) => <option key={n} value={n} className="text-neutral-900">{n}</option>)}
          </select>
        </label>
        {valore && (
          <button onClick={() => onCambia('')} className="shrink-0 rounded-xl bg-white/15 px-3 py-2 text-sm font-bold text-white ring-1 ring-white/30 transition active:scale-95">
            Tutti
          </button>
        )}
      </div>
    </div>
  )
}
