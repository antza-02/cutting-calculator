import { formatEur } from '../utils/format'

interface Props {
  totalBudget: number
}

export function Header({ totalBudget }: Props) {
  return (
    <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Budjettileikkurilaskuri
            </h1>
            <p className="text-sm text-white/70">
              Valtion talousarvio 2026 — {formatEur(totalBudget)}
            </p>
          </div>
        </div>
        <p className="text-sm text-white/60 max-w-xl">
          Selaa valtion budjettia, valitse momentteja ja laske leikkausten vaikutus. Voit myös lisätä omia säästökohteita.
        </p>
      </div>
    </header>
  )
}
