let currentMode = 'simple';
let charts = {};
let currentTheme = 'light';

document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    setupInputFormatting();
    initializeTheme();
});

function initializeEventListeners() {
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchMode(this.dataset.mode);
        });
    });

    document.getElementById('theme-toggle').addEventListener('click', function() {
        toggleTheme();
    });

    document.getElementById('adv-down-payment-amount').addEventListener('input', function() {
        const purchasePrice = parseFloat(document.getElementById('adv-purchase-price').value.replace(/[^0-9.-]+/g, '')) || 0;
        if (purchasePrice > 0) {
            const percent = (parseFloat(this.value.replace(/[^0-9.-]+/g, '')) / purchasePrice * 100).toFixed(1);
            document.getElementById('adv-down-payment-percent').value = percent;
        }
    });

    document.getElementById('adv-down-payment-percent').addEventListener('input', function() {
        const purchasePrice = parseFloat(document.getElementById('adv-purchase-price').value.replace(/[^0-9.-]+/g, '')) || 0;
        const amount = purchasePrice * parseFloat(this.value) / 100;
        document.getElementById('adv-down-payment-amount').value = formatCurrencyForInput(amount);
    });
}

function setupInputFormatting() {
    const currencyInputs = [
        'simple-purchase-price', 'simple-monthly-rent',
        'adv-purchase-price', 'adv-down-payment-amount', 'adv-initial-repairs',
        'adv-monthly-rent', 'adv-property-tax', 'adv-insurance', 'adv-hoa'
    ];

    currencyInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            // Format on blur (when user clicks away)
            input.addEventListener('blur', function() {
                formatCurrencyInput(this);
            });
            
            // Format on Enter key press
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    formatCurrencyInput(this);
                    // Don't blur - let user continue typing if needed
                }
            });
            
            // Ensure value is preserved on focus
            input.addEventListener('focus', function() {
                // If the input has a formatted value, keep it visible
                if (this.value && this.value.includes('$')) {
                    // Value is already formatted, keep it
                }
            });
        }
    });
}

function formatCurrencyInput(input) {
    const rawValue = input.value.replace(/[^0-9.-]+/g, '');
    const numericValue = parseFloat(rawValue);
    
    if (!isNaN(numericValue) && numericValue > 0) {
        // Format with commas and dollar sign
        input.value = formatCurrencyForInput(numericValue);
    } else if (rawValue !== '' && !isNaN(numericValue)) {
        // Handle zero values - format them too
        input.value = formatCurrencyForInput(0);
    }
    // If rawValue is empty, don't change the input value
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    currentTheme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggle();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeToggle();

    // Recreate charts with new theme if results are visible
    if (document.getElementById('results').style.display === 'block' && Object.keys(charts).length > 0) {
        const lastCalc = window.lastCalculation;
        if (lastCalc) {
            createCharts(lastCalc);
        }
    }
}

function updateThemeToggle() {
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    if (currentTheme === 'dark') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
}

function switchMode(mode) {
    currentMode = mode;

    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    document.getElementById('simple-mode').classList.toggle('active', mode === 'simple');
    document.getElementById('advanced-mode').classList.toggle('active', mode === 'advanced');

    document.getElementById('results').style.display = 'none';
}

function calculateSimple() {
    const inputs = {
        purchasePrice: parseFloat(document.getElementById('simple-purchase-price').value.replace(/[^0-9.-]+/g, '')) || 0,
        downPaymentPercent: parseFloat(document.getElementById('simple-down-payment').value) || 20,
        interestRate: parseFloat(document.getElementById('simple-interest-rate').value) || 6.5,
        loanTerm: parseFloat(document.getElementById('simple-loan-term').value) || 30,
        monthlyRent: parseFloat(document.getElementById('simple-monthly-rent').value.replace(/[^0-9.-]+/g, '')) || 0,
        annualExpensesPercent: parseFloat(document.getElementById('simple-annual-expenses').value) || 35
    };

    if (inputs.purchasePrice === 0 || inputs.monthlyRent === 0) {
        alert('Please fill in the Purchase Price and Monthly Rent');
        return;
    }

    const calculations = performCalculations(inputs, 'simple');
    displayResults(calculations);
}

