import { useState } from 'react'
import type { Paaluokka } from '../data/types'
import { LukuGroup } from './LukuGroup'
import { formatEur } from '../utils/format'

interface Props {
  paaluokka: Paaluokka
  cuts: Record<string, number>
  onSetCut: (id: string, percentage: number) => void
  onRemoveCut: (id: string) => void
  defaultExpanded?: boolean
}

export function PaaluokkaSection({ paaluokka, cuts, onSetCut, onRemoveCut, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const plCutTotal = paaluokka.luvut.reduce((sum, luku) => {
    return sum + luku.momentit.reduce((s, m) => {
      const pct = cuts[m.id]
      return s + (pct ? m.maaraaraha * pct / 100 : 0)
    }, 0)
  }, 0)

  const hasCuts = plCutTotal > 0
  const momentCount = paaluokka.luvut.reduce((s, l) => s + l.momentit.length, 0)

  return (
    <div className={`rounded-xl border transition-colors ${
      hasCuts ? 'border-red-200 bg-white shadow-sm' : 'border-gray-200 bg-white'
    }`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-xl transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <svg className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 4l8 6-8 6V4z" />
          </svg>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              <span className="text-gray-400 font-mono text-sm mr-2">{paaluokka.numero}</span>
              {paaluokka.nimi}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {paaluokka.luvut.length} lukua, {momentCount} momenttia
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          {hasCuts && (
            <span className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
              -{formatEur(plCutTotal)}
            </span>
          )}
          <span className="text-sm text-gray-500 font-mono">{formatEur(paaluokka.total)}</span>
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-1">
          {paaluokka.luvut.map(luku => (
            <LukuGroup
              key={`${paaluokka.numero}.${luku.numero}`}
              luku={luku}
              paaluokkaNumero={paaluokka.numero}
              cuts={cuts}
              onSetCut={onSetCut}
              onRemoveCut={onRemoveCut}
            />
          ))}
        </div>
      )}
    </div>
  )
}
