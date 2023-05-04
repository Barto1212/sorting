import { getPurgedPO, getSB_DO, getSQL } from './utils/readCSV'
import { fr } from 'date-fns/locale'
import { isWithinInterval, parse, setDefaultOptions } from 'date-fns'
import formatNumber from './utils/formatNumber'
import generateEmptyResults from './utils/generateEmptyResults'
setDefaultOptions({ locale: fr })

const SQL = getSQL()
const purgedPO = getPurgedPO()
const products = generateEmptyResults(SQL)

const startPeriod = parse('03/04/2023', 'dd/MM/yyyy', new Date())
const endPeriod = parse('05/04/2023', 'dd/MM/yyyy', new Date())

SQL.forEach((row) => {
  const product = products.find(
    (prod) => prod.label === row.FAB_MAS_PAL_MAS_LIB_COURT,
  )

  // Cas théoriquement non réalisable :
  // if (!product) return

  const endDate = parse(
    row.FAB_MAS_PAL_DATE_FIN,
    'dd/MM/yyyy HH:mm:ss',
    new Date(),
  )

  const endsOnPeriod = isWithinInterval(endDate, {
    start: startPeriod,
    end: endPeriod,
  })

  if (endsOnPeriod) {
    product.FAB_MAS_PAL_NUM_PO.push(formatNumber(row.FAB_MAS_PAL_NUM_PO))
    product.FAB_MAS_PAL_TONNAGE_MASSE.push(
      formatNumber(row.FAB_MAS_PAL_TONNAGE_MASSE),
    )
  }
})
console.log(products)

const productsCompleted = products.map((product) => {
  const coll3 = product.FAB_MAS_PAL_NUM_PO.map((po) => {
    const QtePOPaletiseeKg = purgedPO.reduce((accumulator, purgedPOItem) => {
      if (po === formatNumber(purgedPOItem.PO)) {
        return accumulator + formatNumber(purgedPOItem.QtePOPaletiseKg)
      }
      return accumulator
    }, 0)
    return QtePOPaletiseeKg
  })
  console.log(coll3)
  return { ...product, coll3 }
})

console.log(productsCompleted)
