export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 py-5">
        <p className="text-xs text-slate-400 text-center">
          Lähde: <a href="https://budjetti.vm.fi/opendata/" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-500 transition-colors">budjetti.vm.fi</a> (CC BY 4.0) — Valtiovarainministeriö.
          Tiedot ovat talousarvioesityksestä 2026.
        </p>
      </div>
    </footer>
  )
}
