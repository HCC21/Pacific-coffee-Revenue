const API_URL = "https://script.google.com/macros/s/AKfycbxh3lUyejTqsa1lU5yxn2DvLGgbXV2ttnJg61-UKdX3Y1gEN7whKVSE60Zpd2glEWH0/exec";


/* ==========================================================
   Login（Google Sheet）
========================================================== */
async function loginUser(username, password) {
  const res = await fetch(
    `${API_URL}?action=loadUser&username=${username}&password=${password}`
  );

  const text = await res.text();

  if (text === "invalid") return false;

  const user = JSON.parse(text);

  // 記錄登入用戶
  localStorage.setItem("current_user", user.username);
  localStorage.setItem("current_role", user.role);

  return user.role;
}

/* ==========================================================
   Admin Check
========================================================== */
function isAdminLoggedIn() {
  return localStorage.getItem("current_role") === "admin";
}

/* ==========================================================
   Admin：取得所有用戶
========================================================== */
async function getAllUsers() {
  const res = await fetch(`${API_URL}?action=adminGetUsers`);
  return await res.json();
}
