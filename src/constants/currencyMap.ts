
// TODO: Might be worth using something like this instead: https://currency.js.org/
const currencyMap = new Map()
  .set('USD', '$')
  .set('EUR', '€')
  .set('JPY', '¥')
  .set('GBP', '£')
  .set('CHF', 'CHF')
  .set('CAD', 'CAD')
  .set('ZAR', 'R');

export default function getSymbol(currency: string){
  let symbol = currencyMap.get(currency);
  return symbol ? `${symbol} ` : `??? `;
};
