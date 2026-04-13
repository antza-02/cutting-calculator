import { writeFileSync } from 'fs'
import { resolve } from 'path'

const YEAR = 2026
const BASE_URL = `https://budjetti.vm.fi/indox/opendata/${YEAR}/tae/hallituksenEsitys/${YEAR}-tae-hallituksenEsitys`
const PAALUOKAT = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 35, 36]

interface Momentti {
  id: string
  numero: string
  nimi: string
  maaraaraha: number
}

interface Luku {
  numero: string
  nimi: string
  momentit: Momentti[]
  total: number
}

interface Paaluokka {
  numero: string
  nimi: string
  luvut: Luku[]
  total: number
}

function parseCsv(csv: string, paaluokkaNumero: string): Paaluokka | null {
  const lines = csv.split('\n').filter(l => l.trim())
  if (lines.length < 2) return null

  // Skip header row
  const rows = lines.slice(1)

  let paaluokkaNimi = ''
  const lukuMap = new Map<string, { nimi: string; momentit: Momentti[] }>()

  for (const line of rows) {
    const cols = line.split(';')
    if (cols.length < 8) continue

    // Columns: 0=paaluokka numero, 1=paaluokka nimi, 2=luku numero, 3=luku nimi,
    //          4=momentti numero, 5=momentti nimi, 6=info, 7=maaraaraha
    const plNimi = cols[1]?.trim().replace(/^"|"$/g, '') || ''
    const lukuNumero = cols[2]?.trim().replace(/^"|"$/g, '') || ''
    const lukuNimi = cols[3]?.trim().replace(/^"|"$/g, '') || ''
    const momenttiNumero = cols[4]?.trim().replace(/^"|"$/g, '') || ''
    const momenttiNimi = cols[5]?.trim().replace(/^"|"$/g, '') || ''
    const maaraStr = cols[7]?.trim().replace(/^"|"$/g, '') || '0'


    if (plNimi) paaluokkaNimi = plNimi

    if (!momenttiNumero || !lukuNumero) continue

    const maaraaraha = parseInt(maaraStr, 10) || 0

    if (!lukuMap.has(lukuNumero)) {
      lukuMap.set(lukuNumero, { nimi: lukuNimi, momentit: [] })
    }

    const luku = lukuMap.get(lukuNumero)!
    if (lukuNimi && !luku.nimi) luku.nimi = lukuNimi

    luku.momentit.push({
      id: `${paaluokkaNumero}.${lukuNumero}.${momenttiNumero}`,
      numero: momenttiNumero,
      nimi: momenttiNimi,
      maaraaraha,
    })
  }

  const luvut: Luku[] = Array.from(lukuMap.entries()).map(([numero, data]) => ({
    numero,
    nimi: data.nimi,
    momentit: data.momentit,
    total: data.momentit.reduce((sum, m) => sum + m.maaraaraha, 0),
  }))

  const total = luvut.reduce((sum, l) => sum + l.total, 0)

  return {
    numero: paaluokkaNumero,
    nimi: paaluokkaNimi,
    luvut,
    total,
  }
}

async function main() {
  console.log(`Fetching ${YEAR} budget data...`)

  const paaluokat: Paaluokka[] = []

  for (const num of PAALUOKAT) {
    const url = `${BASE_URL}-${num}.csv`
    console.log(`  Fetching pääluokka ${num}...`)
    try {
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 500))
      let res = await fetch(url)
      if (res.status === 503) {
        console.log(`    Retrying after 503...`)
        await new Promise(r => setTimeout(r, 2000))
        res = await fetch(url)
      }
      if (!res.ok) {
        console.warn(`  Warning: ${url} returned ${res.status}, skipping`)
        continue
      }
      // CSV files are ISO-8859-1 encoded
      const buffer = await res.arrayBuffer()
      const csv = new TextDecoder('iso-8859-1').decode(buffer)
      const parsed = parseCsv(csv, String(num))
      if (parsed && parsed.luvut.length > 0) {
        paaluokat.push(parsed)
        console.log(`    ${parsed.nimi}: ${parsed.luvut.length} lukua, ${parsed.luvut.reduce((s, l) => s + l.momentit.length, 0)} momenttia`)
      }
    } catch (err) {
      console.warn(`  Error fetching ${url}:`, err)
    }
  }

  const totalBudget = paaluokat.reduce((sum, p) => sum + p.total, 0)

  const data = {
    paaluokat,
    totalBudget,
    year: YEAR,
    generatedAt: new Date().toISOString(),
  }

  const outPath = resolve(import.meta.dirname!, '..', 'src', 'data', 'budget-data.json')
  writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8')

  console.log(`\nDone! ${paaluokat.length} pääluokkaa, total budget: ${(totalBudget / 1e9).toFixed(1)} mrd EUR`)
  console.log(`Written to ${outPath}`)
}

main()