function calculateAdvanced() {
    const inputs = {
        purchasePrice: parseFloat(document.getElementById('adv-purchase-price').value.replace(/[^0-9.-]+/g, '')) || 0,
        downPaymentAmount: parseFloat(document.getElementById('adv-down-payment-amount').value.replace(/[^0-9.-]+/g, '')) || 0,
        closingCostPercent: parseFloat(document.getElementById('adv-closing-costs').value) || 3,
        initialRepairs: parseFloat(document.getElementById('adv-initial-repairs').value.replace(/[^0-9.-]+/g, '')) || 0,
        interestRate: parseFloat(document.getElementById('adv-interest-rate').value) || 6.5,
        loanTerm: parseFloat(document.getElementById('adv-loan-term').value) || 30,
        monthlyRent: parseFloat(document.getElementById('adv-monthly-rent').value.replace(/[^0-9.-]+/g, '')) || 0,
        vacancyRate: parseFloat(document.getElementById('adv-vacancy-rate').value) || 5,
        propertyTax: parseFloat(document.getElementById('adv-property-tax').value.replace(/[^0-9.-]+/g, '')) || 0,
        insurance: parseFloat(document.getElementById('adv-insurance').value.replace(/[^0-9.-]+/g, '')) || 0,
        managementFeePercent: parseFloat(document.getElementById('adv-management-fee').value) || 0,
        maintenancePercent: parseFloat(document.getElementById('adv-maintenance').value) || 1,
        hoaFees: parseFloat(document.getElementById('adv-hoa').value.replace(/[^0-9.-]+/g, '')) || 0,
        holdingPeriod: parseFloat(document.getElementById('adv-holding-period').value) || 10,
        appreciationRate: parseFloat(document.getElementById('adv-appreciation').value) || 3,
        sellingCostPercent: parseFloat(document.getElementById('adv-selling-costs').value) || 7
    };

    if (inputs.purchasePrice === 0 || inputs.monthlyRent === 0 || inputs.downPaymentAmount === 0) {
        alert('Please fill in the Purchase Price, Down Payment, and Monthly Rent');
        return;
    }

    const calculations = performCalculations(inputs, 'advanced');
    displayResults(calculations);
}

