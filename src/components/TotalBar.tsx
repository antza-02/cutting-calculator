import { formatEur, formatPercent } from '../utils/format'

interface Props {
  totalSavings: number
  totalBudget: number
  cutCount: number
}

export function TotalBar({ totalSavings, totalBudget, cutCount }: Props) {
  const pct = totalBudget > 0 ? (totalSavings / totalBudget) * 100 : 0
  const hasAnything = totalSavings > 0

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
        Säästöt yhteensä
      </div>
      <div className={`text-3xl font-extrabold tracking-tight ${hasAnything ? 'bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent' : 'text-slate-200'}`}>
        {hasAnything ? '-' : ''}{formatEur(totalSavings)}
      </div>
      {hasAnything && (
        <div className="mt-3 space-y-2">
          <div className="text-sm text-slate-600">
            {formatPercent(pct)} valtion budjetista
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-rose-500 to-pink-400 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
          <div className="text-xs text-slate-400">
            {cutCount} {cutCount === 1 ? 'momentti' : 'momenttia'} valittu
          </div>
        </div>
      )}
      {!hasAnything && (
        <p className="text-sm text-slate-400 mt-2">
          Valitse momentteja ja lisää tarvittaessa oma säästö sekä muistiinpano momentin sisällä.
        </p>
      )}
      <p className="text-xs text-slate-400 mt-3">
        Haluatko jakaa säästösi? Kopioi selaimen osoite riviltä ja lähetä se ystäville.
      </p>
    </div>
  )
}
