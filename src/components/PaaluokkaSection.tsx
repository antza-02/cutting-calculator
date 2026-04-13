import { useState } from 'react'
import type { Paaluokka } from '../data/types'
import type { CutEntry } from '../hooks/useBudgetCuts'
import { getSavingsForEntry } from '../hooks/useBudgetCuts'
import { LukuGroup } from './LukuGroup'
import { formatEur } from '../utils/format'

interface Props {
  paaluokka: Paaluokka
  cuts: Record<string, CutEntry>
  onSetCut: (id: string, entry: Partial<CutEntry>) => void
  onRemoveCut: (id: string) => void
  defaultExpanded?: boolean
}

export function PaaluokkaSection({ paaluokka, cuts, onSetCut, onRemoveCut, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const plCutTotal = paaluokka.luvut.reduce((sum, luku) => {
    return sum + luku.momentit.reduce((s, m) => {
      const entry = cuts[m.id]
      return s + (entry ? getSavingsForEntry(m.id, entry) : 0)
    }, 0)
  }, 0)

  const hasCuts = plCutTotal > 0
  const momentCount = paaluokka.luvut.reduce((s, l) => s + l.momentit.length, 0)

  return (
    <div className={`rounded-2xl border transition-all duration-200 ${
      hasCuts ? 'border-rose-200/80 bg-white shadow-md shadow-rose-100/50' : 'border-slate-200/60 bg-white/80 backdrop-blur-sm hover:shadow-sm'
    }`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left rounded-2xl transition-colors hover:bg-slate-50/50"
      >
        <div className="flex items-center gap-3 min-w-0">
          <svg className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 4l8 6-8 6V4z" />
          </svg>
          <div className="min-w-0">
            <div className="font-semibold text-slate-800 truncate">
              <span className="text-indigo-400/70 font-mono text-sm mr-2">{paaluokka.numero}</span>
              {paaluokka.nimi}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {paaluokka.luvut.length} lukua, {momentCount} momenttia
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          {hasCuts && (
            <span className="text-sm font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
              -{formatEur(plCutTotal)}
            </span>
          )}
          <span className="text-sm text-slate-400 font-mono">{formatEur(paaluokka.total)}</span>
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
