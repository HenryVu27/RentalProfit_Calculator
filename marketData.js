// Market Data Database
// This module contains real estate market data for smart suggestions
// Data is organized by region and updated periodically

const marketDatabase = {
    // Current market rates (September 2024)
    nationalRates: {
        mortgage: {
            current30Year: 6.35,
            current15Year: 5.62,
            fhaRate: 6.15,
            vaRate: 5.85,
            jumboRate: 6.75,
            trend: 'decreasing',
            lastUpdated: '2024-09-16',
            historicalData: [
                { date: '2024-09', rate: 6.35 },
                { date: '2024-08', rate: 6.50 },
                { date: '2024-07', rate: 6.78 },
                { date: '2024-06', rate: 6.95 },
                { date: '2024-05', rate: 7.06 },
                { date: '2024-04', rate: 7.10 },
                { date: '2024-03', rate: 6.94 },
                { date: '2024-02', rate: 6.77 },
                { date: '2024-01', rate: 6.62 },
                { date: '2023-12', rate: 6.82 },
                { date: '2023-11', rate: 7.44 },
                { date: '2023-10', rate: 7.79 }
            ]
        },
        downPayment: {
            conventional: 20,
            fha: 3.5,
            va: 0,
            investmentProperty: 25,
            averageFirstTime: 6,
            averageRepeat: 17
        },
        expenses: {
            propertyTax: 1.2, // % of property value annually
            insurance: 0.45, // % of property value annually
            maintenance: 1.0, // % of property value annually
            propertyManagement: 8, // % of monthly rent
            vacancy: 5, // % annual vacancy rate
            capEx: 5, // % of monthly rent for capital expenditures
            utilities: 0 // If landlord pays
        },
        returns: {
            avgCapRate: 8.5,
            avgCashOnCash: 8.0,
            avgAppreciation: 3.5
        }
    },

    // Regional market data (top US markets)
    regions: {
        'New York, NY': {
            medianPrice: 750000,
            medianRent: 3500,
            propertyTax: 1.925,
            insurance: 0.55,
            appreciation: 3.8,
            rentGrowth: 4.2,
            vacancy: 3.5,
            capRate: 4.5,
            neighborhoods: {
                'Manhattan': { medianPrice: 1350000, medianRent: 4800 },
                'Brooklyn': { medianPrice: 850000, medianRent: 3200 },
                'Queens': { medianPrice: 650000, medianRent: 2800 },
                'Bronx': { medianPrice: 450000, medianRent: 2200 },
                'Staten Island': { medianPrice: 550000, medianRent: 2400 }
            }
        },
        'Los Angeles, CA': {
            medianPrice: 950000,
            medianRent: 3200,
            propertyTax: 0.75,
            insurance: 0.42,
            appreciation: 5.2,
            rentGrowth: 3.8,
            vacancy: 4.2,
            capRate: 5.2,
            neighborhoods: {
                'Beverly Hills': { medianPrice: 2500000, medianRent: 6500 },
                'Santa Monica': { medianPrice: 1400000, medianRent: 4200 },
                'Downtown LA': { medianPrice: 750000, medianRent: 3000 },
                'Hollywood': { medianPrice: 850000, medianRent: 3100 },
                'Pasadena': { medianPrice: 950000, medianRent: 3300 }
            }
        },
        'Chicago, IL': {
            medianPrice: 350000,
            medianRent: 2200,
            propertyTax: 2.1,
            insurance: 0.48,
            appreciation: 2.8,
            rentGrowth: 2.5,
            vacancy: 5.8,
            capRate: 7.8,
            neighborhoods: {
                'Lincoln Park': { medianPrice: 550000, medianRent: 2800 },
                'Loop': { medianPrice: 450000, medianRent: 2600 },
                'Wicker Park': { medianPrice: 480000, medianRent: 2400 },
                'Hyde Park': { medianPrice: 320000, medianRent: 1900 },
                'Logan Square': { medianPrice: 420000, medianRent: 2200 }
            }
        },
        'Houston, TX': {
            medianPrice: 340000,
            medianRent: 1850,
            propertyTax: 1.81,
            insurance: 0.65,
            appreciation: 4.1,
            rentGrowth: 3.2,
            vacancy: 6.5,
            capRate: 8.5,
            neighborhoods: {
                'River Oaks': { medianPrice: 1200000, medianRent: 4500 },
                'The Heights': { medianPrice: 450000, medianRent: 2200 },
                'Midtown': { medianPrice: 380000, medianRent: 2000 },
                'Sugar Land': { medianPrice: 420000, medianRent: 2100 },
                'Katy': { medianPrice: 350000, medianRent: 1900 }
            }
        },
        'Phoenix, AZ': {
            medianPrice: 430000,
            medianRent: 1950,
            propertyTax: 0.63,
            insurance: 0.38,
            appreciation: 6.2,
            rentGrowth: 5.5,
            vacancy: 4.8,
            capRate: 7.2,
            neighborhoods: {
                'Scottsdale': { medianPrice: 680000, medianRent: 2800 },
                'Tempe': { medianPrice: 420000, medianRent: 1900 },
                'Chandler': { medianPrice: 450000, medianRent: 2000 },
                'Mesa': { medianPrice: 380000, medianRent: 1700 },
                'Gilbert': { medianPrice: 490000, medianRent: 2100 }
            }
        },
        'Philadelphia, PA': {
            medianPrice: 280000,
            medianRent: 1750,
            propertyTax: 1.4,
            insurance: 0.52,
            appreciation: 3.5,
            rentGrowth: 3.1,
            vacancy: 5.2,
            capRate: 8.2,
            neighborhoods: {
                'Center City': { medianPrice: 420000, medianRent: 2400 },
                'University City': { medianPrice: 350000, medianRent: 2000 },
                'Fishtown': { medianPrice: 380000, medianRent: 1900 },
                'South Philadelphia': { medianPrice: 260000, medianRent: 1500 },
                'Northern Liberties': { medianPrice: 410000, medianRent: 2100 }
            }
        },
        'San Antonio, TX': {
            medianPrice: 285000,
            medianRent: 1450,
            propertyTax: 1.85,
            insurance: 0.58,
            appreciation: 3.8,
            rentGrowth: 3.5,
            vacancy: 6.2,
            capRate: 8.8,
            neighborhoods: {
                'Alamo Heights': { medianPrice: 580000, medianRent: 2200 },
                'Stone Oak': { medianPrice: 380000, medianRent: 1800 },
                'Downtown': { medianPrice: 320000, medianRent: 1600 },
                'Medical Center': { medianPrice: 290000, medianRent: 1500 },
                'Boerne': { medianPrice: 420000, medianRent: 1900 }
            }
        },
        'San Diego, CA': {
            medianPrice: 850000,
            medianRent: 3000,
            propertyTax: 0.78,
            insurance: 0.40,
            appreciation: 4.8,
            rentGrowth: 4.1,
            vacancy: 3.8,
            capRate: 5.5,
            neighborhoods: {
                'La Jolla': { medianPrice: 1800000, medianRent: 5200 },
                'Downtown': { medianPrice: 750000, medianRent: 3200 },
                'Pacific Beach': { medianPrice: 950000, medianRent: 3400 },
                'North Park': { medianPrice: 780000, medianRent: 2800 },
                'Chula Vista': { medianPrice: 650000, medianRent: 2500 }
            }
        },
        'Dallas, TX': {
            medianPrice: 385000,
            medianRent: 1950,
            propertyTax: 1.75,
            insurance: 0.62,
            appreciation: 4.5,
            rentGrowth: 3.8,
            vacancy: 5.5,
            capRate: 7.9,
            neighborhoods: {
                'Highland Park': { medianPrice: 1500000, medianRent: 5000 },
                'Uptown': { medianPrice: 480000, medianRent: 2400 },
                'Deep Ellum': { medianPrice: 420000, medianRent: 2100 },
                'Plano': { medianPrice: 450000, medianRent: 2200 },
                'Frisco': { medianPrice: 520000, medianRent: 2500 }
            }
        },
        'Austin, TX': {
            medianPrice: 550000,
            medianRent: 2400,
            propertyTax: 1.68,
            insurance: 0.55,
            appreciation: 5.8,
            rentGrowth: 4.5,
            vacancy: 4.2,
            capRate: 6.8,
            neighborhoods: {
                'Downtown': { medianPrice: 680000, medianRent: 3200 },
                'South Congress': { medianPrice: 620000, medianRent: 2800 },
                'East Austin': { medianPrice: 480000, medianRent: 2200 },
                'Westlake': { medianPrice: 1200000, medianRent: 4500 },
                'Round Rock': { medianPrice: 420000, medianRent: 2000 }
            }
        }
    },

    // Property type multipliers
    propertyTypes: {
        'Single Family': { priceMultiplier: 1.0, rentMultiplier: 1.0, expenseMultiplier: 1.0 },
        'Condo': { priceMultiplier: 0.85, rentMultiplier: 0.9, expenseMultiplier: 0.8 },
        'Townhouse': { priceMultiplier: 0.9, rentMultiplier: 0.95, expenseMultiplier: 0.9 },
        'Multi-Family (2-4 units)': { priceMultiplier: 1.5, rentMultiplier: 1.8, expenseMultiplier: 1.2 },
        'Small Apartment (5-20 units)': { priceMultiplier: 3.5, rentMultiplier: 4.2, expenseMultiplier: 1.3 },
        'Large Apartment (20+ units)': { priceMultiplier: 8.0, rentMultiplier: 10.0, expenseMultiplier: 1.4 }
    },

    // Financing suggestions based on buyer type
    buyerProfiles: {
        'First-Time Buyer': {
            suggestedDownPayment: 5,
            loanTypes: ['FHA', 'Conventional'],
            tips: ['Consider FHA loans with 3.5% down', 'Look into first-time buyer programs', 'Budget for closing costs (2-3% of purchase price)']
        },
        'Move-Up Buyer': {
            suggestedDownPayment: 10,
            loanTypes: ['Conventional'],
            tips: ['Consider using equity from current home', 'Shop around for best rates', 'Consider 15-year mortgage for faster equity building']
        },
        'Investment Property': {
            suggestedDownPayment: 25,
            loanTypes: ['Conventional Investment', 'Portfolio Loan'],
            tips: ['Higher down payment required for investment properties', 'Expect higher interest rates', 'Consider cash flow over appreciation']
        },
        'Cash Buyer': {
            suggestedDownPayment: 100,
            loanTypes: ['Cash'],
            tips: ['Negotiate for better price with cash offer', 'Consider opportunity cost of cash', 'Still get inspection and appraisal']
        }
    },

    // Market indicators
    marketIndicators: {
        'Buyer\'s Market': {
            inventoryMonths: '>6',
            priceNegotiation: '5-10% below asking',
            daysOnMarket: '>60',
            tips: ['More negotiation power', 'Take time to find perfect property', 'Ask for seller concessions']
        },
        'Balanced Market': {
            inventoryMonths: '4-6',
            priceNegotiation: '0-3% below asking',
            daysOnMarket: '30-60',
            tips: ['Fair negotiations for both parties', 'Properties sell at reasonable pace', 'Good time for both buyers and sellers']
        },
        'Seller\'s Market': {
            inventoryMonths: '<4',
            priceNegotiation: 'At or above asking',
            daysOnMarket: '<30',
            tips: ['Act quickly on good properties', 'Be prepared for bidding wars', 'Get pre-approved before shopping']
        }
    }
};

