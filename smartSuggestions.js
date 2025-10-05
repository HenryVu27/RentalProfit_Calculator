// Smart Suggestions Module
// Provides intelligent suggestions for property investment inputs

class SmartSuggestions {
    constructor() {
        this.currentField = null;
        this.panel = null;
        this.selectedLocation = null;
        this.selectedNeighborhood = null;
        this.propertyType = 'Single Family';
        this.buyerProfile = 'Investment Property';
        this.init();
    }

    init() {
        this.createSuggestionPanel();
        this.attachEventListeners();
        this.detectUserLocation();
        this.loadUserPreferences();
    }

    createSuggestionPanel() {
        // Create the suggestion panel element
        const panel = document.createElement('div');
        panel.id = 'smart-suggestions-panel';
        panel.className = 'suggestion-panel';
        panel.innerHTML = `
            <div class="suggestion-header">
                <h4>Smart Suggestions</h4>
                <button class="close-btn">×</button>
            </div>
            <div class="location-selector">
                <label>Location:</label>
                <select id="location-select">
                    <option value="">Select a city...</option>
                    ${MarketDataHelper.getAvailableCities().map(city =>
                        `<option value="${city}">${city}</option>`
                    ).join('')}
                </select>
                <select id="neighborhood-select" style="display:none;">
                    <option value="">All neighborhoods</option>
                </select>
            </div>
            <div class="property-type-selector">
                <label>Property Type:</label>
                <select id="property-type-select">
                    ${Object.keys(marketDatabase.propertyTypes).map(type =>
                        `<option value="${type}" ${type === 'Single Family' ? 'selected' : ''}>${type}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="suggestion-content" id="suggestion-content">
                <p class="suggestion-hint">Select a location to see suggestions</p>
            </div>
        `;

        document.body.appendChild(panel);
        this.panel = panel;

        // Add event listeners after creating the panel
        this.panel.querySelector('.close-btn').addEventListener('click', () => this.hidePanel());
        this.panel.querySelector('#location-select').addEventListener('change', (e) => this.updateLocation(e.target.value));
        this.panel.querySelector('#neighborhood-select').addEventListener('change', (e) => this.updateNeighborhood(e.target.value));
        this.panel.querySelector('#property-type-select').addEventListener('change', (e) => this.updatePropertyType(e.target.value));
    }

    attachEventListeners() {
        // Attach focus/blur events to all input fields
        const inputFields = [
            { id: 'simple-purchase-price', type: 'purchasePrice' },
            { id: 'simple-interest-rate', type: 'interestRate' },
            { id: 'simple-down-payment', type: 'downPayment' },
            { id: 'simple-monthly-rent', type: 'rent' },
            { id: 'simple-annual-expenses', type: 'expenses' },
            { id: 'adv-purchase-price', type: 'purchasePrice' },
            { id: 'adv-interest-rate', type: 'interestRate' },
            { id: 'adv-down-payment-percent', type: 'downPayment' },
            { id: 'adv-monthly-rent', type: 'rent' },
            { id: 'adv-property-tax', type: 'propertyTax' },
            { id: 'adv-insurance', type: 'insurance' },
            { id: 'adv-vacancy-rate', type: 'vacancy' },
            { id: 'adv-appreciation', type: 'appreciation' }
        ];

        inputFields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element) {
                element.addEventListener('focus', () => {
                    this.showSuggestions(field.type, element);
                });

                element.addEventListener('blur', (e) => {
                    // Don't hide if clicking within the panel
                    setTimeout(() => {
                        if (!this.panel.contains(document.activeElement) &&
                            !this.panel.contains(e.relatedTarget)) {
                            this.hidePanel();
                        }
                    }, 200);
                });
            }
        });

        // Keep panel open when interacting with it
        this.panel.addEventListener('mousedown', (e) => {
            // Only prevent default for non-select elements to allow dropdown interaction
            if (e.target.tagName !== 'SELECT' && e.target.tagName !== 'OPTION') {
                e.preventDefault();
            }
        });

        // Add click outside handler to close panel
        document.addEventListener('click', (e) => {
            if (this.panel && this.panel.classList.contains('active')) {
                if (!this.panel.contains(e.target) && !this.isInputField(e.target)) {
                    this.hidePanel();
                }
            }
        });

        // Handle window resize to reposition panel
        window.addEventListener('resize', () => {
            if (this.panel && this.panel.classList.contains('active') && this.currentField) {
                this.positionPanel(this.currentField.element);
            }
        });

        // Handle scroll to reposition panel
        window.addEventListener('scroll', () => {
            if (this.panel && this.panel.classList.contains('active') && this.currentField) {
                this.positionPanel(this.currentField.element);
            }
        });
    }

    showSuggestions(fieldType, element) {
        this.currentField = { type: fieldType, element: element };

        // Position the panel next to the input field
        this.positionPanel(element);

        this.panel.classList.add('active');
        this.updateSuggestionContent(fieldType);
    }

    positionPanel(element) {
        const rect = element.getBoundingClientRect();
        const panelWidth = 320;
        const panelHeight = 500;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let left, top;

        // Calculate horizontal position
        if (rect.left > panelWidth + 20) {
            // Show on left side if there's space
            left = rect.left - panelWidth - 20;
        } else if (rect.right + panelWidth + 20 < viewportWidth) {
            // Show on right side if there's space
            left = rect.right + 20;
        } else {
            // Center on screen if no space on either side
            left = Math.max(10, (viewportWidth - panelWidth) / 2);
        }

        // Calculate vertical position
        const preferredTop = rect.top - 50;
        if (preferredTop + panelHeight < viewportHeight - 20) {
            top = Math.max(60, preferredTop);
        } else {
            // Position above the input if not enough space below
            top = Math.max(10, rect.top - panelHeight - 10);
        }

        // Ensure panel stays within viewport
        left = Math.max(10, Math.min(left, viewportWidth - panelWidth - 10));
        top = Math.max(10, Math.min(top, viewportHeight - 100));

        this.panel.style.left = left + 'px';
        this.panel.style.top = top + 'px';
    }

    hidePanel() {
        if (this.panel) {
            this.panel.classList.remove('active');
        }
    }

    isInputField(element) {
        // Check if element is one of our tracked input fields
        const inputIds = [
            'simple-purchase-price', 'simple-interest-rate', 'simple-down-payment',
            'simple-monthly-rent', 'simple-annual-expenses',
            'adv-purchase-price', 'adv-interest-rate', 'adv-down-payment-percent',
            'adv-monthly-rent', 'adv-property-tax', 'adv-insurance',
            'adv-vacancy-rate', 'adv-appreciation'
        ];
        return inputIds.includes(element.id);
    }

    updateLocation(city) {
        this.selectedLocation = city;
        localStorage.setItem('selectedLocation', city);

        // Update neighborhood dropdown
        const neighborhoodSelect = document.getElementById('neighborhood-select');
        if (city) {
            const neighborhoods = MarketDataHelper.getNeighborhoods(city);
            if (neighborhoods.length > 0) {
                neighborhoodSelect.innerHTML = `
                    <option value="">All neighborhoods</option>
                    ${neighborhoods.map(n => `<option value="${n}">${n}</option>`).join('')}
                `;
                neighborhoodSelect.style.display = 'block';
            } else {
                neighborhoodSelect.style.display = 'none';
            }
        } else {
            neighborhoodSelect.style.display = 'none';
        }

        if (this.currentField) {
            this.updateSuggestionContent(this.currentField.type);
        }
    }

    updateNeighborhood(neighborhood) {
        this.selectedNeighborhood = neighborhood;
        if (this.currentField) {
            this.updateSuggestionContent(this.currentField.type);
        }
    }

    updatePropertyType(type) {
        this.propertyType = type;
        localStorage.setItem('propertyType', type);
        if (this.currentField) {
            this.updateSuggestionContent(this.currentField.type);
        }
    }

    updateSuggestionContent(fieldType) {
        const contentDiv = document.getElementById('suggestion-content');

        if (!this.selectedLocation) {
            contentDiv.innerHTML = `
                <p class="suggestion-hint">Please select a location above to see personalized suggestions</p>
            `;
            return;
        }

        let content = '';

        switch(fieldType) {
            case 'purchasePrice':
                content = this.getPurchasePriceSuggestions();
                break;
            case 'interestRate':
                content = this.getInterestRateSuggestions();
                break;
            case 'downPayment':
                content = this.getDownPaymentSuggestions();
                break;
            case 'rent':
                content = this.getRentSuggestions();
                break;
            case 'expenses':
            case 'propertyTax':
            case 'insurance':
                content = this.getExpenseSuggestions();
                break;
            case 'vacancy':
                content = this.getVacancySuggestions();
                break;
            case 'appreciation':
                content = this.getAppreciationSuggestions();
                break;
            default:
                content = '<p class="suggestion-hint">No suggestions available for this field</p>';
        }

        contentDiv.innerHTML = content;
        this.attachSuggestionClickHandlers();
    }

    getPurchasePriceSuggestions() {
        const priceData = MarketDataHelper.getSuggestedPurchasePrice(
            this.selectedLocation,
            this.propertyType,
            this.selectedNeighborhood
        );

        if (!priceData) return '<p>No data available</p>';

        const trend = marketDatabase.regions[this.selectedLocation].appreciation;

        return `
            <div class="suggestion-section">
                <h5>Suggested Purchase Prices</h5>
                <p class="location-context">${priceData.source}</p>
                <div class="suggestion-values">
                    <div class="suggestion-item clickable" data-value="${priceData.low}">
                        <span class="label">Low Range:</span>
                        <span class="value">${MarketDataHelper.formatCurrency(priceData.low)}</span>
                        <span class="badge">Buyer's advantage</span>
                    </div>
                    <div class="suggestion-item clickable primary" data-value="${priceData.suggested}">
                        <span class="label">Median:</span>
                        <span class="value">${MarketDataHelper.formatCurrency(priceData.suggested)}</span>
                        <span class="badge">Market value</span>
                    </div>
                    <div class="suggestion-item clickable" data-value="${priceData.high}">
                        <span class="label">High Range:</span>
                        <span class="value">${MarketDataHelper.formatCurrency(priceData.high)}</span>
                        <span class="badge">Premium property</span>
                    </div>
                </div>
                <div class="market-insight">
                    <p><strong>Market Insight:</strong> Properties in ${this.selectedLocation} have appreciated ${trend}% annually. ${trend > 4 ? 'This is a high-growth market.' : trend > 2 ? 'This market shows steady growth.' : 'This is a stable market.'}</p>
                </div>
            </div>
        `;
    }

    getInterestRateSuggestions() {
        const rates = marketDatabase.nationalRates.mortgage;
        const trend = rates.trend;

        return `
            <div class="suggestion-section">
                <h5>Current Mortgage Rates</h5>
                <p class="date-context">As of ${rates.lastUpdated}</p>
                <div class="suggestion-values">
                    <div class="suggestion-item clickable primary" data-value="${rates.current30Year}">
                        <span class="label">30-Year Fixed:</span>
                        <span class="value">${rates.current30Year}%</span>
                        <span class="trend-indicator ${trend}">${trend === 'decreasing' ? '↓' : '↑'}</span>
                    </div>
                    <div class="suggestion-item clickable" data-value="${rates.current15Year}">
                        <span class="label">15-Year Fixed:</span>
                        <span class="value">${rates.current15Year}%</span>
                    </div>
                    <div class="suggestion-item clickable" data-value="${rates.fhaRate}">
                        <span class="label">FHA Loan:</span>
                        <span class="value">${rates.fhaRate}%</span>
                    </div>
                    ${this.propertyType.includes('Family') || this.propertyType.includes('Condo') ? `
                    <div class="suggestion-item clickable" data-value="${rates.vaRate}">
                        <span class="label">VA Loan:</span>
                        <span class="value">${rates.vaRate}%</span>
                    </div>` : ''}
                    <div class="suggestion-item clickable" data-value="${rates.jumboRate}">
                        <span class="label">Jumbo Loan:</span>
                        <span class="value">${rates.jumboRate}%</span>
                    </div>
                </div>
                <div class="market-insight">
                    <p><strong>Trend:</strong> Rates are ${trend}. ${trend === 'decreasing' ? 'Good time to lock in a rate.' : 'Consider shopping multiple lenders for best rates.'}</p>
                </div>
                <div class="rate-history">
                    <h6>Recent History:</h6>
                    <div class="mini-chart">
                        ${this.createMiniChart(rates.historicalData)}
                    </div>
                </div>
            </div>
        `;
    }

    getDownPaymentSuggestions() {
        const profile = MarketDataHelper.getFinancingSuggestions(this.buyerProfile);
        const rates = marketDatabase.nationalRates.downPayment;

        return `
            <div class="suggestion-section">
                <h5>Down Payment Options</h5>
                <p class="profile-context">For ${this.buyerProfile}</p>
                <div class="suggestion-values">
                    <div class="suggestion-item clickable" data-value="${rates.fha}">
                        <span class="label">FHA Minimum:</span>
                        <span class="value">${rates.fha}%</span>
                        <span class="badge">Low down</span>
                    </div>
                    <div class="suggestion-item clickable" data-value="${rates.conventional}">
                        <span class="label">Conventional:</span>
                        <span class="value">${rates.conventional}%</span>
                        <span class="badge">No PMI</span>
                    </div>
                    <div class="suggestion-item clickable primary" data-value="${rates.investmentProperty}">
                        <span class="label">Investment:</span>
                        <span class="value">${rates.investmentProperty}%</span>
                        <span class="badge">Required</span>
                    </div>
                </div>
                <div class="financing-tips">
                    <h6>Tips for ${this.buyerProfile}:</h6>
                    <ul>
                        ${profile.tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    getRentSuggestions() {
        const rentData = MarketDataHelper.getSuggestedRent(
            this.selectedLocation,
            this.propertyType,
            this.selectedNeighborhood
        );

        if (!rentData) return '<p>No data available</p>';

        const metrics = MarketDataHelper.getMarketMetrics(this.selectedLocation);

        return `
            <div class="suggestion-section">
                <h5>Rental Rate Suggestions</h5>
                <p class="location-context">${rentData.source}</p>
                <div class="suggestion-values">
                    <div class="suggestion-item clickable" data-value="${rentData.low}">
                        <span class="label">Conservative:</span>
                        <span class="value">${MarketDataHelper.formatCurrency(rentData.low)}</span>
                        <span class="badge">Quick rental</span>
                    </div>
                    <div class="suggestion-item clickable primary" data-value="${rentData.suggested}">
                        <span class="label">Market Rate:</span>
                        <span class="value">${MarketDataHelper.formatCurrency(rentData.suggested)}</span>
                        <span class="badge">Competitive</span>
                    </div>
                    <div class="suggestion-item clickable" data-value="${rentData.high}">
                        <span class="label">Premium:</span>
                        <span class="value">${MarketDataHelper.formatCurrency(rentData.high)}</span>
                        <span class="badge">Top tier</span>
                    </div>
                </div>
                <div class="market-insight">
                    <p><strong>Rent Growth:</strong> ${metrics.rentGrowth}% annually</p>
                    <p><strong>Vacancy Rate:</strong> ${metrics.vacancy}% average</p>
                    <p><strong>Cap Rate:</strong> ${metrics.capRate}% for this market</p>
                </div>
            </div>
        `;
    }

    getExpenseSuggestions() {
        const purchasePriceInput = this.currentField.element.id.includes('simple') ?
            document.getElementById('simple-purchase-price') :
            document.getElementById('adv-purchase-price');

        const purchasePrice = parseFloat(purchasePriceInput.value.replace(/[^0-9.-]+/g, '')) || 400000;
        const expenses = MarketDataHelper.getExpenseEstimates(purchasePrice, this.selectedLocation);

        return `
            <div class="suggestion-section">
                <h5>Expense Estimates</h5>
                <p class="location-context">Based on ${MarketDataHelper.formatCurrency(purchasePrice)} in ${this.selectedLocation || 'National Average'}</p>
                <div class="suggestion-values">
                    <div class="suggestion-item clickable" data-value="${expenses.propertyTax}">
                        <span class="label">Property Tax:</span>
                        <span class="value">${MarketDataHelper.formatCurrency(expenses.propertyTax)}/yr</span>
                        <span class="badge">${expenses.propertyTaxRate}%</span>
                    </div>
                    <div class="suggestion-item clickable" data-value="${expenses.insurance}">
                        <span class="label">Insurance:</span>
                        <span class="value">${MarketDataHelper.formatCurrency(expenses.insurance)}/yr</span>
                        <span class="badge">${expenses.insuranceRate}%</span>
                    </div>
                    <div class="suggestion-item clickable" data-value="${expenses.maintenance}">
                        <span class="label">Maintenance:</span>
                        <span class="value">${MarketDataHelper.formatCurrency(expenses.maintenance)}/yr</span>
                        <span class="badge">${expenses.maintenanceRate}%</span>
                    </div>
                </div>
                <div class="expense-rules">
                    <h6>Common Rules of Thumb:</h6>
                    <ul>
                        <li><strong>1% Rule:</strong> Monthly rent should be 1% of purchase price</li>
                        <li><strong>50% Rule:</strong> Expect 50% of rent to go to expenses</li>
                        <li><strong>2% Rule:</strong> For exceptional cash flow properties</li>
                    </ul>
                </div>
            </div>
        `;
    }

    getVacancySuggestions() {
        const metrics = MarketDataHelper.getMarketMetrics(this.selectedLocation);

        return `
            <div class="suggestion-section">
                <h5>Vacancy Rate Guidance</h5>
                <p class="location-context">${this.selectedLocation || 'National Average'}</p>
                <div class="suggestion-values">
                    <div class="suggestion-item clickable primary" data-value="${metrics.vacancy}">
                        <span class="label">Market Average:</span>
                        <span class="value">${metrics.vacancy}%</span>
                    </div>
                    <div class="suggestion-item clickable" data-value="${Math.max(3, metrics.vacancy - 2)}">
                        <span class="label">Well-Managed:</span>
                        <span class="value">${Math.max(3, metrics.vacancy - 2)}%</span>
                        <span class="badge">Optimistic</span>
                    </div>
                    <div class="suggestion-item clickable" data-value="${metrics.vacancy + 3}">
                        <span class="label">Conservative:</span>
                        <span class="value">${metrics.vacancy + 3}%</span>
                        <span class="badge">Safe estimate</span>
                    </div>
                </div>
                <div class="market-insight">
                    <p><strong>Tip:</strong> ${metrics.vacancy < 5 ? 'This is a strong rental market with low vacancy.' : metrics.vacancy < 7 ? 'Average vacancy rates - factor in 1 month per year.' : 'Higher vacancy market - screen tenants carefully.'}</p>
                </div>
            </div>
        `;
    }

    getAppreciationSuggestions() {
        const metrics = MarketDataHelper.getMarketMetrics(this.selectedLocation);

        return `
            <div class="suggestion-section">
                <h5>Appreciation Outlook</h5>
                <p class="location-context">${this.selectedLocation || 'National Average'}</p>
                <div class="suggestion-values">
                    <div class="suggestion-item clickable" data-value="${metrics.appreciation - 1}">
                        <span class="label">Conservative:</span>
                        <span class="value">${(metrics.appreciation - 1).toFixed(1)}%</span>
                    </div>
                    <div class="suggestion-item clickable primary" data-value="${metrics.appreciation}">
                        <span class="label">Historical Avg:</span>
                        <span class="value">${metrics.appreciation}%</span>
                        <span class="badge">Expected</span>
                    </div>
                    <div class="suggestion-item clickable" data-value="${metrics.appreciation + 1.5}">
                        <span class="label">Optimistic:</span>
                        <span class="value">${(metrics.appreciation + 1.5).toFixed(1)}%</span>
                    </div>
                </div>
                <div class="market-insight">
                    <p><strong>Market Type:</strong> ${metrics.appreciation > 5 ? 'High growth market' : metrics.appreciation > 3 ? 'Steady appreciation market' : 'Stable/mature market'}</p>
                    <p><strong>Note:</strong> Past performance doesn't guarantee future results.</p>
                </div>
            </div>
        `;
    }

    createMiniChart(data) {
        const max = Math.max(...data.map(d => d.rate));
        const min = Math.min(...data.map(d => d.rate));
        const range = max - min;

        return `
            <div class="chart-container">
                ${data.map((d, i) => {
                    const height = ((d.rate - min) / range) * 40 + 10;
                    return `
                        <div class="chart-bar" style="height: ${height}px" title="${d.date}: ${d.rate}%">
                            <span class="chart-value">${d.rate}</span>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="chart-labels">
                ${data.map(d => `<span>${d.date.split('-')[1]}</span>`).join('')}
            </div>
        `;
    }

    attachSuggestionClickHandlers() {
        const clickableItems = this.panel.querySelectorAll('.suggestion-item.clickable');
        clickableItems.forEach(item => {
            item.addEventListener('click', () => {
                const value = item.dataset.value;
                if (value && this.currentField && this.currentField.element) {
                    // Format the value based on field type
                    if (this.currentField.type === 'purchasePrice' ||
                        this.currentField.type === 'rent' ||
                        this.currentField.type === 'propertyTax' ||
                        this.currentField.type === 'insurance') {
                        this.currentField.element.value = MarketDataHelper.formatCurrency(parseFloat(value));
                    } else {
                        this.currentField.element.value = value;
                    }

                    // Trigger input event to update calculations
                    this.currentField.element.dispatchEvent(new Event('input'));

                    // Add animation feedback
                    item.classList.add('selected');
                    setTimeout(() => item.classList.remove('selected'), 300);
                }
            });
        });
    }

    detectUserLocation() {
        // Try to get user's location from browser
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // In a real app, would reverse geocode to get city
                    // For now, just set a default
                    console.log('Location detected:', position.coords);
                },
                (error) => {
                    console.log('Location detection failed:', error);
                }
            );
        }
    }

    loadUserPreferences() {
        // Load saved preferences
        const savedLocation = localStorage.getItem('selectedLocation');
        const savedPropertyType = localStorage.getItem('propertyType');

        if (savedLocation) {
            this.selectedLocation = savedLocation;
            document.getElementById('location-select').value = savedLocation;
            this.updateLocation(savedLocation);
        }

        if (savedPropertyType) {
            this.propertyType = savedPropertyType;
            document.getElementById('property-type-select').value = savedPropertyType;
        }
    }
}

// Initialize smart suggestions when document is ready
let smartSuggestions;
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if marketData is loaded
    if (typeof MarketDataHelper !== 'undefined') {
        smartSuggestions = new SmartSuggestions();
    }
});