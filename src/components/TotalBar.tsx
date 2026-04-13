import { formatEur, formatPercent } from '../utils/format'

interface Props {
  totalSavings: number
  totalBudget: number
  cutCount: number
}

export function TotalBar({ totalSavings, totalBudget, cutCount }: Props) {
  const pct = totalBudget > 0 ? (totalSavings / totalBudget) * 100 : 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
        Säästöt yhteensä
      </div>
      <div className={`text-3xl font-bold ${totalSavings > 0 ? 'text-red-600' : 'text-gray-300'}`}>
        {totalSavings > 0 ? '-' : ''}{formatEur(totalSavings)}
      </div>
      {totalSavings > 0 && (
        <div className="mt-2 space-y-1">
          <div className="text-sm text-gray-600">
            {formatPercent(pct)} valtion budjetista
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
          <div className="text-xs text-gray-400">
            {cutCount} {cutCount === 1 ? 'momentti' : 'momenttia'} valittu
          </div>
        </div>
      )}
      {totalSavings === 0 && (
        <p className="text-sm text-gray-400 mt-2">
          Valitse momentteja ja aseta leikkausprosentti
        </p>
      )}
    </div>
  )
}