function performCalculations(inputs, mode) {
    let calc = {};

    if (mode === 'simple') {
        calc.purchasePrice = inputs.purchasePrice;
        calc.downPayment = inputs.purchasePrice * inputs.downPaymentPercent / 100;
        calc.loanAmount = calc.purchasePrice - calc.downPayment;
        calc.closingCosts = calc.purchasePrice * 0.03;
        calc.initialInvestment = calc.downPayment + calc.closingCosts;
        calc.monthlyRent = inputs.monthlyRent;
        calc.annualRent = calc.monthlyRent * 12;
        calc.annualExpenses = calc.annualRent * inputs.annualExpensesPercent / 100;
        calc.monthlyExpenses = calc.annualExpenses / 12;
        calc.holdingPeriod = 10;
        calc.appreciationRate = 3;
        calc.sellingCostPercent = 7;
        calc.vacancyRate = 5;
        calc.propertyTax = calc.purchasePrice * 0.012;
        calc.insurance = calc.purchasePrice * 0.0045;
    } else {
        calc.purchasePrice = inputs.purchasePrice;
        calc.downPayment = inputs.downPaymentAmount;
        calc.loanAmount = calc.purchasePrice - calc.downPayment;
        calc.closingCosts = calc.purchasePrice * inputs.closingCostPercent / 100;
        calc.initialRepairs = inputs.initialRepairs;
        calc.initialInvestment = calc.downPayment + calc.closingCosts + calc.initialRepairs;
        calc.monthlyRent = inputs.monthlyRent;
        calc.vacancyRate = inputs.vacancyRate;
        calc.effectiveMonthlyRent = calc.monthlyRent * (1 - calc.vacancyRate / 100);
        calc.annualRent = calc.effectiveMonthlyRent * 12;
        calc.propertyTax = inputs.propertyTax;
        calc.insurance = inputs.insurance;
        calc.managementFee = calc.monthlyRent * inputs.managementFeePercent / 100;
        calc.maintenance = calc.purchasePrice * inputs.maintenancePercent / 100 / 12;
        calc.hoaFees = inputs.hoaFees;
        calc.holdingPeriod = inputs.holdingPeriod;
        calc.appreciationRate = inputs.appreciationRate;
        calc.sellingCostPercent = inputs.sellingCostPercent;
    }

    const monthlyRate = inputs.interestRate / 100 / 12;
    const numPayments = inputs.loanTerm * 12;
    calc.monthlyMortgage = calc.loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);

    if (mode === 'simple') {
        calc.totalMonthlyExpenses = calc.monthlyMortgage + calc.monthlyExpenses;
        calc.monthlyCashFlow = calc.monthlyRent - calc.totalMonthlyExpenses;
    } else {
        calc.totalMonthlyExpenses = calc.monthlyMortgage + calc.propertyTax/12 + calc.insurance/12 +
                                   calc.managementFee + calc.maintenance + calc.hoaFees;
        calc.monthlyCashFlow = calc.effectiveMonthlyRent - calc.totalMonthlyExpenses;
    }

    calc.annualCashFlow = calc.monthlyCashFlow * 12;
    calc.cashOnCashReturn = (calc.annualCashFlow / calc.initialInvestment) * 100;

    const annualNOI = calc.annualRent - (calc.propertyTax + calc.insurance + calc.maintenance * 12 +
                                         (mode === 'advanced' ? calc.managementFee * 12 + calc.hoaFees * 12 : 0));
    calc.capRate = (annualNOI / calc.purchasePrice) * 100;

    calc.yearlyData = [];
    let remainingLoanBalance = calc.loanAmount;
    let totalCashFlow = 0;

    for (let year = 1; year <= calc.holdingPeriod; year++) {
        let yearData = { year: year };

        yearData.propertyValue = calc.purchasePrice * Math.pow(1 + calc.appreciationRate / 100, year);

        let yearlyPrincipal = 0;
        let yearlyInterest = 0;
        for (let month = 1; month <= 12; month++) {
            const monthlyInterest = remainingLoanBalance * monthlyRate;
            const monthlyPrincipal = calc.monthlyMortgage - monthlyInterest;
            yearlyPrincipal += monthlyPrincipal;
            yearlyInterest += monthlyInterest;
            remainingLoanBalance -= monthlyPrincipal;
        }

        yearData.loanBalance = Math.max(0, remainingLoanBalance);
        yearData.equity = yearData.propertyValue - yearData.loanBalance;
        yearData.cashFlow = calc.annualCashFlow;
        totalCashFlow += yearData.cashFlow;
        yearData.cumulativeCashFlow = totalCashFlow;

        const salePrice = yearData.propertyValue;
        const sellingCosts = salePrice * calc.sellingCostPercent / 100;
        const netSaleProceeds = salePrice - yearData.loanBalance - sellingCosts;
        const totalProfit = netSaleProceeds + totalCashFlow - calc.initialInvestment;
        yearData.profitIfSold = totalProfit;
        yearData.roiIfSold = (totalProfit / calc.initialInvestment) * 100;

        calc.yearlyData.push(yearData);
    }

    const finalYear = calc.yearlyData[calc.yearlyData.length - 1];
    calc.totalROI = finalYear.roiIfSold;
    calc.finalProfit = finalYear.profitIfSold;

    return calc;
}

