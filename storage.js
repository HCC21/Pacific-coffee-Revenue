/* ===========================
   Supabase 初始化
=========================== */
const supabaseUrl = "https://uqxzcguxmboubhzekkyi.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxeHpjZ3V4bWJvdWJoemVra3lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MjE4NTIsImV4cCI6MjA5NzA5Nzg1Mn0.rc_BkdzMpj28bbG5rP9OCsm0Msqvvf5N78URb4d7gO8";

const db = supabase.createClient(supabaseUrl, supabaseKey);

function getUserName() {
  return localStorage.getItem("userName") || "";
}

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
   ⭐ 自動計算 HEADER Sales Target & Net Sales
=========================== */
function updateHeaderTotals() {
  const tbody = document.getElementById("table_body");
  const rows = tbody.querySelectorAll("tr:not(#total_row)");

  let totalSalesTarget = 0;
  let totalNetSales = 0;

  rows.forEach(row => {
    const dailyTarget = parseFloat(row.querySelector("input[id^='daily_sales_target_']")?.value) || 0;
    const zNet = parseFloat(row.querySelector("input[id^='z_net_sales_']")?.value) || 0;

    totalSalesTarget += dailyTarget;
    totalNetSales += zNet;
  });

  document.getElementById("sales_target").value = totalSalesTarget.toFixed(1);
  document.getElementById("net_sales").value = totalNetSales.toFixed(1);
}

/* ===========================
   Save（LocalStorage + Supabase）
=========================== */
async function saveData() {
  const month = document.getElementById("month_select").value;
  if (!month) return;

  const userName = getUserName();
  if (!userName) {
    console.warn("⚠ 未登入，不能 Save");
    return;
  }

  const allData = collectAllData();

  localStorage.setItem(
    `revenue_${userName}_${month}`,
    JSON.stringify(allData)
  );

  const { error } = await db
    .from("revenue_data")
    .upsert(
      {
        user_name: userName,
        month: month,
        header: allData.header,
        days: allData.days
      },
      { onConflict: "user_name,month" }
    );

  if (error) {
    console.error("❌ Supabase Save 失敗：", error);
  } else {
    console.log("✅ Supabase Save 成功（已更新）");
  }
}

/* ===========================
   Load（Supabase → LocalStorage）
=========================== */
async function loadData() {
  const month = document.getElementById("month_select").value;
  if (!month) return;

  const userName = getUserName();
  if (!userName) {
    console.warn("⚠ 未登入，不能 Load");
    return;
  }

  const { data } = await db
    .from("revenue_data")
    .select("*")
    .eq("user_name", userName)
    .eq("month", month)
    .single();

  if (data) {
    generateMonthRows();
    fillAllData({ header: data.header, days: data.days });

    localStorage.setItem(
      `revenue_${userName}_${month}`,
      JSON.stringify({ header: data.header, days: data.days })
    );
    return;
  }

  const raw = localStorage.getItem(`revenue_${userName}_${month}`);

  if (raw) {
    generateMonthRows();
    fillAllData(JSON.parse(raw));
    return;
  }

  clearHeader();
  generateMonthRows();
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
   月份切換
=========================== */
document.getElementById("month_select").addEventListener("change", () => {
  clearHeader();
  generateMonthRows();
  loadData();
});
