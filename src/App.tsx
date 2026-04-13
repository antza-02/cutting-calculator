import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { BudgetTree } from './components/BudgetTree'
import { TotalBar } from './components/TotalBar'
import { CutSummary } from './components/CutSummary'
import { useBudgetCuts } from './hooks/useBudgetCuts'

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Budget tree - left panel */}
          <div className="lg:col-span-3">
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
      {cutCount > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg px-4 py-3 z-50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-red-600">-{new Intl.NumberFormat('fi-FI', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(totalSavings)}</div>
              <div className="text-xs text-gray-500">{cutCount} momenttia valittu</div>
            </div>
            <button
              onClick={clearAll}
              className="text-sm text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50"
            >
              Tyhjennä
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
