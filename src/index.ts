import { getPurgedPO, getSB_DO, getSQL } from './readCSV'
import { fr } from 'date-fns/locale'
import { isWithinInterval, parse, setDefaultOptions } from 'date-fns'
setDefaultOptions({ locale: fr })

const SQL = getSQL()

const startPeriod = parse('03/04/2023', 'dd/MM/yyyy', new Date())
const endPeriod = parse('05/04/2023', 'dd/MM/yyyy', new Date())

console.log(startPeriod)
console.log(endPeriod)

const products: { label: string; endedPO: string[] }[] = []
SQL.forEach((row) => {
  const productIndex = products.findIndex(
    (prod) => prod.label === row.FAB_MAS_PAL_MAS_LIB_COURT,
  )

  const endDate = parse(
    row.FAB_MAS_PAL_DATE_FIN,
    'dd/MM/yyyy HH:mm:ss',
    new Date(),
  )
  const endsOnPeriod = isWithinInterval(endDate, {
    start: startPeriod,
    end: endPeriod,
  })

  // Si produit inconnu on le renseigne :
  if (productIndex === -1) {
    const endedPO = endsOnPeriod ? [row.FAB_MAS_PAL_NUM_PO] : []
    products.push({
      label: row.FAB_MAS_PAL_MAS_LIB_COURT,
      endedPO,
    })
  } else {
    // Si on le connait, on ajoute les infos :
    endsOnPeriod && products[productIndex].endedPO.push(row.FAB_MAS_PAL_NUM_PO)
  }
  // if (productIndex)
})

console.log(products)
