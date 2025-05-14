// Initialize global variables
let budget = 0;
let totalEarnings = 0;
let totalSpending = 0;
let totalExpenses = 0;
let savingGoal = 0;
let transactions = [];

let financeChart;
let categoryChart;

// Set budget
function setBudget() {
    const input = document.getElementById('budgetInput').value;
    if (input <= 0 || isNaN(input)) {
        alert('Please enter a valid budget.');
        return;
    }
    budget = parseFloat(input);
    document.getElementById('budgetMessage').innerText = `Your budget is set to ₹${budget.toFixed(2)}`;
    updateBudgetStatus();

}
function setSavingGoal() {
    const inputElement = document.getElementById('savingGoalInput');
    if (!inputElement) return;

    const input = inputElement.value;
    if (input <= 0 || isNaN(input)) {
        alert('Please enter a valid saving goal.');
        return;
    }
    savingGoal = parseFloat(input);
    localStorage.setItem('savingGoal', savingGoal);  // Save it
    checkSavingGoal?.();
    alert(`Saving goal set to ₹${savingGoal}`);
}

// Timestamp generator
function getTimestamp() {
    const now = new Date();
    return now.toLocaleString();
}

// Add earnings
function addEarnings() {
    const amount = document.getElementById('earningsAmount').value;
    const category = document.getElementById('earningsCategory').value;
    if (amount <= 0 || isNaN(amount) || category.trim() === '') {
        alert('Please enter valid earnings details.');
        return;
    }
    totalEarnings += parseFloat(amount);
    transactions.push({ type: 'Earnings', amount: parseFloat(amount), category, timestamp: getTimestamp() });
    updateEverything();
}

// Add spending
function addSpending() {
    const amount = document.getElementById('spendingAmount').value;
    const category = document.getElementById('spendingCategory').value;
    if (amount <= 0 || isNaN(amount) || category.trim() === '') {
        alert('Please enter valid spending details.');
        return;
    }
    totalSpending += parseFloat(amount);
    transactions.push({ type: 'Spending', amount: parseFloat(amount), category, timestamp: getTimestamp() });
    updateEverything();
}

// Add expense
function addExpense() {
    const amount = document.getElementById('expenseAmount').value;
    const category = document.getElementById('expenseCategory').value;
    if (amount <= 0 || isNaN(amount) || category.trim() === '') {
        alert('Please enter valid expense details.');
        return;
    }
    totalExpenses += parseFloat(amount);
    transactions.push({ type: 'Expense', amount: parseFloat(amount), category, timestamp: getTimestamp() });
    updateEverything();
}

// Update all UI
function updateEverything() {
    updateBudgetStatus();
    displayTransactions();
    updateCharts();
    updateCategoryChart();
    checkSavingGoal();
}

// Update budget status
function updateBudgetStatus() {
    const remaining = budget + totalEarnings - totalSpending - totalExpenses;
    document.getElementById('totalEarnings').innerText = `₹${totalEarnings.toFixed(2)}`;
    document.getElementById('totalSpending').innerText = `₹${totalSpending.toFixed(2)}`;
    document.getElementById('totalExpenses').innerText = `₹${totalExpenses.toFixed(2)}`;
    document.getElementById('remainingBudget').innerText = `₹${remaining.toFixed(2)}`;
}

// Display transactions
function displayTransactions() {
    const list = document.getElementById('transactionList');
    list.innerHTML = '';
    transactions.forEach(t => {
        const item = document.createElement('li');
        item.innerText = `${t.type}: ₹${t.amount.toFixed(2)} - ${t.category} - ${t.timestamp}`;
        list.appendChild(item);
    });
}

// Update main finance chart
function updateCharts() {
    const ctx = document.getElementById('financeChart').getContext('2d');
    if (financeChart) financeChart.destroy();
    financeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Earnings', 'Spending', 'Expenses'],
            datasets: [{
                label: 'Amount (₹)',
                data: [totalEarnings, totalSpending, totalExpenses],
                backgroundColor: ['#4CAF50', '#FF6384', '#FFCE56']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: 'Your Financial Summary' }
            }
        }
    });
}

// Update category pie chart
function updateCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    if (categoryChart) categoryChart.destroy();

    const categoryTotals = {};
    transactions.forEach(t => {
        if (t.type === 'Spending' || t.type === 'Expense') {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        }
    });

    const categories = Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);

    categoryChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: 'Category-wise Expenses' }
            }
        }
    });
}

// Saving Goal functionality
function setSavingGoal() {
    const input = document.getElementById('savingGoalInput').value;
    if (input <= 0 || isNaN(input)) {
        alert('Please enter a valid saving goal.');
        return;
    }
    savingGoal = parseFloat(input);
    checkSavingGoal();
    alert(`Saving goal set to ₹${savingGoal}`);
}

function checkSavingGoal() {
    const saved = budget + totalEarnings - totalSpending - totalExpenses;
    const status = document.getElementById('savingGoalStatus');

    if (savingGoal > 0) {
        if (saved >= savingGoal) {
            status.innerText = `🎉 Congratulations! Saving goal ₹${savingGoal} achieved!`;
        } else {
            const remain = savingGoal - saved;
            status.innerText = `You need ₹${remain.toFixed(2)} more to reach your goal.`;
        }
    }
}

// Export transactions to Excel
function exportToExcel() {
    const worksheet = XLSX.utils.json_to_sheet(transactions);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    XLSX.writeFile(workbook, "finance_data.xlsx");
}

// Export transactions to PDF
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Transaction History', 14, 22);

    let y = 30;
    transactions.forEach(t => {
        doc.setFontSize(12);
        doc.text(`${t.type}: ₹${t.amount.toFixed(2)} - ${t.category} - ${t.timestamp}`, 14, y);
        y += 10;
        if (y > 280) { // simple page break
            doc.addPage();
            y = 20;
        }
    });

    doc.save('finance_data.pdf');
}
