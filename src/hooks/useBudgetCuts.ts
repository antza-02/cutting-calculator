import { useReducer, useEffect, useMemo, useCallback } from 'react'
import budgetData from '../data/budget-data.json'
import type { BudgetData, Momentti } from '../data/types'

const data = budgetData as BudgetData
const STORAGE_KEY = 'budget-cuts'

type Cuts = Record<string, number> // momenttiId -> percentage

type Action =
  | { type: 'SET_CUT'; id: string; percentage: number }
  | { type: 'REMOVE_CUT'; id: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'LOAD'; cuts: Cuts }

function reducer(state: Cuts, action: Action): Cuts {
  switch (action.type) {
    case 'SET_CUT': {
      if (action.percentage <= 0) {
        const { [action.id]: _, ...rest } = state
        return rest
      }
      return { ...state, [action.id]: Math.min(100, action.percentage) }
    }
    case 'REMOVE_CUT': {
      const { [action.id]: _, ...rest } = state
      return rest
    }
    case 'CLEAR_ALL':
      return {}
    case 'LOAD':
      return action.cuts
  }
}

function loadFromStorage(): Cuts {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return {}
}

function loadFromHash(): Cuts | null {
  try {
    const hash = window.location.hash.slice(1)
    if (!hash.startsWith('cuts=')) return null
    const pairs = hash.slice(5).split(',')
    const cuts: Cuts = {}
    for (const pair of pairs) {
      const [id, pct] = pair.split(':')
      if (id && pct) cuts[id] = Math.min(100, Math.max(0, Number(pct)))
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
      const hash = 'cuts=' + entries.map(([id, pct]) => `${id}:${pct}`).join(',')
      history.replaceState(null, '', '#' + hash)
    }
  }, [cuts])

  const totalSavings = useMemo(() => {
    return Object.entries(cuts).reduce((sum, [id, pct]) => {
      const m = momenttiMap.get(id)
      return sum + (m ? m.maaraaraha * pct / 100 : 0)
    }, 0)
  }, [cuts])

  const setCut = useCallback((id: string, percentage: number) => {
    dispatch({ type: 'SET_CUT', id, percentage })
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
