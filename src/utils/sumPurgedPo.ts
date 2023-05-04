import formatNumber from './formatNumber'
import { purgedPOTitles } from './readCSV'

const sumPurgedPo = (
  purgedPo: Record<purgedPOTitles, string>[],
  OF: string,
  PO: number,
) => {
  const selectedRows = purgedPo.filter(
    (poData) => poData.OF === OF && formatNumber(poData.PO) === PO,
  )
  const sum = selectedRows.reduce(
    (acc, current) => acc + formatNumber(current.QteSoutirageSB_OFPOSB_Kg),
    0,
  )
  return sum
}

export default sumPurgedPo
