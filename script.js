// ===============================
// KONFIGURASI JSONBIN
// ===============================
const JSONBIN_API_KEY = '$2a$10$4UbVC59lWot/ifJrSz8Kget1iXAPeK2LGA3w0/jSF3iwYO2UleRla';
const BIN_ID_USERS = '68fc8b9e43b1c97be97f60b6';
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID_USERS}`;

// ===============================
// ELEMEN DOM
// ===============================
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

// ===============================
// GANTI TAMPILAN LOGIN ↔ REGISTER
// ===============================
showRegister.addEventListener("click", () => {
  loginForm.classList.remove("active");
  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");
  registerForm.classList.add("active");
});

showLogin.addEventListener("click", () => {
  registerForm.classList.remove("active");
  registerForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
  loginForm.classList.add("active");
});

// ===============================
// FUNGSI MENGAMBIL DATA USER DARI JSONBIN
// ===============================
async function getUsers() {
  const res = await fetch(JSONBIN_URL, {
    headers: { 'X-Master-Key': JSONBIN_API_KEY }
  });
  const data = await res.json();
  return data.record.users || [];
}

// ===============================
// FUNGSI UPDATE DATA USER KE JSONBIN
// ===============================
async function updateUsers(users) {
  await fetch(JSONBIN_URL, {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_API_KEY
    },
    body: JSON.stringify({ users })
  });
}

// ===============================
// EVENT: REGISTER
// ===============================
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullname = document.getElementById("registerFullname").value.trim();
  const email = document.getElementById("registerEmail").value.trim().toLowerCase();
  const password = document.getElementById("registerPassword").value.trim();

  if (!fullname || !email || !password) {
    alert("Semua field wajib diisi!");
    return;
  }

  let users = await getUsers();
  if (users.find(u => u.email === email)) {
    alert("Email sudah terdaftar!");
    return;
  }

  const newUser = {
    fullname,
    email,
    password,
    balance: 0,
    role: "user"
  };

  users.push(newUser);
  await updateUsers(users);

  alert("Pendaftaran berhasil! Silakan login.");
  registerForm.reset();
  showLogin.click();
});

// ===============================
// EVENT: LOGIN
// ===============================
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value.trim();

  let users = await getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    alert("Email atau password salah!");
    return;
  }

  localStorage.setItem("bki_user", JSON.stringify(user));
  alert(`Selamat datang, ${user.fullname}!`);
  window.location.href = "dashboard.html";
});
