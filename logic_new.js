// Global variables
let stockData = [];
let isLoading = false;

// Load real stock data on page load
async function loadStockData() {
    if (isLoading) return;
    
    isLoading = true;
    showLoadingState(true);
    
    try {
        console.log('Loading real stock data...');
        stockData = await stockAPI.getMultipleStocks(INDIAN_STOCKS);
        console.log('Loaded stocks:', stockData.length);
        
        if (stockData.length > 0) {
            populateStockTable();
        } else {
            showError('Failed to load stock data. Please refresh the page.');
        }
    } catch (error) {
        console.error('Error loading stock data:', error);
        showError('Error loading stock data. Please check your internet connection.');
    } finally {
        isLoading = false;
        showLoadingState(false);
    }
}

function populateStockTable() {
    const tbody = document.getElementById("stockBody");
    tbody.innerHTML = ''; // Clear existing data
    
    stockData.forEach(stock => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${stock.name}</td>
            <td>${stock.sector}</td>
            <td>${stock.marketCap}</td>
            <td>₹${stock.currentPrice.toFixed(2)}</td>
            <td>${stock.pbRatio}</td>
            <td>${stock.deRatio}</td>
        `;
        tbody.appendChild(row);
    });
}

function filterStocks() {
    if (stockData.length === 0) {
        showError('No stock data available. Please wait for data to load.');
        return;
    }
    
    const longBody = document.querySelector("#longTable tbody");
    const shortBody = document.querySelector("#shortTable tbody");
    longBody.innerHTML = '';
    shortBody.innerHTML = '';

    let longCount = 0;
    let shortCount = 0;

    stockData.forEach(stock => {
        const changePercent = stock.changePercent;
        
        // Enhanced filtering logic with real data
        const isShort = changePercent >= 10 && 
                       stock.rsi > 65 && 
                       stock.currentPrice < stock.ema200 && 
                       stock.volume > stock.volumeSMA20 && 
                       stock.marketCap > 1000;
                       
        const isLong = changePercent <= -5 && 
                      stock.rsi < 45 && 
                      stock.currentPrice > stock.ema200 && 
                      stock.volume > stock.volumeSMA20 && 
                      stock.marketCap > 1000;

        const rowHTML = `
            <tr>
                <td>${stock.name}</td>
                <td>${stock.sector}</td>
                <td>₹${stock.currentPrice.toFixed(2)}</td>
                <td class="${changePercent >= 0 ? 'positive' : 'negative'}">${changePercent.toFixed(2)}%</td>
                <td class="${isShort ? 'sell-signal' : isLong ? 'buy-signal' : ''}">${isShort ? "SELL" : isLong ? "BUY" : ""}</td>
            </tr>
        `;

        if (isLong) {
            longBody.innerHTML += rowHTML;
            longCount++;
        } else if (isShort) {
            shortBody.innerHTML += rowHTML;
            shortCount++;
        }
    });
    
    // Show results count
    updateResultsCount(longCount, shortCount);
    
    // Scroll to results
    document.getElementById("filteredResults").scrollIntoView({ behavior: "smooth" });
}

function updateResultsCount(longCount, shortCount) {
    const longHeader = document.querySelector('#filteredResults h2:first-of-type');
    const shortHeader = document.querySelector('#filteredResults h2:last-of-type');
    
    longHeader.textContent = `📈 Long Opportunities (${longCount})`;
    shortHeader.textContent = `📉 Short Opportunities (${shortCount})`;
}

function showLoadingState(show) {
    const filterBtn = document.getElementById("filterBtn");
    const stockBody = document.getElementById("stockBody");
    
    if (show) {
        filterBtn.textContent = "🔄 Loading...";
        filterBtn.disabled = true;
        stockBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Loading real stock data...</td></tr>';
    } else {
        filterBtn.textContent = "🔍 Filter Long/Short";
        filterBtn.disabled = false;
    }
}

function showError(message) {
    const stockBody = document.getElementById("stockBody");
    stockBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: red;">${message}</td></tr>`;
}

// Auto-refresh data every 5 minutes
function startAutoRefresh() {
    setInterval(() => {
        if (!isLoading) {
            console.log('Auto-refreshing stock data...');
            loadStockData();
        }
    }, 5 * 60 * 1000); // 5 minutes
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
    // Load initial data
    loadStockData();
    
    // Set up filter button
    document.getElementById("filterBtn").addEventListener("click", filterStocks);
    
    // Start auto-refresh
    startAutoRefresh();
    
    // Add refresh button functionality
    const refreshBtn = document.createElement('button');
    refreshBtn.textContent = '🔄 Refresh Data';
    refreshBtn.style.marginLeft = '10px';
    refreshBtn.addEventListener('click', loadStockData);
    document.getElementById("filterBtn").parentNode.appendChild(refreshBtn);
});