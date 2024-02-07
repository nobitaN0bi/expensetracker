// Get form, expense list, and total amount elements
const expenseForm = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const totalAmountElement = document.getElementById("total-amount");

// Initialize expenses array from localStorage or as an empty array
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];


// Function to add expense
function addExpense(event) {
    event.preventDefault();

    // Get expense details from form
    const expenseNameInput = document.getElementById("expense-name");
    const expenseAmountInput = document.getElementById("expense-amount");
    const expenseDateInput = document.getElementById("expense-date");

    const expenseName = expenseNameInput.value.trim();
    const expenseAmount = parseFloat(expenseAmountInput.value);
    const expenseDate = expenseDateInput.value;

    // Clear form inputs
    expenseNameInput.value = "";
    expenseAmountInput.value = "";
    expenseDateInput.value = "";

    // Validate inputs
    if (expenseName === "" || isNaN(expenseAmount) || expenseDate === "") {
        alert("Please enter valid expense details.");
        return;
    }

    // Create new expense object
    const expense = { name: expenseName, amount: expenseAmount, date: expenseDate };

    // Add expense to expenses array
    expenses.push(expense);

    // Save expenses to localStorage
    saveExpenses();

    // Render expenses
    renderExpenses();

    // Update charts immediately after adding expense
    renderCharts();

}

// Function to delete expense
function deleteExpense(event) {
    if (event.target.classList.contains("delete-btn")) {
        // Get expense index from data-id attribute
        const expenseIndex = parseInt(event.target.getAttribute("data-id"));

        // Remove expense from expenses array
        expenses.splice(expenseIndex, 1);

        // Render expenses
        renderExpenses();

        // Update charts immediately after deleting expense
        renderCharts();

        // Save expenses to localStorage
        saveExpenses();
    }
}


// Function to delete expense
function deleteExpense(event) {
    if (event.target.classList.contains("delete-btn")) {
        // Get expense index from data-id attribute
        const expenseIndex = parseInt(event.target.getAttribute("data-id"));

        // Remove expense from expenses array
        expenses.splice(expenseIndex, 1);

        // Render expenses
        renderExpenses();

        // Update charts immediately after deleting expense
        renderCharts();
    }
}

// Function to save expenses to localStorage
function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));

}
let dailyChart, weeklyChart, monthlyChart;


// Function to render charts
function renderCharts() {

    if (dailyChart && dailyChart.canvas) dailyChart.destroy();
    if (weeklyChart && weeklyChart.canvas) weeklyChart.destroy();
    if (monthlyChart && monthlyChart.canvas) monthlyChart.destroy();

   

    // Render daily chart
    dailyChart = renderChart("daily-chart", "Daily Expenses", calculateChartData("day"));

    // Render weekly chart
    weeklyChart = renderChart("weekly-chart", "Weekly Expenses", calculateChartData("week"));

    // Render monthly chart
    monthlyChart = renderChart("monthly-chart", "Monthly Expenses", calculateChartData("month"));
}

// Function to calculate chart data based on period (day, week, month)
function calculateChartData(period) {
    const data = [];
    const currentDate = new Date();

    if (period === "day") {
        // Calculate daily expenses for the last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000);
            const dateString = date.toISOString().slice(0, 10);
            const totalExpenses = expenses.reduce((acc, expense) => {
                return expense.date === dateString ? acc + expense.amount : acc;
            }, 0);
            data.push(totalExpenses);
        }
    } else if (period === "week") {
        // Calculate weekly expenses for the last 4 weeks
        for (let i = 3; i >= 0; i--) {
            const startDate = new Date(currentDate.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
            const endDate = new Date(currentDate.getTime() - i * 7 * 24 * 60 * 60 * 1000);
            const totalExpenses = expenses.reduce((acc, expense) => {
                const expenseDate = new Date(expense.date);
                return (expenseDate >= startDate && expenseDate < endDate) ? acc + expense.amount : acc;
            }, 0);
            data.push(totalExpenses);
        }
    } else if (period === "month") {
        // Calculate monthly expenses for the last 12 months
        for (let i = 11; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = date.getMonth();
            const totalExpenses = expenses.reduce((acc, expense) => {
                const expenseDate = new Date(expense.date);
                return (expenseDate.getFullYear() === year && expenseDate.getMonth() === month) ? acc + expense.amount : acc;
            }, 0);
            data.push(totalExpenses);
        }
    }

    return data;
}

// Function to render a chart
function renderChart(canvasId, label, data) {
    const ctx = document.getElementById(canvasId).getContext("2d");

     return new Chart(ctx, {
        type: "line",
        data: {
            labels: getChartLabels(canvasId),
            datasets: [{
                label: label,
                data: data,
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}
// Function to get chart labels based on period
function getChartLabels(canvasId) {
    const period = canvasId.split("-")[0];
    const labels = [];

    if (period === "daily") {
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toISOString().slice(0, 10));
        }
    } else if (period === "weekly") {
        for (let i = 3; i >= 0; i--) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - (i + 1) * 7);
            const endDate = new Date();
            endDate.setDate(endDate.getDate() - i * 7);
            labels.push(`${startDate.toISOString().slice(0, 10)} - ${endDate.toISOString().slice(0, 10)}`);
        }
    } else if (period === "monthly") {
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            labels.push(`${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`);
        }
    }

    return labels;
}

// Function to get week number
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

// Add event listeners
expenseForm.addEventListener("submit", addExpense);
expenseList.addEventListener("click", deleteExpense);

// Function to render expenses in tabular form and update charts
function renderExpenses() {
    // Clear expense list
    expenseList.innerHTML = "";

    // Initialize total amount
    let totalAmount = 0;

    // Loop through expenses array and create table rows
    expenses.forEach((expense, index) => {
        const { name, amount, date } = expense;
        const expenseRow = document.createElement("tr");
        expenseRow.innerHTML = `
            <td>${name}</td>
            <td>Rs.${amount.toFixed(2)}</td> <!-- Change currency symbol to Rs. -->
            <td>${date}</td>
            <td class="delete-btn" data-id="${index}">Delete</td>
        `;
        expenseList.appendChild(expenseRow);

        // Update total amount
        totalAmount += amount;
    });

    // Update total amount display with currency symbol
    totalAmountElement.textContent = `Rs.${totalAmount.toFixed(2)}`;

    // Save expenses to localStorage
    saveExpenses();

    // Check if there are expenses to render charts
    
        // Render charts only if there are expenses
        renderCharts();
    
}

// Render initial expenses and charts on page load

renderExpenses();
// renderCharts();


// Add event listener for dark mode toggle
const chk = document.getElementById('chk');

chk.addEventListener('change', () => {
    document.body.classList.toggle('dark');
});


fetch('https://newsapi.org/v2/top-headlines?country=in&category=business&apiKey=e6f4a9be6d124dd38869f8824ad1fbda')
    .then(response => response.json())
    .then(data => {
        const newsDiv = document.getElementById('news');
        newsDiv.innerHTML = '<h1>5 Business News That You Might Like</h1>';
        data.articles.slice(0, 5).forEach(article => {
            const articleDiv = document.createElement('div');
            articleDiv.innerHTML = `
                <h2>${article.title}</h2>
                <p>${article.description}</p>
                <a href="${article.url}">Read more</a>
            `;
            newsDiv.appendChild(articleDiv);
        });
    })
    .catch(error => console.error('Error:', error));