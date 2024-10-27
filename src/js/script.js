//Reference all the necessary elements
const titleSpan = document.getElementById("title-span");
const userSelect = document.getElementById("userSelect");
const addExpenseButton = document.getElementById("add-expense");
const usersButton = document.getElementById("users-button");
const balancesButton = document.getElementById("balances-button");
const addUserButton = document.getElementById("add-user-button");
const backButtonUser = document.getElementById("back-button-user");
const backButtonExpense = document.getElementById("back-button-expense");
const confirmButtonExpense = document.getElementById("confirm-button-expense");
const confirmButtonUser = document.getElementById("confirm-button-user");
const homeButtons = document.querySelectorAll(".home-button");
const entryContainer = document.getElementById("entry-container");
const settleUpButton = document.getElementById("settle-up-button");

//Define expenseIcon and assign the correct path
const expenseIcon = new Image();
expenseIcon.src = './src/img/expense.png';

//Global arrays to store users and expenses
const users = [];
const expenses = [];

//Global state to track if expenses have been settled
let isSettled = false;

//Helper functions to reset forms
function resetUserForm() {
    document.getElementById("name").value = '';
    document.querySelectorAll('input[name="gender"]').forEach(input => input.checked = false);
    document.querySelectorAll('.icon-option').forEach(icon => icon.classList.remove('selected'));
}

function resetExpenseForm() {
    document.getElementById("amountInput").value = '';
    document.getElementById("titleInput").value = '';
    userSelect.value = '';
}

//User class
class User {
    constructor(name, gender, icon) {
        this.name = name;
        this.gender = gender;
        this.icon = icon;
        this.totalPaid = 0; 
        this.totalOwed = 0; 
    }

    static addUser(name, gender, icon) {
        const newUser = new User(name, gender, icon);
        users.push(newUser);

        //Update user dropdown
        const userOption = document.createElement("option");
        userOption.value = name;
        userOption.textContent = name;
        userSelect.appendChild(userOption);

        //Display users
        User.displayUsers();
    }

    static displayUsers() {
        const userContainer = document.getElementById("user-container");
        userContainer.innerHTML = ""; //Clear the container

        users.forEach(user => {
            const userDiv = document.createElement("div");
            userDiv.classList.add("user-entry");
            userDiv.innerHTML = `
                <img src="${user.icon}" alt="${user.name}'s icon" class="user-icon">
                <span class="user-name">${user.name}</span>
            `;
            userContainer.appendChild(userDiv);
        });
    }

    //Balance calculation with isSettled check
    static calculateBalances() {
        const totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0);
        const userCount = users.length;
        const averageExpense = userCount > 0 ? totalExpenses / userCount : 0;

        users.forEach(user => {
            if (isSettled) {
                user.totalPaid = 0; //Reset totalPaid to 0 when settled
                user.totalOwed = 0; //Reset totalOwed to 0 when settled
            } else {
                user.totalPaid = expenses
                    .filter(expense => expense.user === user.name)
                    .reduce((acc, expense) => acc + expense.amount, 0);

                user.totalOwed = Math.max(0, user.totalPaid - averageExpense);
            }
        });
    }
}

//Expense class
class Expense {
    constructor(user, title, amount, date) {
        this.user = user;
        this.title = title;
        this.amount = amount;
        this.date = date;
    }

    static addExpense(user, title, amount) {
        const newExpense = new Expense(user, title, amount, new Date().toLocaleDateString("en", { day: 'numeric', month: 'short' }));
        expenses.push(newExpense);

        //Display expense
        Expense.displayExpense(newExpense);

        //Reset the settled state as a new expense has been added
        isSettled = false;
    }

