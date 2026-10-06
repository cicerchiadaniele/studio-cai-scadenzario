import { APP_VERSION, BUILD_DATE } from '../config.js'

// Cornice comune dello stile di casa Studio CAI (come Segnalazioni rev 2.0):
// sfondo carta con velature, intestazione con logo, piè di pagina con versione e data.

const SOTTOTITOLO = 'Scadenzario'

export function IconaScudo({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  )
}

export function IconaPalazzo({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4M10 10h4M10 14h4M10 18h4" />
    </svg>
  )
}

export function Sfondo() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
      <div className="absolute -right-40 top-1/2 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
    </div>
  )
}

export function Intestazione() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-neutral-200 sm:h-16 sm:w-16">
              <img src="/logo.jpg" alt="Logo Studio CAI" className="h-full w-full object-contain p-1" />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand ring-2 ring-white">
              <IconaScudo className="h-3 w-3 text-white" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate font-display text-xl font-semibold text-neutral-900 sm:text-2xl">Studio CAI</h1>
              <span className="hidden items-center rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white sm:inline-flex">
                v{APP_VERSION}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-neutral-600 sm:text-sm">{SOTTOTITOLO}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

export function PiePagina() {
  return (
    <footer className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-6 sm:px-6">
      <div className="rounded-2xl bg-white/70 p-4 ring-1 ring-neutral-200 backdrop-blur sm:p-5">
        <div className="flex flex-col items-center justify-between gap-3 text-sm sm:flex-row">
          <div className="flex items-center gap-2 text-center text-neutral-600 sm:text-left">
            <IconaPalazzo className="h-4 w-4 shrink-0 text-brand" />
            <span>© {new Date().getFullYear()} <span className="font-semibold text-neutral-800">Studio CAI</span> — Tutti i diritti riservati</span>
          </div>
          <div className="text-center text-xs tabular-nums text-neutral-500 sm:text-right">
            <span className="font-mono font-semibold text-neutral-700">v{APP_VERSION}</span>
            <span className="mx-2">·</span>
            Ultimo aggiornamento: <span className="font-semibold text-neutral-700">{BUILD_DATE}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
