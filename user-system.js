/* ==========================================================
   初始化：如果未有 users，就建立預設用戶
========================================================== */
if (!localStorage.getItem("users")) {
  const defaultUsers = [
    {
      username: "fungfung",
      password: "790614",
      role: "admin",
      lastLogin: "",
      history: []
    },
    {
      username: "HCC",
      password: "81086500",
      role: "user",
      lastLogin: "",
      history: []
    }
  ];

  localStorage.setItem("users", JSON.stringify(defaultUsers));
}
/* ==========================================================
   取得所有用戶
========================================================== */
function getAllUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

/* ==========================================================
   儲存所有用戶
========================================================== */
function saveAllUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

/* ==========================================================
   登入用戶
========================================================== */
function loginUser(username, password) {
  const users = getAllUsers();
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) return false;

  // 記錄登入時間
  const now = new Date().toLocaleString();
  user.lastLogin = now;
  user.history.push(now);
  saveAllUsers(users);

  // 記錄目前登入用戶
  localStorage.setItem("current_user", username);
  localStorage.setItem("current_role", user.role);

  return user.role; // "admin" 或 "user"
}

/* ==========================================================
   檢查 Admin 是否登入
========================================================== */
function isAdminLoggedIn() {
  return localStorage.getItem("current_role") === "admin";
}

/* ==========================================================
   新增用戶
========================================================== */
function addUser(username, password, role = "user") {
  const users = getAllUsers();

  if (users.some(u => u.username === username)) {
    return false; // 用戶已存在
  }

  users.push({
    username,
    password,
    role,
    lastLogin: "",
    history: []
  });

  saveAllUsers(users);
  return true;
}

/* ==========================================================
   刪除用戶
========================================================== */
function removeUser(username) {
  let users = getAllUsers();
  users = users.filter(u => u.username !== username);
  saveAllUsers(users);

  // 同時刪除該用戶所有月份資料
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(`revenue_${username}_`)) {
      localStorage.removeItem(key);
    }
  });
}

/* ==========================================================
   更新密碼
========================================================== */
function updatePassword(username, newPass) {
  const users = getAllUsers();
  const user = users.find(u => u.username === username);

  if (!user) return false;

  user.password = newPass;
  saveAllUsers(users);
  return true;
}

/* ==========================================================
   取得目前登入用戶
========================================================== */
function getCurrentUser() {
  return localStorage.getItem("current_user");
}
