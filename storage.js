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
   清空 Header（切換月份用）
=========================== */
function clearHeader() {
  document.getElementById("coffee_house").value = "";
  document.getElementById("area_manager").value = "";
  document.getElementById("sales_target").value = "";
  document.getElementById("net_sales").value = "";

  for (let i = 1; i <= 12; i++) {
    document.getElementById(`promo${i}_name`).value = "";
  }
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
    net_sales: document.getElementById("net_sales").value
  };

  for (let i = 1; i <= 12; i++) {
    header[`promo${i}_name`] = document.getElementById(`promo${i}_name`).value;
  }

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

      "daily_loyalty_target",

      "mh","mh_al_yol","spmh","loyalty_Sales","loyalty_sales_pct",

      "food_waste_amt","food_waste_pct",

      "merchandise_qty","merchandise_amt","coffee_qty","coffee_amt",
      "delivery_qty","delivery_amt","odo_qty","odo_amt",
      "keeta_qty","keeta_amt","foodpanda_qty","foodpanda_amt",
      "breakfast_qty","breakfast_amt","teaset_qty","teaset_amt",

      "promo1_qty","promo2_qty","promo3_qty","promo4_qty","promo5_qty",
      "promo6_qty","promo7_qty","promo8_qty","promo9_qty","promo10_qty",
      "promo11_qty","promo12_qty",

      "other","remarks"
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

  Object.keys(header).forEach(key => set(key, header[key]));

  Object.keys(days).forEach(day => {
    const d = days[day];
    Object.keys(d).forEach(key => {
      set(`${key}_${day}`, d[key]);
    });
  });

  calculateTotalRow();
}

/* ===========================
   Save（LocalStorage + Supabase）
=========================== */
async function saveData() {
  const month = document.getElementById("month_select").value;
  if (!month) return;

  const userName = getUserName();
  if (!userName) return;

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

  if (error) console.error("❌ Supabase Save 失敗：", error);
}

/* ===========================
   Load（支援多分店合併）
=========================== */
async function loadData(selectedStores = []) {
  const month = document.getElementById("month_select").value;
  if (!month) return;

  const userName = getUserName();
  if (!userName) return;

  if (!selectedStores || selectedStores.length === 0) {
    selectedStores = [userName];
  }

  const { data, error } = await db
    .from("revenue_data")
    .select("*")
    .eq("month", month)
    .in("user_name", selectedStores);

  if (error) {
    console.error("Load error:", error);
    return;
  }

  if (data && data.length > 0) {
    const merged = mergeDays(data);

    generateMonthRows();
    fillAllData(merged);

    localStorage.setItem(
      `revenue_${userName}_${month}`,
      JSON.stringify(merged)
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
   多分店合併（含 Food Waste 修正）
=========================== */
function mergeDays(records) {
  if (!records || records.length === 0) return null;

  const base = JSON.parse(JSON.stringify(records[0]));
  const days = base.days;

  base.header.coffee_house = records.map(r => r.user_name).join(" + ");
  base.header.area_manager = "Multiple Stores";

  for (let i = 1; i < records.length; i++) {
    const d2 = records[i].days;

    Object.keys(days).forEach(day => {
      const row1 = days[day];
      const row2 = d2[day];

      Object.keys(row1).forEach(key => {

        if (key === "daily_loyalty_target") {
          const v1 = parseFloat(row1[key]) || 0;
          const v2 = parseFloat(row2[key]) || 0;
          row1[key] = ((v1 + v2) / 2).toFixed(1);
          return;
        }

        if (key === "food_waste_amt") {
          const v1 = parseFloat(row1[key]) || 0;
          const v2 = parseFloat(row2[key]) || 0;
          row1[key] = (v1 + v2).toFixed(1);
          return;
        }

        if (key === "food_waste_pct") return;
        if (key.includes("pct") || key.includes("achieved")) return;

        const v1 = parseFloat(row1[key]) || 0;
        const v2 = parseFloat(row2[key]) || 0;

        if (!isNaN(v1) && !isNaN(v2)) {
          row1[key] = (v1 + v2).toFixed(1);
        }
      });
    });
  }

  /* ===========================
     ⭐ 重新計算百分比（包括 Food Waste %）
  ============================ */
  Object.keys(days).forEach(day => {
    const d = days[day];

    const net    = parseFloat(d.z_net_sales) || 0;
    const food   = parseFloat(d.z_food_sales) || 0;
    const loyalty = parseFloat(d.loyalty_Sales) || 0;
    const target = parseFloat(d.daily_sales_target) || 0;
    const qty    = parseFloat(d.z_transaction) || 0;
    const waste  = parseFloat(d.food_waste_amt) || 0;

    d.z_food_sales_pct =
      net > 0 ? ((food / net) * 100).toFixed(1) + "%" : "";

    d.loyalty_sales_pct =
      net > 0 ? ((loyalty / net) * 100).toFixed(1) + "%" : "";

    d.z_target_achieved =
      target > 0 ? ((net / target) * 100).toFixed(1) + "%" : "";

    d.z_avg_check =
      qty > 0 ? (net / qty).toFixed(1) : "";

    const baseValue = food + waste;
    d.food_waste_pct =
      baseValue > 0 ? ((waste / baseValue) * 100).toFixed(1) + "%" : "";

    const loyalty_pct = parseFloat(d.loyalty_sales_pct) || 0;
    const loyalty_target = parseFloat(d.daily_loyalty_target) || 0;

    d.loyalty_target_achieved =
      loyalty_target > 0
        ? ((loyalty_pct / loyalty_target) * 100).toFixed(1) + "%"
        : "";
  });

  /* ⭐⭐ 最重要：必須 return base ⭐⭐ */
  return base;
}

/* ===========================
   自動 Save
=========================== */
document.addEventListener("input", () => {
  saveData();
  calculateTotalRow();
});

/* ===========================
   初始化
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
