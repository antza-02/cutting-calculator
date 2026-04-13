import type { Momentti, BudgetData } from '../data/types'
import { formatEur } from '../utils/format'

interface Props {
  cuts: Record<string, number>
  momenttiMap: Map<string, Momentti>
  data: BudgetData
  onRemoveCut: (id: string) => void
  onClearAll: () => void
}

export function CutSummary({ cuts, momenttiMap, data, onRemoveCut, onClearAll }: Props) {
  const entries = Object.entries(cuts)
    .map(([id, pct]) => {
      const m = momenttiMap.get(id)
      if (!m) return null
      return { id, pct, m, savings: m.maaraaraha * pct / 100 }
    })
    .filter(Boolean) as { id: string; pct: number; m: Momentti; savings: number }[]

  // Group by paaluokka
  const grouped = new Map<string, typeof entries>()
  for (const entry of entries) {
    const plNum = entry.id.split('.')[0]
    if (!grouped.has(plNum)) grouped.set(plNum, [])
    grouped.get(plNum)!.push(entry)
  }

  const copyToClipboard = () => {
    const lines = ['Budjettileikkaukset (talousarvio 2026)', '']
    let total = 0
    for (const [plNum, items] of grouped) {
      const pl = data.paaluokat.find(p => p.numero === plNum)
      lines.push(`${pl?.nimi || plNum}:`)
      for (const item of items) {
        lines.push(`  ${item.m.id} ${item.m.nimi}: -${item.pct} % = -${formatEur(item.savings)}`)
        total += item.savings
      }
      lines.push('')
    }
    lines.push(`Yhteensä: -${formatEur(total)}`)
    navigator.clipboard.writeText(lines.join('\n'))
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Valitut leikkaukset
        </h3>
        <p className="text-sm text-gray-400">
          Ei valittuja leikkauksia. Avaa pääluokka ja valitse momentteja vasemmalta.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Valitut leikkaukset ({entries.length})
        </h3>
        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="text-xs text-gray-500 hover:text-gray-700 border border-gray-300 rounded px-2 py-1 hover:bg-gray-50 transition-colors"
            title="Kopioi yhteenveto leikepöydälle"
          >
            Kopioi
          </button>
          <button
            onClick={onClearAll}
            className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded px-2 py-1 hover:bg-red-50 transition-colors"
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
              <div className="text-xs font-semibold text-gray-400 mb-1 truncate">
                {pl?.nimi || plNum}
              </div>
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-gray-700 truncate">{item.m.nimi}</div>
                    <div className="text-xs text-gray-400">{item.id} | -{item.pct} %</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-sm font-semibold text-red-600">-{formatEur(item.savings)}</span>
                    <button
                      onClick={() => onRemoveCut(item.id)}
                      className="text-gray-400 hover:text-red-500 p-0.5"
                      title="Poista"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
