const JSONBIN_API_KEY = "$2a$10$4UbVC59lWot/ifJrSz8Kget1iXAPeK2LGA3w0/jSF3iwYO2UleRla";
const BIN_ID_USERS = "68fc8b9e43b1c97be97f60b6";
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID_USERS}`;

const userTableBody = document.querySelector("#userTable tbody");
const manualTxForm = document.getElementById("manualTxForm");
const manualTxUser = document.getElementById("manualTxUser");
const manualTxType = document.getElementById("manualTxType");
const manualTxAmount = document.getElementById("manualTxAmount");
const manualTxDesc = document.getElementById("manualTxDesc");

// ============================
// AMBIL & UPDATE USERS
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
    headers: { "Content-Type": "application/json", "X-Master-Key": JSONBIN_API_KEY },
    body: JSON.stringify({ users })
  });
}

// ============================
// RENDER USER TABLE
// ============================
async function renderUsers() {
  const users = await getUsers();
  userTableBody.innerHTML = "";
  manualTxUser.innerHTML = "";

  users.forEach((user, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${user.fullname}</td>
      <td>${user.email}</td>
      <td>
        <input type="number" value="${user.balance || 0}" id="balance-${idx}">
        <button class="saveBalance" data-idx="${idx}">Simpan</button>
      </td>
      <td>
        <input type="text" value="${user.accountNumber || ''}" id="va-${idx}">
        <button class="saveVA" data-idx="${idx}">Simpan VA</button>
      </td>
      <td>${user.isActive ? "Aktif" : "Nonaktif"}</td>
      <td>
        ${user.isActive
          ? `<button class="deactivate" data-idx="${idx}">Nonaktifkan</button>`
          : `<button class="activate" data-idx="${idx}">Aktifkan</button>`}
      </td>
    `;
    userTableBody.appendChild(tr);

    // Tambah ke dropdown manual transaction
    const option = document.createElement("option");
    option.value = idx;
    option.textContent = user.fullname;
    manualTxUser.appendChild(option);
  });

  addActionListeners();
}

// ============================
// ACTION LISTENER
// ============================
function addActionListeners() {
  document.querySelectorAll("button.activate").forEach(btn => {
    btn.addEventListener("click", async () => {
      const idx = btn.dataset.idx;
      let users = await getUsers();
      users[idx].isActive = true;
      await updateUsers(users);
      renderUsers();
    });
  });

  document.querySelectorAll("button.deactivate").forEach(btn => {
    btn.addEventListener("click", async () => {
      const idx = btn.dataset.idx;
      let users = await getUsers();
      users[idx].isActive = false;
      await updateUsers(users);
      renderUsers();
    });
  });

  document.querySelectorAll("button.saveVA").forEach(btn => {
    btn.addEventListener("click", async () => {
      const idx = btn.dataset.idx;
      const vaInput = document.getElementById(`va-${idx}`);
      let users = await getUsers();
      users[idx].accountNumber = vaInput.value.trim();
      await updateUsers(users);
      alert("Nomor Virtual Account berhasil disimpan!");
      renderUsers();
    });
  });

  document.querySelectorAll("button.saveBalance").forEach(btn => {
    btn.addEventListener("click", async () => {
      const idx = btn.dataset.idx;
      const balanceInput = document.getElementById(`balance-${idx}`);
      let users = await getUsers();
      const oldBalance = users[idx].balance || 0;
      const newBalance = parseInt(balanceInput.value) || 0;
      users[idx].balance = newBalance;

      // Tambah riwayat transaksi otomatis
      if (!users[idx].transactions) users[idx].transactions = [];
      const diff = newBalance - oldBalance;
      if (diff !== 0) {
        users[idx].transactions.push({
          date: new Date().toLocaleString(),
          type: diff > 0 ? "Kredit" : "Debet",
          amount: Math.abs(diff),
          desc: `Admin mengubah saldo: ${diff > 0 ? "Menambah" : "Mengurangi"} Rp${Math.abs(diff)}`
        });
      }

      await updateUsers(users);
      alert("Saldo berhasil diperbarui!");
      renderUsers();
    });
  });
}

// ============================
// MANUAL TRANSAKSI
// ============================
manualTxForm.addEventListener("submit", async e => {
  e.preventDefault();
  const idx = manualTxUser.value;
  const type = manualTxType.value;
  const amount = parseInt(manualTxAmount.value) || 0;
  const desc = manualTxDesc.value || "";

  if (amount <= 0) return alert("Jumlah harus lebih dari 0!");

  let users = await getUsers();
  if (!users[idx].transactions) users[idx].transactions = [];

  users[idx].transactions.push({
    date: new Date().toLocaleString(),
    type,
    amount,
    desc
  });

  // Update saldo otomatis jika type = Kredit
  if (type === "Kredit") {
    users[idx].balance = (users[idx].balance || 0) + amount;
  } else {
    users[idx].balance = (users[idx].balance || 0) - amount;
  }

  await updateUsers(users);
  alert("Riwayat transaksi berhasil ditambahkan!");
  manualTxForm.reset();
  renderUsers();
});

// ============================
// INIT
// ============================
renderUsers();
