import { useState } from 'react'
import type { Luku } from '../data/types'
import { MomenttiRow } from './MomenttiRow'
import { formatEur } from '../utils/format'

interface Props {
  luku: Luku
  paaluokkaNumero: string
  cuts: Record<string, number>
  onSetCut: (id: string, percentage: number) => void
  onRemoveCut: (id: string) => void
}

export function LukuGroup({ luku, paaluokkaNumero, cuts, onSetCut, onRemoveCut }: Props) {
  const [expanded, setExpanded] = useState(false)

  const lukuCutTotal = luku.momentit.reduce((sum, m) => {
    const pct = cuts[m.id]
    return sum + (pct ? m.maaraaraha * pct / 100 : 0)
  }, 0)

  const hasCuts = lukuCutTotal > 0

  return (
    <div className="border-l-2 border-gray-200 ml-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <svg className={`w-3 h-3 shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 4l8 6-8 6V4z" />
          </svg>
          <span className="text-sm font-medium text-gray-700 truncate">
            <span className="text-gray-400 font-mono text-xs mr-1">{paaluokkaNumero}.{luku.numero}</span>
            {luku.nimi}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-2">
          {hasCuts && (
            <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
              -{formatEur(lukuCutTotal)}
            </span>
          )}
          <span className="text-xs text-gray-400 font-mono">{formatEur(luku.total)}</span>
        </div>
      </button>
      {expanded && (
        <div className="pl-4 pb-2 space-y-1">
          {luku.momentit.map(m => (
            <MomenttiRow
              key={m.id}
              momentti={m}
              cutPercent={cuts[m.id]}
              onSetCut={onSetCut}
              onRemoveCut={onRemoveCut}
            />
          ))}
        </div>
      )}
    </div>
  )
}
