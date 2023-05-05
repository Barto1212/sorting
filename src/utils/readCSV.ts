import * as fs from 'fs'

export type purgedPOTitles =
  | 'OF'
  | 'PO'
  | 'POfrom'
  | 'POto'
  | 'TypeProduit'
  | 'QteSoutirageSB_OFPOSB_Kg'
  | 'QteRemplissageMB_SPLPBMB_TotalL'
  | 'QteRemplissageMB_SPLPBMB_TotalKg'
  | 'QteRemplissageMB_SPLPBMB_Kg'
  | 'QtePOPaletiseKg'

export type SB_DOTitles =
  | 'OF'
  | 'PO'
  | 'POfrom'
  | 'POto'
  | 'TypeProduit'
  | 'QteSoutirageSB_OFPOSB_Kg'
  | 'QteRemplissageMB_SPLPBMB_TotalL'
  | 'QteRemplissageMB_SPLPBMB_TotalKg'
  | 'QteRemplissageMB_SPLPBMB_Kg'
  | 'QtePOPaletiseKg'
export type SQLTitles =
  | 'FAB_MAS_PAL_NUM_PO'
  | 'FAB_MAS_PAL_DATE_DEBUT'
  | 'FAB_MAS_PAL_DATE_FIN'
  | 'FAB_MAS_PAL_NUM_MATERIAL'
  | 'FAB_MAS_PAL_LIB_MATERIAL'
  | 'FAB_MAS_PAL_NUM_LIGNE'
  | 'FAB_MAS_PAL_REC_PRO_LIB'
  | 'FAB_MAS_PAL_MAS_LIB_COURT'
  | 'FAB_MAS_PAL_QTE_PLATEAU'
  | 'FAB_MAS_PAL_TONNAGE_MASSE'
  | 'FAB_MAS_PAL_TONNAGE_GLOBAL_SANS_FRUIT'
  | 'FAB_MAS_PAL_TONNAGE_GLOBAL_AVEC_FRUIT'

// Permet de transformer le csv en variable. A faire: créer une classe pour permettre le réemploi
export const getPurgedPO = () => {
  const data = fs.readFileSync('./in/purgedPO.csv', 'utf8')
  const rows = data.split('\n')
  const titles = rows[0].split(/\t/) as purgedPOTitles[]

  const datas = rows.slice(1).map((ligne) => {
    const col = ligne.split(/\t/)
    const objet = {} as Record<purgedPOTitles, string>
    titles.forEach((enTete, index) => {
      objet[enTete] = col[index]
    })
    return objet
  })
  return datas
}

export const getSB_DO = () => {
  const data = fs.readFileSync('./in/SB_DO.csv', 'utf8')
  const rows = data.split('\n')
  const titles = rows[0].split(/\t/) as SB_DOTitles[]

  const datas = rows.slice(1).map((ligne) => {
    const col = ligne.split(/\t/)
    const objet = {} as Record<SB_DOTitles, string>
    titles.forEach((enTete, index) => {
      objet[enTete] = col[index]
    })
    return objet
  })
  return datas
}

export const getSQL = () => {
  const data = fs.readFileSync('./in/SQL.csv', 'utf8')
  const rows = data.split('\n')
  const titles = rows[0].split(/\t/) as SQLTitles[]

  const datas = rows.slice(1).map((ligne) => {
    const col = ligne.split(/\t/)
    const objet = {} as Record<SQLTitles, string>
    titles.forEach((enTete, index) => {
      objet[enTete] = col[index]
    })
    return objet
  })
  return datas
}
