import type { Momentti, BudgetData } from '../data/types'
import type { CutEntry } from '../hooks/useBudgetCuts'
import { getSavingsForEntry } from '../hooks/useBudgetCuts'
import { formatEur } from '../utils/format'

interface Props {
  cuts: Record<string, CutEntry>
  momenttiMap: Map<string, Momentti>
  data: BudgetData
  onRemoveCut: (id: string) => void
  onClearAll: () => void
}

export function CutSummary({ cuts, momenttiMap, data, onRemoveCut, onClearAll }: Props) {
  const entries = Object.entries(cuts)
    .map(([id, entry]) => {
      const m = momenttiMap.get(id)
      if (!m) return null
      return { id, entry, m, savings: getSavingsForEntry(id, entry) }
    })
    .filter(Boolean) as { id: string; entry: CutEntry; m: Momentti; savings: number }[]

  // Group by paaluokka
  const grouped = new Map<string, typeof entries>()
  for (const e of entries) {
    const plNum = e.id.split('.')[0]
    if (!grouped.has(plNum)) grouped.set(plNum, [])
    grouped.get(plNum)!.push(e)
  }

  const copyToClipboard = () => {
    const lines = ['Budjettileikkaukset (talousarvio 2026)', '']
    let total = 0
    for (const [plNum, items] of grouped) {
      const pl = data.paaluokat.find(p => p.numero === plNum)
      lines.push(`${pl?.nimi || plNum}:`)
      for (const item of items) {
        const parts: string[] = []
        if (item.entry.percentage > 0) {
          parts.push(`-${item.entry.percentage} %`)
        }
        if (item.entry.customAmount) {
          parts.push(`oma säästö ${formatEur(item.entry.customAmount)}`)
        }
        lines.push(`  ${item.m.id} ${item.m.nimi}: ${parts.join(' + ')} = -${formatEur(item.savings)}`)
        if (item.entry.note) {
          lines.push(`    Muistiinpano: ${item.entry.note}`)
        }
        total += item.savings
      }
      lines.push('')
    }
    lines.push(`Yhteensä: -${formatEur(total)}`)
    navigator.clipboard.writeText(lines.join('\n'))
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm p-5">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Valitut leikkaukset
        </h3>
        <p className="text-sm text-slate-400">
          Ei valittuja leikkauksia. Avaa pääluokka ja valitse momentteja vasemmalta.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Valitut leikkaukset ({entries.length})
        </h3>
        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="text-xs text-slate-500 hover:text-indigo-600 border border-slate-200 rounded-lg px-2.5 py-1 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
            title="Kopioi yhteenveto leikepöydälle"
          >
            Kopioi
          </button>
          <button
            onClick={onClearAll}
            className="text-xs text-rose-500 hover:text-rose-700 border border-rose-200 rounded-lg px-2.5 py-1 hover:bg-rose-50 transition-colors"
          >
            Tyhjennä
          </button>
        </div>
      </div>
      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
        {Array.from(grouped.entries()).map(([plNum, items]) => {
          const pl = data.paaluokat.find(p => p.numero === plNum)
          return (
            <div key={plNum}>
              <div className="text-xs font-semibold text-slate-400 mb-1.5 truncate">
                {pl?.nimi || plNum}
              </div>
              {items.map(item => (
                <div key={item.id} className="py-2 border-b border-slate-100/80 last:border-0">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-slate-700 truncate">{item.m.nimi}</div>
                      <div className="text-xs text-slate-400 flex flex-wrap gap-x-2">
                        <span>{item.id}</span>
                        {item.entry.percentage > 0 && <span>-{item.entry.percentage} %</span>}
                        {item.entry.customAmount && (
                          <span className="text-violet-500">+oma {formatEur(item.entry.customAmount)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-sm font-bold text-rose-600">-{formatEur(item.savings)}</span>
                      <button
                        onClick={() => onRemoveCut(item.id)}
                        className="text-slate-300 hover:text-rose-500 p-0.5 transition-colors"
                        title="Poista"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {item.entry.note && (
                    <div className="mt-1 text-xs text-violet-500/80 italic bg-violet-50/50 rounded px-2 py-1">
                      "{item.entry.note}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
