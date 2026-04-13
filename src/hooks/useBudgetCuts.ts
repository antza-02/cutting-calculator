import { useReducer, useEffect, useMemo, useCallback } from 'react'
import budgetData from '../data/budget-data.json'
import type { BudgetData, Momentti } from '../data/types'

const data = budgetData as BudgetData
const STORAGE_KEY = 'budget-cuts-v2'

export interface CutEntry {
  percentage: number
  customAmount?: number  // optional EUR override/addition
  note?: string          // user note explaining the saving
}

type CutState = Record<string, CutEntry> // momenttiId -> CutEntry

type Action =
  | { type: 'SET_CUT'; id: string; entry: Partial<CutEntry> }
  | { type: 'REMOVE_CUT'; id: string }
  | { type: 'CLEAR_ALL' }

function reducer(state: CutState, action: Action): CutState {
  switch (action.type) {
    case 'SET_CUT': {
      const existing = state[action.id] || { percentage: 0 }
      const merged = { ...existing, ...action.entry }
      // Remove if both percentage and customAmount are zero/empty
      if (merged.percentage <= 0 && !merged.customAmount) {
        const { [action.id]: _, ...rest } = state
        return rest
      }
      return { ...state, [action.id]: merged }
    }
    case 'REMOVE_CUT': {
      const { [action.id]: _, ...rest } = state
      return rest
    }
    case 'CLEAR_ALL':
      return {}
  }
}

function loadFromStorage(): CutState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return {}
}

function loadFromHash(): CutState | null {
  try {
    const hash = window.location.hash.slice(1)
    if (!hash.startsWith('cuts=')) return null
    const pairs = hash.slice(5).split(',')
    const cuts: CutState = {}
    for (const pair of pairs) {
      const [id, rest] = pair.split(':')
      if (!id || !rest) continue
      // Format: id:percentage or id:percentage:customAmount or id:percentage:customAmount:note(base64)
      const parts = rest.split('|')
      const pct = Math.min(100, Math.max(0, Number(parts[0]) || 0))
      const custom = parts[1] ? Number(parts[1]) : undefined
      let note: string | undefined
      if (parts[2]) {
        try { note = decodeURIComponent(parts[2]) } catch { /* ignore */ }
      }
      if (pct > 0 || custom) {
        cuts[id] = { percentage: pct, customAmount: custom, note }
      }
    }
    return Object.keys(cuts).length > 0 ? cuts : null
  } catch { return null }
}

// Build a lookup map for momentti by id
const momenttiMap = new Map<string, Momentti>()
for (const pl of data.paaluokat) {
  for (const luku of pl.luvut) {
    for (const m of luku.momentit) {
      momenttiMap.set(m.id, m)
    }
  }
}

export function getSavingsForEntry(id: string, entry: CutEntry): number {
  const m = momenttiMap.get(id)
  if (!m) return 0
  const pctSavings = m.maaraaraha * entry.percentage / 100
  return pctSavings + (entry.customAmount || 0)
}

export function useBudgetCuts() {
  const [cuts, dispatch] = useReducer(reducer, null, () => {
    return loadFromHash() ?? loadFromStorage()
  })

  // Persist to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cuts))
    }, 300)
    return () => clearTimeout(timer)
  }, [cuts])

  // Update URL hash
  useEffect(() => {
    const entries = Object.entries(cuts)
    if (entries.length === 0) {
      history.replaceState(null, '', window.location.pathname)
    } else {
      const hash = 'cuts=' + entries.map(([id, entry]) => {
        let val = `${id}:${entry.percentage}`
        if (entry.customAmount || entry.note) {
          val += `|${entry.customAmount || ''}`
        }
        if (entry.note) {
          val += `|${encodeURIComponent(entry.note)}`
        }
        return val
      }).join(',')
      history.replaceState(null, '', '#' + hash)
    }
  }, [cuts])

  const totalSavings = useMemo(() => {
    return Object.entries(cuts).reduce((sum, [id, entry]) => {
      return sum + getSavingsForEntry(id, entry)
    }, 0)
  }, [cuts])

  const setCut = useCallback((id: string, entry: Partial<CutEntry>) => {
    dispatch({ type: 'SET_CUT', id, entry })
  }, [])

  const removeCut = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_CUT', id })
  }, [])

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' })
  }, [])

  return {
    cuts,
    setCut,
    removeCut,
    clearAll,
    totalSavings,
    totalBudget: data.totalBudget,
    budgetData: data,
    momenttiMap,
  }
}
