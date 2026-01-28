// ===== Demo User =====
const DEMO_USER = {
  email: "demo@neobank.com",
  password: "demo123",
  name: "Pavan",
};

// ===== State =====
const initialState = () => ({
  isLoggedIn: false,
  balances: {
    savings: 75000,
    checking: 42000,
  },
  transactions: [
    makeTx("credit", "Salary credited", 60000),
    makeTx("debit", "Groceries", 1800),
    makeTx("transfer", "Savings → Checking", 5000),
  ],
});

let state = initialState();

function makeTx(type, details, amount) {
  return {
    id: `${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`,
    date: new Date().toISOString(),
    type,   // credit | debit | transfer
    details,
    amount: Number(amount),
  };
}

// ===== Elements =====
const yearEl = document.getElementById("year");

// Navbar
const hamburgerBtn = document.getElementById("hamburgerBtn");
const mobileNav = document.getElementById("mobileNav");

// Landing mini dashboard
const landingTotal = document.getElementById("landingTotal");
const landingSavings = document.getElementById("landingSavings");
const landingChecking = document.getElementById("landingChecking");

// Modal
const loginModal = document.getElementById("loginModal");
const closeOverlay = document.getElementById("closeOverlay");
const closeLoginBtn = document.getElementById("closeLoginBtn");

const openLoginBtn = document.getElementById("openLoginBtn");
const openLoginBtn2 = document.getElementById("openLoginBtn2");
const openLoginBtnHero = document.getElementById("openLoginBtnHero");
const openLoginBtnMobile = document.getElementById("openLoginBtnMobile");
const openLoginBtnMobile2 = document.getElementById("openLoginBtnMobile2");

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

// Dashboard
const dashboard = document.getElementById("dashboard");
const logoutBtn = document.getElementById("logoutBtn");
const backToSiteBtn = document.getElementById("backToSiteBtn");
const userNameEl = document.getElementById("userName");

const totalBalanceEl = document.getElementById("totalBalance");
const savingsBalanceEl = document.getElementById("savingsBalance");
const checkingBalanceEl = document.getElementById("checkingBalance");

// Transfers
const transferForm = document.getElementById("transferForm");
const fromAccountEl = document.getElementById("fromAccount");
const toAccountEl = document.getElementById("toAccount");
const amountEl = document.getElementById("amount");
const transferError = document.getElementById("transferError");
const transferSuccess = document.getElementById("transferSuccess");

// Transactions
const txBody = document.getElementById("txBody");
const txSearch = document.getElementById("txSearch");
const txFilter = document.getElementById("txFilter");

// Quick actions
const addCreditBtn = document.getElementById("addCreditBtn");
const addDebitBtn = document.getElementById("addDebitBtn");
const resetBtn = document.getElementById("resetBtn");

// ===== Init =====
yearEl.textContent = new Date().getFullYear();
renderLanding();
renderBalances();
renderTransactions();
wireEvents();

// ===== Events =====
function wireEvents() {
  hamburgerBtn?.addEventListener("click", () => {
    mobileNav.classList.toggle("show");
  });

  [openLoginBtn, openLoginBtn2, openLoginBtnHero, openLoginBtnMobile, openLoginBtnMobile2]
    .forEach(btn => btn?.addEventListener("click", openLogin));

  closeOverlay?.addEventListener("click", closeLogin);
  closeLoginBtn?.addEventListener("click", closeLogin);

  loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    handleLogin();
  });

  logoutBtn?.addEventListener("click", () => {
    state.isLoggedIn = false;
    dashboard.hidden = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  backToSiteBtn?.addEventListener("click", () => {
    dashboard.hidden = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  transferForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    handleTransfer();
  });

  txSearch?.addEventListener("input", renderTransactions);
  txFilter?.addEventListener("change", renderTransactions);

  addCreditBtn?.addEventListener("click", () => {
    if (!state.isLoggedIn) return flashError("Login required to add demo entries.");
    state.balances.checking += 1000;
    state.transactions.unshift(makeTx("credit", "Manual credit", 1000));
    renderAll();
    flashSuccess("₹1000 credit added to Checking.");
  });

  addDebitBtn?.addEventListener("click", () => {
    if (!state.isLoggedIn) return flashError("Login required to add demo entries.");
    if (state.balances.checking < 500) return flashError("Insufficient funds for debit.");
    state.balances.checking -= 500;
    state.transactions.unshift(makeTx("debit", "Manual debit", 500));
    renderAll();
    flashSuccess("₹500 debit added from Checking.");
  });

  resetBtn?.addEventListener("click", () => {
    state = initialState();
    dashboard.hidden = true;
    closeLogin();
    renderAll();
  });
}

// ===== Modal =====
function openLogin() {
  loginError.textContent = "";
  loginModal.classList.add("show");
  loginModal.setAttribute("aria-hidden", "false");
}

function closeLogin() {
  loginModal.classList.remove("show");
  loginModal.setAttribute("aria-hidden", "true");
}

// ===== Auth =====
function handleLogin() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const ok = email === DEMO_USER.email && password === DEMO_USER.password;
  if (!ok) {
    loginError.textContent = "Invalid credentials. Use demo@neobank.com / demo123";
    return;
  }

  state.isLoggedIn = true;
  userNameEl.textContent = DEMO_USER.name;

  closeLogin();
  dashboard.hidden = false;
  dashboard.scrollIntoView({ behavior: "smooth", block: "start" });

  renderAll();
}

