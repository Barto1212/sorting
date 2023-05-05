import formatNumber from "./formatNumber"
import { purgedPOTitles } from "./readCSV"

const getTotalMB = (purgedPO: Record<purgedPOTitles, string>[], OF: string) => {
  const sum = purgedPO.reduce((accumulator, current)=> {
    if (current.OF === OF) {
      return accumulator + formatNumber(current.QteRemplissageMB_SPLPBMB_Kg)
    }
    return accumulator
  }, 0)
  return sum
}

export default getTotalMB