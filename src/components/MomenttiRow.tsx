import type { Momentti } from '../data/types'
import { formatEur } from '../utils/format'

interface Props {
  momentti: Momentti
  cutPercent: number | undefined
  onSetCut: (id: string, percentage: number) => void
  onRemoveCut: (id: string) => void
}

export function MomenttiRow({ momentti, cutPercent, onSetCut, onRemoveCut }: Props) {
  const isActive = cutPercent !== undefined && cutPercent > 0
  const savings = isActive ? momentti.maaraaraha * cutPercent / 100 : 0
  const isZeroBudget = momentti.maaraaraha === 0

  return (
    <div className={`flex items-start gap-3 py-2 px-3 rounded-lg transition-colors ${
      isActive ? 'bg-red-50 border border-red-200' : 'hover:bg-gray-50'
    } ${isZeroBudget ? 'opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={isActive}
        disabled={isZeroBudget}
        onChange={(e) => {
          if (e.target.checked) onSetCut(momentti.id, 10)
          else onRemoveCut(momentti.id)
        }}
        className="mt-1.5 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium text-gray-900 truncate">
            <span className="text-gray-400 font-mono text-xs mr-1.5">{momentti.id}</span>
            {momentti.nimi}
          </span>
          <span className="text-sm text-gray-600 whitespace-nowrap font-mono">
            {formatEur(momentti.maaraaraha)}
          </span>
        </div>
        {isActive && (
          <div className="flex items-center gap-3 mt-1.5">
            <label className="text-xs text-gray-500">Leikkaus:</label>
            <input
              type="range"
              min={1}
              max={100}
              value={cutPercent}
              onChange={(e) => onSetCut(momentti.id, Number(e.target.value))}
              className="flex-1 h-1.5 accent-red-600"
            />
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={1}
                max={100}
                value={cutPercent}
                onChange={(e) => {
                  const val = Math.min(100, Math.max(0, Number(e.target.value)))
                  if (val > 0) onSetCut(momentti.id, val)
                  else onRemoveCut(momentti.id)
                }}
                className="w-14 text-sm text-right border border-gray-300 rounded px-1.5 py-0.5 font-mono"
              />
              <span className="text-xs text-gray-500">%</span>
            </div>
            <span className="text-sm font-semibold text-red-700 whitespace-nowrap">
              -{formatEur(savings)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
