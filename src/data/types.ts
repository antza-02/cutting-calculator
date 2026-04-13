export interface Momentti {
  id: string        // "28.01.01"
  numero: string
  nimi: string
  maaraaraha: number // euros
}

export interface Luku {
  numero: string
  nimi: string
  momentit: Momentti[]
  total: number
}

export interface Paaluokka {
  numero: string
  nimi: string
  luvut: Luku[]
  total: number
}

export interface BudgetData {
  paaluokat: Paaluokka[]
  totalBudget: number
  year: number
  generatedAt: string
}
