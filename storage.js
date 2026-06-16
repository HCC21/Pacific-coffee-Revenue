const API_URL = "https://script.google.com/macros/s/AKfycbxh3lUyejTqsa1lU5yxn2DvLGgbXV2ttnJg61-UKdX3Y1gEN7whKVSE60Zpd2glEWH0/exec";


/* ==========================================================
   取得目前頁面嘅年份 + 月份 + 用戶
========================================================== */
function getCurrentInfo() {
  const year = localStorage.getItem("current_year_page");
  const month = localStorage.getItem("current_month_page");
  const user = localStorage.getItem("current_user");

  if (!year || !month || !user) {
    alert("Error: Missing year, month or user. Please login again.");
    window.location.href = "login.html";
    return null;
  }

  return {
    year: parseInt(year),
    month: parseInt(month),
    user
  };
}

/* ==========================================================
   Save to Google Sheet
========================================================== */
async function saveData() {
  const info = getCurrentInfo();
  if (!info) return;

  const allData = collectAllData();
  const json = JSON.stringify(allData);

  await fetch(API_URL, {
    method: "POST",
    body: new URLSearchParams({
      action: "saveRevenue",
      username: info.user,
      year: info.year,
      month: info.month,
      json
    })
  });
}

/* ==========================================================
   Load from Google Sheet
========================================================== */
async function loadData() {
  const info = getCurrentInfo();
  if (!info) return;

  generateMonthRows();

  const res = await fetch(
    `${API_URL}?action=loadRevenue&username=${info.user}&year=${info.year}&month=${info.month}`
  );

  const text = await res.text();

  if (!text) {
    clearHeader();
    return;
  }

  fillAllData(JSON.parse(text));
}

/* ==========================================================
   自動 Save（每次輸入）
========================================================== */
document.addEventListener("input", () => {
  saveData();
  calculateTotalRow();
});

/* ==========================================================
   初始化（頁面載入）
========================================================== */
window.addEventListener("DOMContentLoaded", () => {
  loadData();
});
