export const formatCurrency = (amount: number, moneda: string) => {
    const currencySymbol: { [key: string]: string } = {
      USD: '$',
      BRL: 'R$',
      PYG: '₲',
    }
  
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: moneda,
      currencyDisplay: 'narrowSymbol'
    }).format(amount).replace(/\s/g, '').replace(moneda, currencySymbol[moneda])
  }
  
  export const calcularImpuesto = (precio: number, impuestos: string[]) => {
    let impuesto = 0
    if (impuestos.includes('5%')) impuesto += precio * 0.05
    if (impuestos.includes('10%')) impuesto += precio * 0.10
    return impuesto
  }