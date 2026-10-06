import { motion } from 'framer-motion'

// v1.1.0 – Ogni schermata è una card dello stile di casa; se ha un titolo, la testata è bordeaux
// con il tasto Indietro a sinistra.
export default function Schermata({ children, className = '', titolo, sopra, sotto, onIndietro }) {
  return (
    <motion.main
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-lift ring-1 ring-neutral-200/80"
    >
      {titolo && (
        <div className="bg-gradient-to-br from-brand via-brand-dark to-brand-deep px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3">
            {onIndietro && (
              <button
                onClick={onIndietro}
                aria-label="Indietro"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25 transition active:bg-white/25"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
            )}
            <div className="min-w-0 flex-1">
              {sopra && <p className="truncate text-xs font-semibold text-white/80">{sopra}</p>}
              <h2 className="font-display text-xl font-semibold leading-tight text-white sm:text-2xl">{titolo}</h2>
              {sotto && <p className="mt-0.5 text-sm text-white/85">{sotto}</p>}
            </div>
          </div>
        </div>
      )}
      <div className={`flex flex-col p-4 sm:p-6 ${className}`}>{children}</div>
    </motion.main>
  )
}

const STILI = {
  ok: 'bg-green-50 text-green-700',
  avviso: 'bg-amber-50 text-amber-800',
  ritardo: 'bg-red-50 text-red-700',
  mai: 'bg-neutral-100 text-neutral-500',
}

export function Badge({ livello, children }) {
  return (
    <span className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${STILI[livello]}`}>
      {children}
    </span>
  )
}

// Classi comuni dei tasti
export const TASTO_PRIMARIO =
  'w-full rounded-2xl bg-gradient-to-br from-brand to-brand-dark py-5 text-lg font-bold text-white shadow-[0_10px_24px_-10px_rgba(139,21,56,0.6)] transition active:scale-[0.98] disabled:from-neutral-200 disabled:to-neutral-200 disabled:text-neutral-400 disabled:shadow-none'
export const TASTO_SECONDARIO =
  'w-full rounded-2xl bg-white py-4 font-bold text-brand ring-1 ring-brand/30 transition active:scale-[0.98]'
export const CAMPO =
  'w-full rounded-2xl border border-neutral-300 bg-white px-4 py-4 text-lg outline-none transition placeholder:text-neutral-400 hover:border-neutral-400 focus:border-brand focus:ring-2 focus:ring-brand/20'
