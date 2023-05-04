import type { SQLTitles } from './readCSV'

interface IProductResult {
  productLabel: string
  FAB_MAS_PAL_NUM_PO: number[]
  FAB_MAS_PAL_TONNAGE_MASSE: number[]
}

const generateEmptyResults = (SQL: Record<SQLTitles, string>[]) => {
  const products: IProductResult[] = []

  // On crée le tableau vide :
  SQL.forEach((row) => {
    const product = products.find(
      (prod) => prod.productLabel === row.FAB_MAS_PAL_MAS_LIB_COURT,
    )
    // Si produit inconnu on le renseigne :
    if (!product) {
      products.push({
        productLabel: row.FAB_MAS_PAL_MAS_LIB_COURT,
        FAB_MAS_PAL_NUM_PO: [],
        FAB_MAS_PAL_TONNAGE_MASSE: [],
      })
    }
  })
  return products
}

export default generateEmptyResults
