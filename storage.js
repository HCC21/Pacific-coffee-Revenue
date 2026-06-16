/* ===========================
   清空 Header（切換月份時用）
=========================== */
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

/* ===========================
   收集所有資料（Header + Days）
=========================== */
function collectAllData() {
  const month = document.getElementById("month_select").value;

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

  const [year, m] = month.split("-").map(Number);
  const daysInMonth = new Date(year, m, 0).getDate();

  const days = {};

  for (let day = 1; day <= daysInMonth; day++) {
    const d = {};
    function val(id) {
      const el = document.getElementById(id);
      return el ? el.value : "";
    }

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
      d[key] = val(`${key}_${day}`);
    });

    days[day] = d;
  }

  return { header, days };
}

/* ===========================
   填入資料（Load）
=========================== */
function fillAllData(allData) {
  if (!allData) return;

  const header = allData.header || {};
  const days = allData.days || {};

  function set(id, v) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = v ?? "";
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

/* ===========================
   Save（LocalStorage）
=========================== */
function saveData() {
  const month = document.getElementById("month_select").value;
  if (!month) return;

  const allData = collectAllData();
  localStorage.setItem(`revenue_${month}`, JSON.stringify(allData));
}

/* ===========================
   Load（LocalStorage）
=========================== */
function loadData() {
  const month = document.getElementById("month_select").value;
  if (!month) return;

  const raw = localStorage.getItem(`revenue_${month}`);

  // ⭐ 新月份冇資料 → 清空表格
  if (!raw) {
    clearHeader();
    generateMonthRows();
    return;
  }

  // ⭐ 有資料 → 先生成表格，再填資料
  generateMonthRows();

  const allData = JSON.parse(raw);
  fillAllData(allData);
}

/* ===========================
   自動 Save（每次輸入）
=========================== */
document.addEventListener("input", () => {
  saveData();
  calculateTotalRow();
});

/* ===========================
   初始化（頁面載入）
=========================== */
window.addEventListener("DOMContentLoaded", () => {
  generateMonthRows();
  loadData();
});

/* ===========================
   月份切換（最重要修正）
=========================== */
document.getElementById("month_select").addEventListener("change", () => {
  clearHeader();
  generateMonthRows();
  loadData();
});