function displayResults(calc) {
    document.getElementById('results').style.display = 'block';
    window.lastCalculation = calc; // Store for theme switching

    const cashFlowElement = document.getElementById('monthly-cashflow');
    cashFlowElement.textContent = formatCurrency(calc.monthlyCashFlow);
    cashFlowElement.className = calc.monthlyCashFlow >= 0 ? 'metric-value positive' : 'metric-value negative';

    const cocElement = document.getElementById('cash-on-cash');
    const cocValue = calc.cashOnCashReturn;
    cocElement.textContent = (cocValue >= 0 ? '+' : '') + cocValue.toFixed(2) + '%';
    cocElement.className = cocValue >= 0 ? 'metric-value positive' : 'metric-value negative';

    document.getElementById('cap-rate').textContent = calc.capRate.toFixed(2) + '%';

    const roiElement = document.getElementById('total-roi');
    const roiValue = calc.totalROI;
    roiElement.textContent = (roiValue >= 0 ? '+' : '') + roiValue.toFixed(2) + '%';
    roiElement.className = roiValue >= 0 ? 'metric-value positive' : 'metric-value negative';

    createCharts(calc);
    createBreakdownTable(calc);

    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

function createCharts(calc) {
    destroyCharts();

    const years = calc.yearlyData.map(d => `Year ${d.year}`);

    // Set chart defaults based on theme
    const isDark = currentTheme === 'dark';
    Chart.defaults.color = isDark ? '#8c8e92' : '#6A6D70';
    Chart.defaults.borderColor = isDark ? '#2a2d31' : '#E0E0E0';
    Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    Chart.defaults.font.size = 12;

    charts.profit = new Chart(document.getElementById('profit-chart'), {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'Profit if Sold',
                data: calc.yearlyData.map(d => d.profitIfSold),
                borderColor: '#5AC53B',
                backgroundColor: 'rgba(90, 197, 59, 0.1)',
                tension: 0.3,
                fill: true,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4
            }, {
                label: 'Cumulative Cash Flow',
                data: calc.yearlyData.map(d => d.cumulativeCashFlow),
                borderColor: '#F4B643',
                backgroundColor: 'rgba(244, 182, 67, 0.1)',
                tension: 0.3,
                fill: true,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12,
                            weight: '500'
                        },
                        color: isDark ? '#8c8e92' : '#6A6D70'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    grid: {
                        color: isDark ? '#2a2d31' : '#E0E0E0',
                        drawBorder: false
                    },
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value, true);
                        },
                        padding: 10
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        padding: 10
                    }
                }
            }
        }
    });

    charts.equity = new Chart(document.getElementById('equity-chart'), {
        type: 'bar',
        data: {
            labels: years,
            datasets: [{
                label: 'Equity',
                data: calc.yearlyData.map(d => d.equity),
                backgroundColor: '#5AC53B',
                borderRadius: 4
            }, {
                label: 'Loan Balance',
                data: calc.yearlyData.map(d => d.loanBalance),
                backgroundColor: '#EC5E2A',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12,
                            weight: '500'
                        },
                        color: isDark ? '#8c8e92' : '#6A6D70'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        padding: 10
                    }
                },
                y: {
                    stacked: true,
                    grid: {
                        color: isDark ? '#2a2d31' : '#E0E0E0',
                        drawBorder: false
                    },
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value, true);
                        },
                        padding: 10
                    }
                }
            }
        }
    });

    const monthlyIncome = currentMode === 'simple' ? calc.monthlyRent : calc.effectiveMonthlyRent;
    const expenses = {
        'Mortgage': calc.monthlyMortgage,
        'Property Tax': calc.propertyTax / 12,
        'Insurance': calc.insurance / 12
    };

    if (currentMode === 'advanced') {
        if (calc.managementFee > 0) expenses['Management'] = calc.managementFee;
        if (calc.maintenance > 0) expenses['Maintenance'] = calc.maintenance;
        if (calc.hoaFees > 0) expenses['HOA'] = calc.hoaFees;
    } else {
        expenses['Other Expenses'] = calc.monthlyExpenses - calc.propertyTax/12 - calc.insurance/12;
    }

    charts.cashflow = new Chart(document.getElementById('cashflow-chart'), {
        type: 'doughnut',
        data: {
            labels: ['Net Cash Flow', ...Object.keys(expenses)],
            datasets: [{
                data: [Math.max(0, calc.monthlyCashFlow), ...Object.values(expenses)],
                backgroundColor: [
                    calc.monthlyCashFlow >= 0 ? '#5AC53B' : '#EC5E2A',
                    '#F4B643',
                    '#6A6D70',
                    '#999999',
                    '#5AC53B',
                    '#EC5E2A',
                    '#D0D0D0'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12,
                            weight: '500'
                        },
                        color: isDark ? '#8c8e92' : '#6A6D70'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + formatCurrency(context.parsed);
                        }
                    }
                }
            }
        }
    });

    charts.roi = new Chart(document.getElementById('roi-chart'), {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'ROI if Sold (%)',
                data: calc.yearlyData.map(d => d.roiIfSold),
                borderColor: '#5AC53B',
                backgroundColor: 'rgba(90, 197, 59, 0.1)',
                tension: 0.3,
                fill: true,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12,
                            weight: '500'
                        },
                        color: isDark ? '#8c8e92' : '#6A6D70'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + '%';
                        }
                    }
                }
            },
            scales: {
                y: {
                    grid: {
                        color: isDark ? '#2a2d31' : '#E0E0E0',
                        drawBorder: false
                    },
                    ticks: {
                        callback: function(value) {
                            return (value >= 0 ? '+' : '') + value.toFixed(0) + '%';
                        },
                        padding: 10
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        padding: 10
                    }
                }
            }
        }
    });
}

