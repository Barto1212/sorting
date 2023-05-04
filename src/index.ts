import { getPurgedPO, getSB_DO, getSQL } from './utils/readCSV'
import { fr } from 'date-fns/locale'
import { isWithinInterval, parse, setDefaultOptions } from 'date-fns'
import formatNumber from './utils/formatNumber'
import generateEmptyResults from './utils/generateEmptyResults'
import sumPurgedPo from './utils/sumPurgedPo'
setDefaultOptions({ locale: fr })

const SQL = getSQL()
const purgedPO = getPurgedPO()
const SB_DO = getSB_DO()
const products = generateEmptyResults(SQL)

const startPeriod = parse('03/04/2023', 'dd/MM/yyyy', new Date())
const endPeriod = parse('05/04/2023', 'dd/MM/yyyy', new Date())

SQL.forEach((row) => {
  const product = products.find(
    (prod) => prod.productLabel === row.FAB_MAS_PAL_MAS_LIB_COURT,
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

const productsCompleted_PO = products.map((product) => {
  const col3 = product.FAB_MAS_PAL_NUM_PO.map((po) => {
    const QtePOPaletiseeKg = purgedPO.reduce((accumulator, purgedPOItem) => {
      if (po === formatNumber(purgedPOItem.PO)) {
        return accumulator + formatNumber(purgedPOItem.QtePOPaletiseKg)
      }
      return accumulator
    }, 0)
    return QtePOPaletiseeKg
  })
  const col4 = col3.map(
    (col3Data, index) => col3Data - product.FAB_MAS_PAL_TONNAGE_MASSE[index],
  )
  return { ...product, col3, col4 }
})

const SB_DO_with_typeProduit = SB_DO.map((SB_DO_item) => {
  const TypeProduit = purgedPO.find(
    (product) => SB_DO_item.OF === product.OF,
  )?.TypeProduit
  return { ...SB_DO_item, TypeProduit }
})

const typeProduitList_OF: { TypeProduit: string; OF: string[] }[] = []

SB_DO_with_typeProduit.forEach((item) => {
  const { OF, TypeProduit } = item
  if (!TypeProduit) return
  const typeProduitListItem = typeProduitList_OF.find(
    (d) => d.TypeProduit === TypeProduit,
  )
  if (typeProduitListItem) {
    // Pour ne pas avoir de répétition d'OF :
    if (typeProduitListItem.OF.includes(OF)) return
    typeProduitListItem.OF.push(OF)
  } else {
    typeProduitList_OF.push({ TypeProduit, OF: [OF] })
  }
})

// Pour avoir des tableaux de la même dimension (tous les produits de SQL ne sont pas dans purgedPO)
const filtredProductsCompleted_PO = productsCompleted_PO.filter((item) => {
  const isHere = typeProduitList_OF.find((i) => {
    // console.log(i.TypeProduit,item.productLabel)
    return i.TypeProduit === item.productLabel
  })
  return !!isHere
})

const filtredTypeProduitList_OF = typeProduitList_OF.filter((item) => {
  const isHere = productsCompleted_PO.find((i) => {
    // console.log(i.productLabel,item.TypeProduit)
    return i.productLabel === item.TypeProduit
  })
  return !!isHere
})

// console.log(filtredProductsCompleted_PO.length)
// console.log(filtredTypeProduitList_OF.length)
const coll5: number[] = []
filtredTypeProduitList_OF.forEach((OF_item) => {
  const title = OF_item.TypeProduit
  const POlist = filtredProductsCompleted_PO.find((i) => i.productLabel === title).FAB_MAS_PAL_NUM_PO
  OF_item.OF.forEach((OF) => {
    POlist.forEach(PO => {

      const sum = sumPurgedPo(purgedPO, OF, PO)
      console.log(sum)
      
    })
  })
})
