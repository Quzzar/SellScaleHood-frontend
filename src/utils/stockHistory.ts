import { Stock } from "../components/App";
import { MAX_RECENT_HISTORY } from "../constants/data";

function addToHistory(stock: Stock){
  let history = getHistory();

  // Remove all stocks with same ticker
  history = history.filter((h) => {
    return h.ticker !== stock.ticker;
  });

  // Add new stock to end
  history.push({
    ticker: stock.ticker,
    name: stock.name
  });

  // If beyond max, remove stock from beginning
  if(history.length > MAX_RECENT_HISTORY){
    history.shift();
  }
  
  localStorage.setItem('stockHistory', JSON.stringify(history));
}

function getHistory(): Stock[] {
  const historyStr = localStorage.getItem('stockHistory');
  if(!historyStr) { return []; }
  return JSON.parse(historyStr) as Stock[];
}

function clearHistory(){
  localStorage.removeItem('stockHistory');
}

export {
  addToHistory,
  getHistory,
  clearHistory,
};