function createBreakdownTable(calc) {
    let tableHtml = '<table><thead><tr>';
    tableHtml += '<th>Year</th>';
    tableHtml += '<th>Property Value</th>';
    tableHtml += '<th>Loan Balance</th>';
    tableHtml += '<th>Equity</th>';
    tableHtml += '<th>Annual Cash Flow</th>';
    tableHtml += '<th>Cumulative Cash Flow</th>';
    tableHtml += '<th>Profit if Sold</th>';
    tableHtml += '<th>ROI if Sold</th>';
    tableHtml += '</tr></thead><tbody>';

    calc.yearlyData.forEach(year => {
        tableHtml += '<tr>';
        tableHtml += `<td class="year-header">Year ${year.year}</td>`;
        tableHtml += `<td>${formatCurrency(year.propertyValue)}</td>`;
        tableHtml += `<td>${formatCurrency(year.loanBalance)}</td>`;
        tableHtml += `<td>${formatCurrency(year.equity)}</td>`;
        tableHtml += `<td class="${year.cashFlow >= 0 ? 'positive' : 'negative'}">${formatCurrency(year.cashFlow)}</td>`;
        tableHtml += `<td class="${year.cumulativeCashFlow >= 0 ? 'positive' : 'negative'}">${formatCurrency(year.cumulativeCashFlow)}</td>`;
        tableHtml += `<td class="${year.profitIfSold >= 0 ? 'positive' : 'negative'}">${formatCurrency(year.profitIfSold)}</td>`;
        tableHtml += `<td class="${year.roiIfSold >= 0 ? 'positive' : 'negative'}">${year.roiIfSold.toFixed(2)}%</td>`;
        tableHtml += '</tr>';
    });

    tableHtml += '</tbody></table>';
    document.getElementById('breakdown-table').innerHTML = tableHtml;
}

function destroyCharts() {
    Object.values(charts).forEach(chart => {
        if (chart) chart.destroy();
    });
    charts = {};
}

function formatCurrency(value, abbreviated = false) {
    const isNegative = value < 0;
    const absValue = Math.abs(value);
    let formatted;

    if (abbreviated && absValue >= 1000000) {
        formatted = '$' + (absValue / 1000000).toFixed(2) + 'M';
    } else if (abbreviated && absValue >= 1000) {
        formatted = '$' + (absValue / 1000).toFixed(1) + 'K';
    } else if (absValue >= 1000) {
        formatted = '$' + absValue.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    } else {
        formatted = '$' + absValue.toFixed(0);
    }

    return isNegative ? '-' + formatted : formatted;
}

// Helper function to format currency for input fields (without abbreviated format)
function formatCurrencyForInput(value) {
    const isNegative = value < 0;
    const absValue = Math.abs(value);
    
    if (absValue >= 1000) {
        const formatted = '$' + absValue.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        return isNegative ? '-' + formatted : formatted;
    } else {
        const formatted = '$' + absValue.toFixed(0);
        return isNegative ? '-' + formatted : formatted;
    }
}