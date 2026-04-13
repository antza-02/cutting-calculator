import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { BudgetTree } from './components/BudgetTree'
import { TotalBar } from './components/TotalBar'
import { CutSummary } from './components/CutSummary'
import { useBudgetCuts } from './hooks/useBudgetCuts'
import { formatEur } from './utils/format'

export default function App() {
  const {
    cuts,
    setCut,
    removeCut,
    clearAll,
    totalSavings,
    totalBudget,
    budgetData,
    momenttiMap,
  } = useBudgetCuts()

  const cutCount = Object.keys(cuts).length
  const totalCount = cutCount

  return (
    <div className="min-h-screen flex flex-col">
      <Header totalBudget={totalBudget} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Budget tree - left panel */}
          <div className="lg:col-span-3 space-y-4">
            <BudgetTree
              data={budgetData}
              cuts={cuts}
              onSetCut={setCut}
              onRemoveCut={removeCut}
            />
          </div>

          {/* Summary - right panel (sticky on desktop) */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-4 space-y-4">
              <TotalBar
                totalSavings={totalSavings}
                totalBudget={totalBudget}
                cutCount={cutCount}
              />
              <CutSummary
                cuts={cuts}
                momenttiMap={momenttiMap}
                data={budgetData}
                onRemoveCut={removeCut}
                onClearAll={clearAll}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Mobile fixed bottom bar */}
      {totalCount > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200/60 shadow-2xl px-4 py-3 z-50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-extrabold bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent">
                -{formatEur(totalSavings)}
              </div>
              <div className="text-xs text-slate-500">{totalCount} kohdetta valittu</div>
            </div>
            <button
              onClick={clearAll}
              className="text-sm text-rose-500 border border-rose-200 rounded-xl px-3 py-1.5 hover:bg-rose-50 transition-colors"
            >
              Tyhjennä
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
