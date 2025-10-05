// Analytics Dashboard Module
// Provides market insights and data visualization

class MarketAnalytics {
    constructor() {
        this.selectedMarket = '';
        this.comparisonMarket = '';
        this.charts = {};
        this.currentTheme = 'light';
        this.init();
    }

    init() {
        this.initializeEventListeners();
        this.initializeTheme();
        this.loadMarketData();
        this.createCharts();
        this.populateMarketsTable();
    }

    initializeEventListeners() {
        // Market selection
        document.getElementById('market-select').addEventListener('change', (e) => {
            this.selectedMarket = e.target.value;
            this.updateDashboard();
        });

        document.getElementById('comparison-select').addEventListener('change', (e) => {
            this.comparisonMarket = e.target.value;
            this.updateComparisonChart();
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Table sorting
        document.querySelectorAll('.table-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.table-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.sortTable(e.target.dataset.sort);
            });
        });
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.currentTheme = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeToggle();
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        this.updateThemeToggle();
        this.updateChartTheme();
    }

    updateThemeToggle() {
        const sunIcon = document.querySelector('.sun-icon');
        const moonIcon = document.querySelector('.moon-icon');

        if (this.currentTheme === 'dark') {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    }

    loadMarketData() {
        const market = this.selectedMarket || 'National';
        const data = this.selectedMarket ?
            marketDatabase.regions[this.selectedMarket] :
            this.getNationalAverages();

        // Update metrics
        document.getElementById('median-price').textContent =
            MarketDataHelper.formatCurrency(data.medianPrice || 450000);
        document.getElementById('mortgage-rate').textContent =
            `${marketDatabase.nationalRates.mortgage.current30Year}%`;
        document.getElementById('median-rent').textContent =
            MarketDataHelper.formatCurrency(data.medianRent || 2200);
        document.getElementById('cap-rate').textContent =
            `${data.capRate || 7.5}%`;
        document.getElementById('vacancy-rate').textContent =
            `${data.vacancy || 5.2}%`;

        const priceRentRatio = (data.medianPrice / (data.medianRent * 12)).toFixed(1);
        document.getElementById('price-rent-ratio').textContent = priceRentRatio;

        // Update trend indicators
        this.updateTrendIndicators(data);

        // Update insights
        this.updateInsights(market, data);
    }

    getNationalAverages() {
        const regions = Object.values(marketDatabase.regions);
        return {
            medianPrice: regions.reduce((sum, r) => sum + r.medianPrice, 0) / regions.length,
            medianRent: regions.reduce((sum, r) => sum + r.medianRent, 0) / regions.length,
            capRate: regions.reduce((sum, r) => sum + r.capRate, 0) / regions.length,
            appreciation: regions.reduce((sum, r) => sum + r.appreciation, 0) / regions.length,
            rentGrowth: regions.reduce((sum, r) => sum + r.rentGrowth, 0) / regions.length,
            vacancy: regions.reduce((sum, r) => sum + r.vacancy, 0) / regions.length,
            propertyTax: regions.reduce((sum, r) => sum + r.propertyTax, 0) / regions.length,
            insurance: regions.reduce((sum, r) => sum + r.insurance, 0) / regions.length
        };
    }

    updateTrendIndicators(data) {
        // Price change
        const priceChange = document.getElementById('price-change');
        priceChange.textContent = `+${data.appreciation || 3.5}%`;
        priceChange.className = 'metric-change' + (data.appreciation > 0 ? '' : ' negative');

        // Rent change
        const rentChange = document.getElementById('rent-change');
        rentChange.textContent = `+${data.rentGrowth || 3.0}%`;
        rentChange.className = 'metric-change' + (data.rentGrowth > 0 ? '' : ' negative');

        // Vacancy change (lower is better, so negative is good)
        const vacancyChange = document.getElementById('vacancy-change');
        const vacancyTrend = data.vacancy < 5 ? -0.5 : 0.3;
        vacancyChange.textContent = `${vacancyTrend > 0 ? '+' : ''}${vacancyTrend}%`;
        vacancyChange.className = 'metric-change' + (vacancyTrend > 0 ? ' negative' : '');

        // Price/Rent ratio trend
        const ratioTrend = document.getElementById('ratio-trend');
        const ratio = data.medianPrice / (data.medianRent * 12);
        ratioTrend.textContent = ratio > 20 ? 'High' : ratio > 15 ? 'Moderate' : 'Low';
    }

    updateInsights(market, data) {
        const buyerInsights = document.getElementById('buyer-insights');
        const investorInsights = document.getElementById('investor-insights');
        const renterInsights = document.getElementById('renter-insights');

        // Buyer insights
        const buyerTips = [];
        if (marketDatabase.nationalRates.mortgage.trend === 'decreasing') {
            buyerTips.push('Mortgage rates are trending down - good time to lock in');
        }
        if (data.appreciation < 4) {
            buyerTips.push('Stable market conditions favor buyers');
        }
        if (data.vacancy > 5) {
            buyerTips.push('Higher inventory provides negotiation leverage');
        }
        buyerTips.push(`Average home appreciates ${data.appreciation || 3.5}% annually in this market`);

        buyerInsights.innerHTML = buyerTips.map(tip => `<li>${tip}</li>`).join('');

        // Investor insights
        const investorTips = [];
        if (data.capRate > 7) {
            investorTips.push(`Strong cap rate of ${data.capRate}% indicates good cash flow potential`);
        }
        if (data.rentGrowth > 3.5) {
            investorTips.push(`Rent growth of ${data.rentGrowth}% outpaces inflation`);
        }
        if (data.vacancy < 5) {
            investorTips.push('Low vacancy rates mean stable rental income');
        }
        const priceRentRatio = data.medianPrice / (data.medianRent * 12);
        if (priceRentRatio < 20) {
            investorTips.push('Price-to-rent ratio favors buying over renting');
        }

        investorInsights.innerHTML = investorTips.map(tip => `<li>${tip}</li>`).join('');

        // Renter insights
        const renterTips = [];
        if (data.vacancy > 5) {
            renterTips.push('Higher vacancy gives renters more negotiation power');
        }
        if (data.rentGrowth < 3) {
            renterTips.push('Rent growth is moderate - good for budget planning');
        }
        if (priceRentRatio > 20) {
            renterTips.push('High price-to-rent ratio makes renting more attractive');
        }
        renterTips.push(`Average rent is ${MarketDataHelper.formatCurrency(data.medianRent)} per month`);

        renterInsights.innerHTML = renterTips.map(tip => `<li>${tip}</li>`).join('');
    }

    createCharts() {
        const isDark = this.currentTheme === 'dark';

        // Set chart defaults
        Chart.defaults.color = isDark ? '#8c8e92' : '#6A6D70';
        Chart.defaults.borderColor = isDark ? '#2a2d31' : '#E0E0E0';

        this.createRatesChart();
        this.createGrowthChart();
        this.createComparisonChart();
        this.createReturnsChart();
    }

    createRatesChart() {
        const ctx = document.getElementById('rates-chart').getContext('2d');
        const data = marketDatabase.nationalRates.mortgage.historicalData;

        this.charts.rates = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.date),
                datasets: [{
                    label: '30-Year Fixed Rate',
                    data: data.map(d => d.rate),
                    borderColor: '#5AC53B',
                    backgroundColor: 'rgba(90, 197, 59, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `Rate: ${context.parsed.y}%`
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: (value) => value + '%'
                        }
                    }
                }
            }
        });
    }

    createGrowthChart() {
        const ctx = document.getElementById('growth-chart').getContext('2d');
        const markets = Object.entries(marketDatabase.regions).slice(0, 6);

        this.charts.growth = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Markets',
                    data: markets.map(([name, data]) => ({
                        x: data.appreciation,
                        y: data.rentGrowth,
                        label: name.split(',')[0]
                    })),
                    backgroundColor: '#5AC53B',
                    borderColor: '#5AC53B',
                    pointRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const point = context.raw;
                                return `${point.label}: ${point.x}% price, ${point.y}% rent`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Price Appreciation (%)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Rent Growth (%)'
                        }
                    }
                }
            }
        });
    }

    createComparisonChart() {
        const ctx = document.getElementById('comparison-chart').getContext('2d');
        const markets = Object.entries(marketDatabase.regions).slice(0, 5);

        this.charts.comparison = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Cap Rate', 'Appreciation', 'Rent Growth', 'Low Vacancy', 'Affordability'],
                datasets: markets.map(([name, data], index) => ({
                    label: name.split(',')[0],
                    data: [
                        data.capRate,
                        data.appreciation,
                        data.rentGrowth,
                        10 - data.vacancy, // Inverse for better visualization
                        (500000 / data.medianPrice) * 10 // Affordability index
                    ],
                    borderColor: this.getChartColor(index),
                    backgroundColor: this.getChartColor(index, 0.2),
                    hidden: index > 2 // Show only first 3 by default
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 10
                    }
                }
            }
        });
    }

    createReturnsChart() {
        const ctx = document.getElementById('returns-chart').getContext('2d');
        const markets = Object.entries(marketDatabase.regions);

        this.charts.returns = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: markets.map(([name]) => name.split(',')[0]),
                datasets: [{
                    label: 'Cap Rate (%)',
                    data: markets.map(([, data]) => data.capRate),
                    backgroundColor: '#5AC53B'
                }, {
                    label: 'Total Return (%)',
                    data: markets.map(([, data]) => data.capRate + data.appreciation),
                    backgroundColor: '#F4B643'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: (value) => value + '%'
                        }
                    }
                }
            }
        });
    }

    updateComparisonChart() {
        if (!this.comparisonMarket || !this.selectedMarket) return;

        const market1 = marketDatabase.regions[this.selectedMarket];
        const market2 = marketDatabase.regions[this.comparisonMarket];

        if (!market1 || !market2) return;

        this.charts.comparison.data.datasets = [
            {
                label: this.selectedMarket.split(',')[0],
                data: [
                    market1.capRate,
                    market1.appreciation,
                    market1.rentGrowth,
                    10 - market1.vacancy,
                    (500000 / market1.medianPrice) * 10
                ],
                borderColor: '#5AC53B',
                backgroundColor: 'rgba(90, 197, 59, 0.2)'
            },
            {
                label: this.comparisonMarket.split(',')[0],
                data: [
                    market2.capRate,
                    market2.appreciation,
                    market2.rentGrowth,
                    10 - market2.vacancy,
                    (500000 / market2.medianPrice) * 10
                ],
                borderColor: '#F4B643',
                backgroundColor: 'rgba(244, 182, 67, 0.2)'
            }
        ];

        this.charts.comparison.update();
    }

    populateMarketsTable() {
        const tbody = document.getElementById('markets-tbody');
        const markets = Object.entries(marketDatabase.regions);

        // Calculate scores
        const marketsWithScores = markets.map(([name, data]) => {
            const score = this.calculateInvestmentScore(data);
            return { name, ...data, score };
        });

        // Sort by default (cap rate)
        marketsWithScores.sort((a, b) => b.capRate - a.capRate);

        // Populate table
        tbody.innerHTML = marketsWithScores.map((market, index) => `
            <tr class="${index < 3 ? 'top-market' : ''}">
                <td><strong>${market.name}</strong></td>
                <td>${MarketDataHelper.formatCurrency(market.medianPrice)}</td>
                <td>${MarketDataHelper.formatCurrency(market.medianRent)}</td>
                <td class="highlight">${market.capRate}%</td>
                <td>${market.appreciation}%</td>
                <td>${market.rentGrowth}%</td>
                <td>${market.vacancy}%</td>
                <td class="score-cell">
                    <div class="score-bar" style="width: ${market.score}%"></div>
                    <span>${market.score}/100</span>
                </td>
            </tr>
        `).join('');
    }

    calculateInvestmentScore(data) {
        // Weighted scoring algorithm
        const capRateScore = Math.min(data.capRate * 10, 50); // Max 50 points
        const appreciationScore = Math.min(data.appreciation * 3, 15); // Max 15 points
        const rentGrowthScore = Math.min(data.rentGrowth * 3, 15); // Max 15 points
        const vacancyScore = Math.max(20 - data.vacancy * 2, 0); // Max 20 points

        return Math.round(capRateScore + appreciationScore + rentGrowthScore + vacancyScore);
    }

    sortTable(sortBy) {
        const tbody = document.getElementById('markets-tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const markets = Object.entries(marketDatabase.regions).map(([name, data]) => ({
            name,
            ...data,
            score: this.calculateInvestmentScore(data)
        }));

        // Sort based on criteria
        switch(sortBy) {
            case 'capRate':
                markets.sort((a, b) => b.capRate - a.capRate);
                break;
            case 'appreciation':
                markets.sort((a, b) => b.appreciation - a.appreciation);
                break;
            case 'rentGrowth':
                markets.sort((a, b) => b.rentGrowth - a.rentGrowth);
                break;
            case 'affordability':
                markets.sort((a, b) => a.medianPrice - b.medianPrice);
                break;
        }

        // Repopulate table
        tbody.innerHTML = markets.map((market, index) => `
            <tr class="${index < 3 ? 'top-market' : ''}">
                <td><strong>${market.name}</strong></td>
                <td>${MarketDataHelper.formatCurrency(market.medianPrice)}</td>
                <td>${MarketDataHelper.formatCurrency(market.medianRent)}</td>
                <td class="${sortBy === 'capRate' ? 'highlight' : ''}">${market.capRate}%</td>
                <td class="${sortBy === 'appreciation' ? 'highlight' : ''}">${market.appreciation}%</td>
                <td class="${sortBy === 'rentGrowth' ? 'highlight' : ''}">${market.rentGrowth}%</td>
                <td>${market.vacancy}%</td>
                <td class="score-cell">
                    <div class="score-bar" style="width: ${market.score}%"></div>
                    <span>${market.score}/100</span>
                </td>
            </tr>
        `).join('');
    }

    updateDashboard() {
        this.loadMarketData();
        this.updateCharts();
    }

    updateCharts() {
        // Update charts with new data if needed
        Object.values(this.charts).forEach(chart => chart.update());
    }

    updateChartTheme() {
        const isDark = this.currentTheme === 'dark';
        Chart.defaults.color = isDark ? '#8c8e92' : '#6A6D70';
        Chart.defaults.borderColor = isDark ? '#2a2d31' : '#E0E0E0';

        // Recreate charts with new theme
        Object.values(this.charts).forEach(chart => chart.destroy());
        this.createCharts();
    }

    getChartColor(index, alpha = 1) {
        const colors = [
            `rgba(90, 197, 59, ${alpha})`,   // Green
            `rgba(244, 182, 67, ${alpha})`,  // Yellow
            `rgba(236, 94, 42, ${alpha})`,   // Orange
            `rgba(106, 109, 112, ${alpha})`, // Gray
            `rgba(0, 200, 5, ${alpha})`      // Primary
        ];
        return colors[index % colors.length];
    }

    exportToCalculator() {
        // Store selected market data in localStorage
        const marketData = this.selectedMarket ?
            marketDatabase.regions[this.selectedMarket] :
            this.getNationalAverages();

        localStorage.setItem('marketData', JSON.stringify({
            location: this.selectedMarket || 'National Average',
            data: marketData,
            mortgageRate: marketDatabase.nationalRates.mortgage.current30Year
        }));

        // Redirect to calculator
        window.location.href = 'index.html';
    }

    downloadReport() {
        const marketData = this.selectedMarket ?
            marketDatabase.regions[this.selectedMarket] :
            this.getNationalAverages();

        const report = this.generateReport(marketData);

        // Create download link
        const blob = new Blob([report], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `market-report-${this.selectedMarket || 'national'}-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    generateReport(data) {
        const date = new Date().toLocaleDateString();
        const market = this.selectedMarket || 'National Average';

        return `
REAL ESTATE MARKET REPORT
Generated: ${date}
Market: ${market}

KEY METRICS
-----------
Median Home Price: ${MarketDataHelper.formatCurrency(data.medianPrice)}
Median Monthly Rent: ${MarketDataHelper.formatCurrency(data.medianRent)}
Cap Rate: ${data.capRate}%
Annual Appreciation: ${data.appreciation}%
Rent Growth: ${data.rentGrowth}%
Vacancy Rate: ${data.vacancy}%
Property Tax Rate: ${data.propertyTax}%
Insurance Rate: ${data.insurance}%

CURRENT RATES
------------
30-Year Fixed Mortgage: ${marketDatabase.nationalRates.mortgage.current30Year}%
15-Year Fixed Mortgage: ${marketDatabase.nationalRates.mortgage.current15Year}%
FHA Rate: ${marketDatabase.nationalRates.mortgage.fhaRate}%
VA Rate: ${marketDatabase.nationalRates.mortgage.vaRate}%

INVESTMENT ANALYSIS
------------------
Price-to-Rent Ratio: ${(data.medianPrice / (data.medianRent * 12)).toFixed(1)}
Gross Rental Yield: ${((data.medianRent * 12) / data.medianPrice * 100).toFixed(2)}%
Investment Score: ${this.calculateInvestmentScore(data)}/100

MARKET OUTLOOK
-------------
${data.appreciation > 5 ? 'High growth market with strong appreciation potential.' :
  data.appreciation > 3 ? 'Stable market with moderate appreciation.' :
  'Mature market with steady returns.'}

${data.capRate > 7 ? 'Excellent cash flow potential for investors.' :
  data.capRate > 5 ? 'Good balance of cash flow and appreciation.' :
  'Market favors appreciation over immediate cash flow.'}

${data.vacancy < 5 ? 'Low vacancy indicates strong rental demand.' :
  data.vacancy < 7 ? 'Average vacancy rates provide stable rental income.' :
  'Higher vacancy requires careful tenant screening.'}

RECOMMENDATIONS
--------------
For Buyers: ${marketDatabase.nationalRates.mortgage.trend === 'decreasing' ?
  'Favorable time to lock in mortgage rates.' :
  'Shop multiple lenders for best rates.'}

For Investors: ${data.capRate > 7 ?
  'Strong cash-on-cash returns expected.' :
  'Focus on long-term appreciation potential.'}

For Renters: ${data.rentGrowth < 3 ?
  'Stable rental market with predictable costs.' :
  'Consider locking in longer lease terms.'}

---
Report generated by Real Estate Market Analytics Dashboard
        `;
    }

    refreshData() {
        // Simulate data refresh
        const refreshBtn = document.querySelector('.refresh-btn');
        refreshBtn.textContent = 'Refreshing...';
        refreshBtn.disabled = true;

        setTimeout(() => {
            this.loadMarketData();
            this.updateCharts();
            refreshBtn.textContent = 'Refresh Data';
            refreshBtn.disabled = false;

            // Show success message
            this.showNotification('Data refreshed successfully');
        }, 1000);
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize analytics when document is ready
let analytics;
document.addEventListener('DOMContentLoaded', function() {
    if (typeof MarketDataHelper !== 'undefined') {
        analytics = new MarketAnalytics();
    }
});