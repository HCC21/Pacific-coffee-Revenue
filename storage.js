/* ==========================================================
   讀取目前頁面嘅年份 + 月份 + 用戶
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
   清空 Header（新月份或無資料時）
========================================================== */
function clearHeader() {
  document.getElementById("coffee_house").value = "";
  document.getElementById("area_manager").value = "";
  document.getElementById("sales_target").value = "";
  document.getElementById("net_sales").value = "";

  document.getElementById("promo1_name").value = "";
  document.getElementById("promo2_name").value = "";
  document.getElementById("promo3_name").value = "";
  document.getElementById("promo4_name").value = "";
  document.getElementById("promo5_name").value = "";
  document.getElementById("promo6_name").value = "";
}

/* ==========================================================
   收集所有資料（Header + Days）
========================================================== */
function collectAllData() {
  const info = getCurrentInfo();
  if (!info) return;

  const header = {
    coffee_house: document.getElementById("coffee_house").value,
    area_manager: document.getElementById("area_manager").value,
    sales_target: document.getElementById("sales_target").value,
    net_sales: document.getElementById("net_sales").value,
    promo1_name: document.getElementById("promo1_name").value,
    promo2_name: document.getElementById("promo2_name").value,
    promo3_name: document.getElementById("promo3_name").value,
    promo4_name: document.getElementById("promo4_name").value,
    promo5_name: document.getElementById("promo5_name").value,
    promo6_name: document.getElementById("promo6_name").value
  };

  const daysInMonth = new Date(info.year, info.month, 0).getDate();
  const days = {};

  for (let day = 1; day <= daysInMonth; day++) {
    const d = {};

    const ids = [
      "x_net_sales","x_r","x_food_sales","x_transaction","x_avg_check",
      "daily_sales_target","z_net_sales","z_target_achieved","z_transaction",
      "z_avg_check","z_r","z_food_sales","z_food_sales_pct",
      "mh","mh_al_yol","spmh","loyalty_Sales","loyalty_sales_pct",
      "merchandise_qty","merchandise_amt","coffee_qty","coffee_amt",
      "delivery_qty","delivery_amt","odo_qty","odo_amt",
      "keeta_qty","keeta_amt","foodpanda_qty","foodpanda_amt",
      "breakfast_qty","breakfast_amt","teaset_qty","teaset_amt",
      "nutribite_qty","nutribite38_qty","promo1_qty","promo2_qty",
      "promo3_qty","promo4_qty","other","remarks"
    ];

    ids.forEach(key => {
      const el = document.getElementById(`${key}_${day}`);
      d[key] = el ? el.value : "";
    });

    days[day] = d;
  }

  return { header, days };
}

/* ==========================================================
   填入資料（Load）
========================================================== */
function fillAllData(allData) {
  if (!allData) return;

  const header = allData.header || {};
  const days = allData.days || {};

  function set(id, v) {
    const el = document.getElementById(id);
    if (el) el.value = v ?? "";
  }

  Object.keys(header).forEach(key => {
    set(key, header[key]);
  });

  Object.keys(days).forEach(day => {
    const d = days[day];
    Object.keys(d).forEach(key => {
      set(`${key}_${day}`, d[key]);
    });
  });

  calculateTotalRow();
}

/* ==========================================================
   Save（LocalStorage）
========================================================== */
function saveData() {
  const info = getCurrentInfo();
  if (!info) return;

  const key = `revenue_${info.user}_${info.year}_${String(info.month).padStart(2, "0")}`;
  const allData = collectAllData();

  localStorage.setItem(key, JSON.stringify(allData));
}

/* ==========================================================
   Load（LocalStorage）
========================================================== */
function loadData() {
  const info = getCurrentInfo();
  if (!info) return;

  const key = `revenue_${info.user}_${info.year}_${String(info.month).padStart(2, "0")}`;
  const raw = localStorage.getItem(key);

  generateMonthRows();

  if (!raw) {
    clearHeader();
    return;
  }

  fillAllData(JSON.parse(raw));
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
