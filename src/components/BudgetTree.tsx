import { useState, useMemo } from 'react'
import type { BudgetData } from '../data/types'
import { PaaluokkaSection } from './PaaluokkaSection'

interface Props {
  data: BudgetData
  cuts: Record<string, number>
  onSetCut: (id: string, percentage: number) => void
  onRemoveCut: (id: string) => void
}

export function BudgetTree({ data, cuts, onSetCut, onRemoveCut }: Props) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return data.paaluokat

    const q = search.toLowerCase()
    return data.paaluokat
      .map(pl => ({
        ...pl,
        luvut: pl.luvut
          .map(luku => ({
            ...luku,
            momentit: luku.momentit.filter(m =>
              m.nimi.toLowerCase().includes(q) ||
              m.id.includes(q) ||
              luku.nimi.toLowerCase().includes(q)
            ),
          }))
          .filter(luku => luku.momentit.length > 0),
      }))
      .filter(pl => pl.luvut.length > 0)
  }, [data, search])

  const isSearching = search.trim().length > 0

  return (
    <div className="space-y-3">
      <div className="sticky top-0 z-10 bg-gray-50 pb-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hae momenttia nimellä tai numerolla..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-8 text-sm">
          Ei hakutuloksia haulle "{search}"
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map(pl => (
            <PaaluokkaSection
              key={pl.numero}
              paaluokka={pl}
              cuts={cuts}
              onSetCut={onSetCut}
              onRemoveCut={onRemoveCut}
              defaultExpanded={isSearching}
            />
          ))}
        </div>
      )}
    </div>
  )
}
