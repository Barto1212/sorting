import { getPurgedPO, getSB_DO, getSQL } from './utils/readCSV'
import { fr } from 'date-fns/locale'
import { isWithinInterval, parse, setDefaultOptions } from 'date-fns'
import formatNumber from './utils/formatNumber'
import generateEmptyResults from './utils/generateEmptyResults'
import sumPurgedPo from './utils/sumPurgedPo'
import * as fs from 'fs'
import purgeDir from './utils/purgeDir'
import getTotalMB from './utils/getTotalMB'

//  ------------------------------------- ENTREE DONNEES ------------------------------------- 
// Format date : jj/mm/aaaa
const debut = "01/04/2023"
const fin = "12/04/2023"
//  ----------------------------------- FIN ENTREE DONNEES ------------------------------------- 


setDefaultOptions({ locale: fr })
purgeDir('./out')
const separator = ';'

const SQL = getSQL()
const purgedPO = getPurgedPO()
const SB_DO = getSB_DO()

const startPeriod = parse(debut, 'dd/MM/yyyy', new Date())
const endPeriod = parse(fin, 'dd/MM/yyyy', new Date())

// --1-- On crée la variable products (initialement vide) :
const products = generateEmptyResults(SQL)

// --2-- On remplit la variable products avec les produits terminés sur la période selectionée :
SQL.forEach((row) => {
  const product = products.find(
    (prod) => prod.productLabel === row.FAB_MAS_PAL_MAS_LIB_COURT,
  )

  // Cas théoriquement non réalisable :
  if (!product) return

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

// --3-- la variable products_Col3_Col4 est une copie de product avec col3 et col4 en plus
const products_Col3_Col4 = products.map((product) => {
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

// --4-- on crée une variable SB_DO_with_typeProduit (SB_DO avec le champ TypeProduit)
const SB_DO_with_typeProduit = SB_DO.map((SB_DO_item) => {
  const TypeProduit = purgedPO.find(
    (product) => SB_DO_item.OF === product.OF,
  )?.TypeProduit
  return { ...SB_DO_item, TypeProduit }
})

// --5-- on crée la variable typeProduitList_OF qui est une liste d'OF par type de produit
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

// --6-- Pour avoir des tableaux de la même dimension (par ex: tous les produits de SQL ne sont pas dans purgedPO)
const filtredProductsCompleted_PO = products_Col3_Col4.filter((item) => {
  const isHere = typeProduitList_OF.find((i) => {
    return i.TypeProduit === item.productLabel
  })
  return !!isHere
})

const filtredTypeProduitList_OF = typeProduitList_OF.filter((item) => {
  const isHere = products_Col3_Col4.find((i) => {
    return i.productLabel === item.TypeProduit
  })
  return !!isHere
})

// --7-- On décompose l'algorithme pour chaque type de produit (un fichier de sortie par type de produit)
filtredTypeProduitList_OF.forEach((OF_item) => {
  const title = OF_item.TypeProduit
  // On crée la partie de gauche du fichier :
  const leftPart = filtredProductsCompleted_PO.find(
    (p) => p.productLabel === title,
  )

  // --8-- On crée la partie droite du fichier (celle ayant pour colonne SB_DO.OF)
  const rightPart: object = {}
  const POlist = filtredProductsCompleted_PO.find(
    (i) => i.productLabel === title,
  ).FAB_MAS_PAL_NUM_PO

  // --9-- On écris la ligne de titre du fichier :
  let titleOutArray = `col1${separator}col2${separator}col3${separator}col4${separator}col5${separator}col6`
  const col5: number[] = new Array(POlist.length)
  for (const i in OF_item.OF) {
    const OF = OF_item.OF[i]
    titleOutArray = titleOutArray + separator + OF
    rightPart[OF] = {}
    for (const row in POlist) {
      const PO = POlist[row]
      const sum = sumPurgedPo(purgedPO, OF, PO)
      col5[row] = col5[row] ? col5[row] + sum : sum
      rightPart[OF][PO] = sum
    }
  }
  const destinationPath = `./out/${title}.csv`

  // --10-- création de la variable csvString qui sera le fichier de sortie et on y mets le titre en dur :
  let csvString = `${titleOutArray}\n`

  for (const row in leftPart.FAB_MAS_PAL_NUM_PO) {
    // --11-- on peut commencer à écrire la partie de gauche en dur :
    csvString += leftPart.FAB_MAS_PAL_NUM_PO[row]
    csvString += separator + leftPart.FAB_MAS_PAL_TONNAGE_MASSE[row]
    csvString += separator + leftPart.col3[row]
    csvString += separator + leftPart.col4[row]
    csvString += separator + col5[row]
    csvString += separator + (leftPart.col3[row] - col5[row])

    // --12-- chaque ligne de la partie de droite s'écrit case par cas (donc en parcourant les colonnes)
    for (const collumn in rightPart) {
      csvString +=
        separator + rightPart[collumn][leftPart.FAB_MAS_PAL_NUM_PO[row]]
    }
    csvString += '\n'
  }
  // --13-- Calcul des totaux (les 3 dernières lignes) :
  let totalSBRow = ''
  let totalMBRow = ''
  let percentRow = ''
  ;[1, 2, 3, 4, 5].forEach(() => {
    totalSBRow += separator
    totalMBRow += separator
    percentRow += separator
  })
  totalSBRow += 'Total SB'
  totalMBRow += 'Total MB'
  percentRow += '%'
  for (const collumn in rightPart) {
    let totalSB = 0
    for (const row in rightPart[collumn]) {
      totalSB += rightPart[collumn][row]
    }
    const totalMB = getTotalMB(purgedPO, collumn)
    // Atention inverse dans la consigne pour le calcul du pourcentage
    const percent = Math.round((totalSB / totalMB) * 100)
    totalSBRow += separator + totalSB
    totalMBRow += separator + totalMB
    percentRow += separator + percent
  }
  csvString += totalSBRow + '\n' + totalMBRow + '\n' + percentRow

  fs.writeFileSync(destinationPath, csvString)
})