// ===== Transfer =====
function handleTransfer() {
  clearMessages();
  if (!state.isLoggedIn) return flashError("Please login first.");

  const from = fromAccountEl.value;
  const to = toAccountEl.value;
  const amount = Number(amountEl.value);

  if (from === to) return flashError("From and To accounts must be different.");
  if (!Number.isFinite(amount) || amount <= 0) return flashError("Enter a valid amount.");
  if (state.balances[from] < amount) return flashError(`Insufficient funds in ${cap(from)}.`);

  state.balances[from] -= amount;
  state.balances[to] += amount;

  state.transactions.unshift(makeTx("transfer", `${cap(from)} → ${cap(to)}`, amount));

  renderAll();
  flashSuccess(`Transfer successful: ₹${formatINR(amount)} moved to ${cap(to)}.`);
  transferForm.reset();
}

// ===== Render =====
function renderAll() {
  renderLanding();
  renderBalances();
  renderTransactions();
}

function renderLanding() {
  const total = state.balances.savings + state.balances.checking;
  landingTotal.textContent = formatINR(total);
  landingSavings.textContent = formatINR(state.balances.savings);
  landingChecking.textContent = formatINR(state.balances.checking);
}

function renderBalances() {
  const total = state.balances.savings + state.balances.checking;
  if (totalBalanceEl) totalBalanceEl.textContent = formatINR(total);
  if (savingsBalanceEl) savingsBalanceEl.textContent = formatINR(state.balances.savings);
  if (checkingBalanceEl) checkingBalanceEl.textContent = formatINR(state.balances.checking);
}

function renderTransactions() {
  if (!txBody) return;

  const q = (txSearch?.value || "").trim().toLowerCase();
  const f = txFilter?.value || "all";

  const filtered = state.transactions.filter((t) => {
    const matchText =
      t.type.toLowerCase().includes(q) ||
      t.details.toLowerCase().includes(q) ||
      String(t.amount).includes(q);

    const matchFilter = (f === "all") ? true : t.type === f;
    return matchText && matchFilter;
  });

  txBody.innerHTML = filtered.map((t) => {
    const date = new Date(t.date).toLocaleString();
    const sign = (t.type === "debit") ? "-" : "+";
    const amt = `${sign}₹${formatINR(t.amount)}`;

    return `
      <tr>
        <td>${esc(date)}</td>
        <td><span class="pill">${esc(cap(t.type))}</span></td>
        <td>${esc(t.details)}</td>
        <td class="right"><b>${esc(amt)}</b></td>
      </tr>
    `;
  }).join("");
}

// ===== Helpers =====
function formatINR(n){ return Number(n).toLocaleString("en-IN"); }
function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
function esc(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function clearMessages(){
  if (transferError) transferError.textContent = "";
  if (transferSuccess) transferSuccess.textContent = "";
}
function flashError(msg){
  if (transferError) transferError.textContent = msg;
  setTimeout(() => { if (transferError) transferError.textContent = ""; }, 2500);
}
function flashSuccess(msg){
  if (transferSuccess) transferSuccess.textContent = msg;
  setTimeout(() => { if (transferSuccess) transferSuccess.textContent = ""; }, 2500);
}
