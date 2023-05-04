const formatNumber = (data: string) => {
  const decimalSeparator = data.replace(/,/, '.').replace(/\s/g, '')
  return Number(decimalSeparator)
}

export default formatNumber
