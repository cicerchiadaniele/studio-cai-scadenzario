/** @type {import('tailwindcss').Config} */
// v1.1.0 – Stile di casa Studio CAI (come Segnalazioni rev 2.0 / Deleghe v1.1): bordeaux unico accento.
// I nomi storici (crema, carta, inchiostro, verde, errore) restano ma puntano ai nuovi valori; l'ottone è eliminato.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      opacity: { 8: '0.08', 12: '0.12' },
      colors: {
        brand: { DEFAULT: 'rgb(139 21 56 / <alpha-value>)', dark: 'rgb(108 16 44 / <alpha-value>)', deep: 'rgb(86 13 35 / <alpha-value>)' },
        bordeaux: { DEFAULT: 'rgb(139 21 56 / <alpha-value>)', dark: 'rgb(108 16 44 / <alpha-value>)', deep: 'rgb(86 13 35 / <alpha-value>)', soft: '#F6EAEE' },
        crema: '#fbf8f4',
        carta: '#ffffff',
        inchiostro: '#171717',
        verde: { DEFAULT: '#15803d', soft: '#f0fdf4' },
        errore: { DEFAULT: '#b91c1c', soft: '#fef2f2' },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Manrope"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
