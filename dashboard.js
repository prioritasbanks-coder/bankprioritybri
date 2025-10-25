// ============================
// KONFIGURASI JSONBIN
// ============================
const JSONBIN_API_KEY = "$2a$10$4UbVC59lWot/ifJrSz8Kget1iXAPeK2LGA3w0/jSF3iwYO2UleRla";
const BIN_ID_USERS = "68fc8b9e43b1c97be97f60b6";
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID_USERS}`;

// ============================
// ELEMEN DOM
// ============================
const welcomeMsg = document.getElementById("welcomeMsg");
const balanceEl = document.getElementById("balance");
const accountNumberEl = document.getElementById("accountNumber");
const toggleBalanceBtn = document.getElementById("toggleBalance");

const btnLogout = document.getElementById("btnLogout");

const btnTopup = document.getElementById("btnTopup");
const btnReceive = document.getElementById("btnReceive");
const btnTransfer = document.getElementById("btnTransfer");
const btnPay = document.getElementById("btnPay");
const btnQR = document.getElementById("btnQR");

const historyList = document.getElementById("historyList");

// Modal
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");

// ============================
// AMBIL USER DARI LOCALSTORAGE
// ============================
let currentUser = JSON.parse(localStorage.getItem("bki_user"));
if (!currentUser) {
  alert("Silakan login terlebih dahulu!");
  window.location.href = "index.html";
}

// ============================
// FUNGSI AMBIL & UPDATE USERS JSONBIN
// ============================
async function getUsers() {
  const res = await fetch(JSONBIN_URL, {
    headers: { "X-Master-Key": JSONBIN_API_KEY }
  });
  const data = await res.json();
  return data.record.users || [];
}

async function updateUsers(users) {
  await fetch(JSONBIN_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": JSONBIN_API_KEY
    },
    body: JSON.stringify({ users })
  });
}

// ============================
// RENDER USER TERBARU
// ============================
async function renderUser() {
  let users = await getUsers();
  const user = users.find(u => u.email === currentUser.email);

  if (!user) return alert("User tidak ditemukan!");

  currentUser = user; // update data terbaru

  // Welcome
  welcomeMsg.textContent = `Selamat datang, ${currentUser.fullname}`;

  // Saldo & VA
  balanceEl.textContent = currentUser.balance
    ? `Rp${currentUser.balance.toLocaleString()}`
    : "Rp0";

  accountNumberEl.textContent = currentUser.accountNumber
    ? currentUser.accountNumber
    : "0";

  // Riwayat transaksi
  historyList.innerHTML = "";
  if (!currentUser.transactions || currentUser.transactions.length === 0) {
    const li = document.createElement("li");
    li.classList.add("empty");
    li.textContent = "Belum ada transaksi";
    historyList.appendChild(li);
  } else {
    currentUser.transactions.slice().reverse().forEach(tx => {
      const li = document.createElement("li");
      li.textContent = `[${tx.date}] ${tx.type} - Rp${tx.amount.toLocaleString()} ${tx.desc || ""}`;
      historyList.appendChild(li);
    });
  }

  // Atur fitur: hanya VA aktif sebelum akun diaktifkan
  if (!currentUser.isActive) {
    setFeatureDisabled(true);
  } else {
    setFeatureDisabled(false);
  }
}

// ============================
// DISABLED / ENABLE FITUR
// ============================
function setFeatureDisabled(disabled) {
  [btnTopup, btnReceive, btnTransfer, btnPay, btnQR].forEach(btn => {
    if (disabled) {
      btn.classList.add("disabled");
    } else {
      btn.classList.remove("disabled");
    }
  });
}

// ============================
// TOGGLE HIDE/SHOW SALDO
// ============================
let hideBalance = false;
toggleBalanceBtn.addEventListener("click", () => {
  hideBalance = !hideBalance;
  balanceEl.textContent = hideBalance
    ? "••••••"
    : currentUser.balance
    ? `Rp${currentUser.balance.toLocaleString()}`
    : "Rp0";
});

// ============================
// LOGOUT
// ============================
btnLogout.addEventListener("click", () => {
  localStorage.removeItem("bki_user");
  window.location.href = "index.html";
});

// ============================
// MODAL UTILITY
// ============================
function openModal(title, contentHTML) {
  modalTitle.textContent = title;
  modalBody.innerHTML = contentHTML;
  modal.classList.remove("hidden");
  modal.classList.add("show");
}

function closeModal() {
  modal.classList.remove("show");
  modal.classList.add("hidden");
}

modalClose.addEventListener("click", closeModal);

// ============================
// FITUR KLIK
// ============================
function featureClick(btn, callback) {
  btn.addEventListener("click", () => {
    if (!currentUser.isActive) {
      openModal(
        "Aktivasi Akun",
        `<p>Silahkan transfer Rp500.000 ke Virtual Account Anda: ${currentUser.accountNumber || "0"}</p>
         <p>Perlu dicatat: Aktivasi akun hanya dilakukan admin setelah menerima konfirmasi transfer.</p>`
      );
    } else {
      callback();
    }
  });
}

// ============================
// FITUR SIMULASI
// ============================
featureClick(btnTopup, () => {
  openModal("Top-up", `<p>Silahkan transfer Rp500.000 ke VA Anda: ${currentUser.accountNumber}</p>
  <p>untuk mengaktifkan akun dan fitur transfer dan lainnya terbuka (hanya untuk pengguna baru )</p>`);
});

featureClick(btnReceive, () => {
  openModal("Terima", `<p>Silahkan transfer Rp500.000 ke VA Anda: ${currentUser.accountNumber}</p>
  <p>untuk mengaktifkan akun dan fitur transfer dan lainnya terbuka (hanya untuk pengguna baru )</p>`);
});

featureClick(btnTransfer, () => {
  openModal("Transfer", `<p>Silahkan transfer Rp500.000 ke VA Anda: ${currentUser.accountNumber}</p>
 <p>untuk mengaktifkan akun dan fitur transfer dan lainnya terbuka (hanya untuk pengguna baru )</p>`);
});

featureClick(btnPay, () => {
  openModal("Bayar", `<p>Silahkan transfer Rp500.000 ke VA Anda: ${currentUser.accountNumber}</p>
  <p>untuk mengaktifkan akun dan fitur transfer dan lainnya terbuka (hanya untuk pengguna baru )</p>`);
});

featureClick(btnQR, () => {
  openModal("QRIS / Scan", `<p>Silahkan transfer Rp500.000 ke VA Anda: ${currentUser.accountNumber}</p>
  <p>untuk mengaktifkan akun dan fitur transfer dan lainnya terbuka (hanya untuk pengguna baru )</p>`);
});

// ============================
// INISIALISASI
// ============================
renderUser();
