
function populateStockTable() {
  const tbody = document.getElementById("stockBody");
  stockData.forEach(stock => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${stock.name}</td>
      <td>${stock.sector}</td>
      <td>${stock.marketCap}</td>
      <td>₹${stock.currentPrice}</td>
      <td>${stock.pbRatio}</td>
      <td>${stock.deRatio}</td>
    `;
    tbody.appendChild(row);
  });
}


function filterStocks() {
  const longBody = document.querySelector("#longTable tbody");
  const shortBody = document.querySelector("#shortTable tbody");
  longBody.innerHTML = '';
  shortBody.innerHTML = '';

  stockData.forEach(stock => {
    const changePercent = ((stock.currentPrice - stock.priceWeekAgo) / stock.priceWeekAgo) * 100;
    const isShort = changePercent >= 10 && stock.rsi > 65 && stock.currentPrice < stock.ema200 && stock.volume > stock.volumeSMA20 && stock.marketCap > 1000;
    const isLong = changePercent <= -5 && stock.rsi < 45 && stock.currentPrice > stock.ema200 && stock.volume > stock.volumeSMA20 && stock.marketCap > 1000;

    const rowHTML = `
      <tr>
        <td>${stock.name}</td>
        <td>${stock.sector}</td>
        <td>₹${stock.currentPrice}</td>
        <td>${changePercent.toFixed(2)}%</td>
        <td>${isShort ? "SELL" : isLong ? "BUY" : ""}</td>
      </tr>
    `;

    if (isLong) {
      longBody.innerHTML += rowHTML;
    } else if (isShort) {
      shortBody.innerHTML += rowHTML;
    }
  });
  document.getElementById("filteredResults").scrollIntoView({ behavior: "smooth" });
}


document.addEventListener("DOMContentLoaded", () => {
  populateStockTable();
  document.getElementById("filterBtn").addEventListener("click", filterStocks);
  
});