    static displayExpense(expense) {
        const expenseDiv = document.createElement("div");
        expenseDiv.classList.add("expense-entry");

        expenseDiv.innerHTML = `
            <span class="date">${expense.date}</span>
            <img src="${expenseIcon.src}" class="expense-icon">
            <div class="expense-details">
                <span class="expense-title"><strong>${expense.title}</strong></span>
                <span class="expense-quantity">${expense.user} paid ${expense.amount.toFixed(2)}€</span>
            </div>
        `;

        entryContainer.appendChild(expenseDiv);
    }
}

//Balance calculation
function displayBalances() {
    User.calculateBalances(); //Ensure balances are calculated based on isSettled state 
    const balanceContainer = document.getElementById("balance-container");
    balanceContainer.innerHTML = ""; //Clear previous balances

    users.forEach(user => {
        const userDiv = document.createElement("div");
        userDiv.innerHTML = `
            <img src="${user.icon}" alt="${user.name}'s icon" class="user-icon">
            <div>
                <span><strong>${user.name}</strong></span><br>
                <span>${user.gender === 'male' ? 'He' : 'She'} has paid ${user.totalPaid.toFixed(2)}€</span><br>
                <span>${user.gender === 'male' ? 'He' : 'She'} is owed ${user.totalOwed.toFixed(2)}€</span>
            </div>
        `;
        balanceContainer.appendChild(userDiv);
    });
}

//Settle up function
function settleUp() {
    isSettled = true; //Settle up state activated
    User.calculateBalances(); //Recalculate balances with isSettled set to true
    displayBalances(); //Refresh the balance display
}

//Event for settling up
settleUpButton.addEventListener("click", settleUp);

//Navigation and Page Control
function showPage(pageToShow) {
    document.querySelectorAll("section").forEach(section => section.classList.add("hidden"));
    document.getElementById(pageToShow).classList.remove("hidden");
    titleSpan.innerText = pageToShow.replace(/-/g, ' ').replace('page', '').toUpperCase();
}

//Check if users exist and update visibility
function checkUsersExist() {
    if (users.length === 0) {
        entryContainer.classList.add("hidden");
    } else {
        entryContainer.classList.remove("hidden");
    }
}

//Event Listeners
usersButton.addEventListener("click", () => showPage("users-page"));

balancesButton.addEventListener("click", () => {
    showPage("balances-page");
    displayBalances(); //Display balances
});

addExpenseButton.addEventListener("click", () => {
    showPage("add-expense-page");
    resetExpenseForm(); // Clear expense form so we can add other expense
});

addUserButton.addEventListener("click", () => {
    showPage("add-user-page");
    resetUserForm(); // Clear user form so we can add other user
});

confirmButtonUser.addEventListener("click", (event) => {
    event.preventDefault();
    const name = document.getElementById("name").value;
    const gender = document.querySelector('input[name="gender"]:checked')?.value;
    const icon = document.querySelector('.icon-option.selected')?.src;

    if (name && gender && icon) {
        User.addUser(name, gender, icon);
        resetUserForm();
    } else {
        alert("Please fill in all fields.");
    }
});

backButtonUser.addEventListener("click", (event) => {
    event.preventDefault();
    showPage("users-page");
});

confirmButtonExpense.addEventListener("click", (event) => {
    event.preventDefault();
    const user = userSelect.value;
    const title = document.getElementById("titleInput").value;
    const amount = parseFloat(document.getElementById("amountInput").value);

    if (user && title && !isNaN(amount)) {
        Expense.addExpense(user, title, amount);
        resetExpenseForm();
    } else {
        alert("Please fill in all fields.");
    }
});

backButtonExpense.addEventListener("click", (event) => {
    event.preventDefault();
    showPage("home-page");
});

homeButtons.forEach(button => {
    button.addEventListener("click", () => showPage("home-page"));
});

//Icon Selection Logic to remove "selected" class from every icon but chosen one by the user
document.querySelectorAll('.icon-option').forEach(icon => {
    icon.addEventListener('click', () => {
        document.querySelectorAll('.icon-option').forEach(i => i.classList.remove('selected'));
        icon.classList.add('selected');
    });
});