// Helper functions for smart suggestions
const MarketDataHelper = {
    // Get current mortgage rate based on loan type
    getMortgageRate: function(loanType = '30year') {
        const rates = marketDatabase.nationalRates.mortgage;
        switch(loanType) {
            case '15year': return rates.current15Year;
            case 'fha': return rates.fhaRate;
            case 'va': return rates.vaRate;
            case 'jumbo': return rates.jumboRate;
            default: return rates.current30Year;
        }
    },

    // Get location-specific data
    getLocationData: function(city) {
        return marketDatabase.regions[city] || null;
    },

    // Get neighborhood data
    getNeighborhoodData: function(city, neighborhood) {
        const cityData = this.getLocationData(city);
        if (cityData && cityData.neighborhoods) {
            return cityData.neighborhoods[neighborhood] || null;
        }
        return null;
    },

    // Calculate suggested purchase price based on location and property type
    getSuggestedPurchasePrice: function(location, propertyType = 'Single Family', neighborhood = null) {
        const cityData = this.getLocationData(location);
        if (!cityData) return null;

        let basePrice = cityData.medianPrice;
        if (neighborhood) {
            const neighborhoodData = this.getNeighborhoodData(location, neighborhood);
            if (neighborhoodData) {
                basePrice = neighborhoodData.medianPrice;
            }
        }

        const typeMultiplier = marketDatabase.propertyTypes[propertyType]?.priceMultiplier || 1;
        return {
            suggested: Math.round(basePrice * typeMultiplier),
            low: Math.round(basePrice * typeMultiplier * 0.85),
            high: Math.round(basePrice * typeMultiplier * 1.15),
            median: basePrice,
            source: neighborhood ? `${neighborhood}, ${location}` : location
        };
    },

    // Calculate suggested rent based on location and property type
    getSuggestedRent: function(location, propertyType = 'Single Family', neighborhood = null) {
        const cityData = this.getLocationData(location);
        if (!cityData) return null;

        let baseRent = cityData.medianRent;
        if (neighborhood) {
            const neighborhoodData = this.getNeighborhoodData(location, neighborhood);
            if (neighborhoodData) {
                baseRent = neighborhoodData.medianRent;
            }
        }

        const typeMultiplier = marketDatabase.propertyTypes[propertyType]?.rentMultiplier || 1;
        return {
            suggested: Math.round(baseRent * typeMultiplier),
            low: Math.round(baseRent * typeMultiplier * 0.9),
            high: Math.round(baseRent * typeMultiplier * 1.1),
            median: baseRent,
            source: neighborhood ? `${neighborhood}, ${location}` : location
        };
    },

    // Get expense estimates based on location
    getExpenseEstimates: function(purchasePrice, location) {
        const cityData = this.getLocationData(location);
        const national = marketDatabase.nationalRates.expenses;

        const propertyTax = cityData ? cityData.propertyTax : national.propertyTax;
        const insurance = cityData ? cityData.insurance : national.insurance;

        return {
            propertyTax: Math.round(purchasePrice * propertyTax / 100),
            insurance: Math.round(purchasePrice * insurance / 100),
            maintenance: Math.round(purchasePrice * national.maintenance / 100),
            propertyTaxRate: propertyTax,
            insuranceRate: insurance,
            maintenanceRate: national.maintenance
        };
    },

    // Get market metrics for a location
    getMarketMetrics: function(location) {
        const cityData = this.getLocationData(location);
        if (!cityData) {
            return {
                capRate: marketDatabase.nationalRates.returns.avgCapRate,
                appreciation: marketDatabase.nationalRates.returns.avgAppreciation,
                rentGrowth: 3.0,
                vacancy: marketDatabase.nationalRates.expenses.vacancy
            };
        }

        return {
            capRate: cityData.capRate,
            appreciation: cityData.appreciation,
            rentGrowth: cityData.rentGrowth,
            vacancy: cityData.vacancy
        };
    },

    // Get financing suggestions based on buyer profile
    getFinancingSuggestions: function(buyerType = 'First-Time Buyer') {
        return marketDatabase.buyerProfiles[buyerType] || marketDatabase.buyerProfiles['First-Time Buyer'];
    },

    // Get all available cities
    getAvailableCities: function() {
        return Object.keys(marketDatabase.regions);
    },

    // Get neighborhoods for a city
    getNeighborhoods: function(city) {
        const cityData = this.getLocationData(city);
        return cityData ? Object.keys(cityData.neighborhoods) : [];
    },

    // Format currency for display
    formatCurrency: function(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },

    // Format percentage for display
    formatPercent: function(value) {
        return `${value.toFixed(2)}%`;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { marketDatabase, MarketDataHelper };
}