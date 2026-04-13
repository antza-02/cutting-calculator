import { useState } from 'react'
import type { Momentti } from '../data/types'
import type { CutEntry } from '../hooks/useBudgetCuts'
import { formatEur } from '../utils/format'

interface Props {
  momentti: Momentti
  cutEntry: CutEntry | undefined
  onSetCut: (id: string, entry: Partial<CutEntry>) => void
  onRemoveCut: (id: string) => void
}

export function MomenttiRow({ momentti, cutEntry, onSetCut, onRemoveCut }: Props) {
  const [showCustom, setShowCustom] = useState(false)
  const [customInput, setCustomInput] = useState('')
  const [noteInput, setNoteInput] = useState('')

  const isActive = cutEntry !== undefined
  const pctSavings = isActive ? momentti.maaraaraha * cutEntry.percentage / 100 : 0
  const totalSavings = pctSavings + (cutEntry?.customAmount || 0)
  const isZeroBudget = momentti.maaraaraha === 0

  const handleAddCustom = () => {
    const amount = Number(customInput.replace(/\s/g, '').replace(',', '.'))
    if (!amount || amount <= 0) return
    onSetCut(momentti.id, {
      customAmount: amount,
      note: noteInput.trim() || undefined,
    })
    setShowCustom(false)
    setCustomInput('')
    setNoteInput('')
  }

  const handleRemoveCustom = () => {
    onSetCut(momentti.id, { customAmount: undefined, note: undefined })
  }

  return (
    <div className={`py-2.5 px-3 rounded-xl transition-all duration-200 ${
      isActive ? 'bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200/60 shadow-sm' : 'hover:bg-slate-50/50'
    } ${isZeroBudget ? 'opacity-40' : ''}`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isActive}
          disabled={isZeroBudget}
          onChange={(e) => {
            if (e.target.checked) onSetCut(momentti.id, { percentage: 10 })
            else onRemoveCut(momentti.id)
          }}
          className="mt-1.5 h-4 w-4 rounded border-slate-300 text-rose-500 focus:ring-rose-400/30 shrink-0 accent-rose-500"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-medium text-slate-800 truncate">
              <span className="text-indigo-400/60 font-mono text-xs mr-1.5">{momentti.id}</span>
              {momentti.nimi}
            </span>
            <span className="text-sm text-slate-500 whitespace-nowrap font-mono">
              {formatEur(momentti.maaraaraha)}
            </span>
          </div>

          {isActive && (
            <div className="mt-2 space-y-2">
              {/* Percentage slider */}
              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-400 font-medium">Leikkaus:</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={cutEntry.percentage}
                  onChange={(e) => onSetCut(momentti.id, { percentage: Number(e.target.value) })}
                  className="flex-1 h-1.5 accent-rose-500"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={cutEntry.percentage}
                    onChange={(e) => {
                      const val = Math.min(100, Math.max(0, Number(e.target.value)))
                      onSetCut(momentti.id, { percentage: val })
                    }}
                    className="w-14 text-sm text-right border border-slate-200 rounded-lg px-1.5 py-0.5 font-mono focus:ring-2 focus:ring-rose-400/30 focus:border-rose-300 outline-none"
                  />
                  <span className="text-xs text-slate-400">%</span>
                </div>
                {pctSavings > 0 && (
                  <span className="text-sm font-bold text-rose-600 whitespace-nowrap">
                    -{formatEur(pctSavings)}
                  </span>
                )}
              </div>

              {/* Custom amount display */}
              {cutEntry.customAmount && (
                <div className="flex items-start gap-2 bg-violet-50/80 rounded-lg px-3 py-2 border border-violet-100">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-violet-500 uppercase">Oma säästö:</span>
                      <span className="text-sm font-bold text-violet-600">{formatEur(cutEntry.customAmount)}</span>
                    </div>
                    {cutEntry.note && (
                      <p className="text-xs text-violet-500/80 mt-0.5 italic">"{cutEntry.note}"</p>
                    )}
                  </div>
                  <button
                    onClick={handleRemoveCustom}
                    className="text-violet-300 hover:text-rose-500 p-0.5 transition-colors shrink-0"
                    title="Poista oma säästö"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Add custom amount form */}
              {!cutEntry.customAmount && !showCustom && (
                <button
                  onClick={() => setShowCustom(true)}
                  className="text-xs text-violet-500 hover:text-violet-700 flex items-center gap-1 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Lisää oma säästösumma
                </button>
              )}

              {showCustom && (
                <div className="bg-violet-50/50 rounded-lg px-3 py-2.5 border border-violet-100 space-y-2">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Säästösumma (EUR)</label>
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Esim. 5000000"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 outline-none"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Muistiinpano (valinnainen)</label>
                    <input
                      type="text"
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="Esim. AI-analyysi löysi päällekkäisiä hankintoja"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddCustom}
                      disabled={!customInput}
                      className="px-3 py-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-medium rounded-lg hover:from-violet-600 hover:to-purple-700 disabled:opacity-40 transition-all"
                    >
                      Lisää
                    </button>
                    <button
                      onClick={() => { setShowCustom(false); setCustomInput(''); setNoteInput('') }}
                      className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Peruuta
                    </button>
                  </div>
                </div>
              )}

              {/* Total savings for this momentti */}
              {totalSavings > 0 && (cutEntry.customAmount || cutEntry.percentage > 0) && cutEntry.customAmount && cutEntry.percentage > 0 && (
                <div className="text-xs text-slate-500 font-medium pt-1 border-t border-rose-100">
                  Yhteensä tästä momentista: <span className="text-rose-600 font-bold">{formatEur(totalSavings)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
