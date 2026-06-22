/* ===========================
   textarea 自動增高
=========================== */
document.addEventListener("input", function(e) {
  if (e.target.classList.contains("auto-textarea")) {
    e.target.style.height = "auto";
    e.target.style.height = (e.target.scrollHeight) + "px";
  }
});

/* ===========================
   數字格式化（Qty 不加小數）
=========================== */
function setupNumberFormat(input, isQty = false) {
  input.addEventListener("blur", () => {
    if (input.value !== "") {
      input.value = isQty
        ? parseInt(input.value)
        : parseFloat(input.value).toFixed(1);
    }
  });
}

/* ===========================
   X / Z Avg Check 自動計算
=========================== */
function setupAutoCalc(day) {
  const xNet = document.getElementById(`x_net_sales_${day}`);
  const xQty = document.getElementById(`x_transaction_${day}`);
  const xAvg = document.getElementById(`x_avg_check_${day}`);

  const zNet = document.getElementById(`z_net_sales_${day}`);
  const zQty = document.getElementById(`z_transaction_${day}`);
  const zAvg = document.getElementById(`z_avg_check_${day}`);

  function calcX() {
    const net = parseFloat(xNet.value) || 0;
    const qty = parseFloat(xQty.value) || 0;
    xAvg.value = qty > 0 ? (net / qty).toFixed(1) : "";
  }

  function calcZ() {
    const net = parseFloat(zNet.value) || 0;
    const qty = parseFloat(zQty.value) || 0;
    zAvg.value = qty > 0 ? (net / qty).toFixed(1) : "";
  }

  xNet.addEventListener("input", calcX);
  xQty.addEventListener("input", calcX);
  zNet.addEventListener("input", calcZ);
  zQty.addEventListener("input", calcZ);
}

/* ===========================
   Z‑Reading 計算（含 Food Waste + Loyalty）
=========================== */
function setupZExtraCalc(day) {
  const target = document.getElementById(`daily_sales_target_${day}`);
  const zNet = document.getElementById(`z_net_sales_${day}`);
  const zFood = document.getElementById(`z_food_sales_${day}`);
  const zTargetAch = document.getElementById(`z_target_achieved_${day}`);
  const zFoodPct = document.getElementById(`z_food_sales_pct_${day}`);

  const wasteAmt = document.getElementById(`food_waste_amt_${day}`);
  const wastePct = document.getElementById(`food_waste_pct_${day}`);

  const mh = document.getElementById(`mh_${day}`);
  const spmh = document.getElementById(`spmh_${day}`);

  const loyaltySales = document.getElementById(`loyalty_Sales_${day}`);
  const loyaltyPct = document.getElementById(`loyalty_sales_pct_${day}`);

  const loyaltyTarget = document.getElementById(`daily_loyalty_target_${day}`);
  const loyaltyAch = document.getElementById(`loyalty_target_achieved_${day}`);

  function calcTargetAchieved() {
    const t = parseFloat(target.value) || 0;
    const n = parseFloat(zNet.value) || 0;
    zTargetAch.value = t > 0 ? ((n / t) * 100).toFixed(1) + "%" : "";
  }

  function calcFoodPct() {
    const n = parseFloat(zNet.value) || 0;
    const f = parseFloat(zFood.value) || 0;
    zFoodPct.value = n > 0 ? ((f / n) * 100).toFixed(1) + "%" : "";
  }

function calcWastePct() {
  const f = parseFloat(zFood.value) || 0;
  const w = parseFloat(wasteAmt.value) || 0;
  const base = f + w;
  wastePct.value = base > 0 ? ((w / base) * 100).toFixed(1) + "%" : "";
}

  function calcSPMH() {
    const n = parseFloat(zNet.value) || 0;
    const m = parseFloat(mh.value) || 0;
    spmh.value = m > 0 ? (n / m).toFixed(1) : "";
  }

  function calcLoyaltyPct() {
    const ls = parseFloat(loyaltySales.value) || 0;
    const n = parseFloat(zNet.value) || 0;
    loyaltyPct.value = n > 0 ? ((ls / n) * 100).toFixed(1) + "%" : "";
  }

  function calcLoyaltyAchieved() {
    const pct = parseFloat(loyaltyPct.value) || 0;
    const t = parseFloat(loyaltyTarget.value) || 0;
    loyaltyAch.value = t > 0 ? ((pct / t) * 100).toFixed(1) + "%" : "";
  }

  target.addEventListener("input", calcTargetAchieved);
  zNet.addEventListener("input", () => {
    calcTargetAchieved();
    calcFoodPct();
    calcWastePct();
    calcSPMH();
    calcLoyaltyPct();
    calcLoyaltyAchieved();
  });

  zFood.addEventListener("input", () => {
    calcFoodPct();
    calcWastePct();
  });

  wasteAmt.addEventListener("input", calcWastePct);
  mh.addEventListener("input", calcSPMH);

  loyaltySales.addEventListener("input", () => {
    calcLoyaltyPct();
    calcLoyaltyAchieved();
  });

  loyaltyTarget.addEventListener("input", () => {
    loyaltyTarget.value = loyaltyTarget.value.replace(/[^0-9.]/g, "") + "%";
    calcLoyaltyAchieved();
  });
}

/* ===========================
   生成整個月份表格（100% 對齊 HTML）
=========================== */
function generateMonthRows() {
  const monthInput = document.getElementById("month_select").value;
  const tbody = document.getElementById("table_body");

  if (!monthInput) return;

  tbody.innerHTML = "";

  const [year, month] = monthInput.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();

  const weekdayCode = ["S", "M", "T", "W", "T", "F", "S"];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month - 1, day);
    const weekday = weekdayCode[dateObj.getDay()];

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="freeze-col-1">${day}</td>
      <td class="freeze-col-2">${weekday}</td>

      <!-- X-Reading -->
      <td><input type="number" id="x_net_sales_${day}"></td>
      <td><input type="number" id="x_r_${day}"></td>
      <td><input type="number" id="x_food_sales_${day}"></td>
      <td><input type="number" id="x_transaction_${day}"></td>
      <td><input type="number" id="x_avg_check_${day}" readonly></td>

      <!-- Z-Reading（17 欄） -->
      <td><input type="number" id="daily_sales_target_${day}"></td>
      <td><input type="number" id="z_net_sales_${day}"></td>
      <td><input type="text" id="z_target_achieved_${day}" readonly></td>
      <td><input type="number" id="z_transaction_${day}"></td>
      <td><input type="number" id="z_avg_check_${day}" readonly></td>
      <td><input type="number" id="z_r_${day}"></td>
      <td><input type="number" id="z_food_sales_${day}"></td>
      <td><input type="text" id="z_food_sales_pct_${day}" readonly></td>

      <td><input type="number" id="food_waste_amt_${day}"></td>
      <td><input type="text" id="food_waste_pct_${day}" readonly></td>

      <td><input type="number" id="loyalty_Sales_${day}"></td>
      <td><input type="text" id="loyalty_sales_pct_${day}" readonly></td>
      <td><input type="text" id="daily_loyalty_target_${day}"></td>
      <td><input type="text" id="loyalty_target_achieved_${day}" readonly></td>
      <td><input type="number" id="spmh_${day}" readonly></td>
      <td><input type="number" id="mh_${day}"></td>
      <td><input type="number" id="mh_al_yol_${day}"></td>

      <!-- Merchandise ~ Tea Set -->
      <td><input type="number" id="merchandise_qty_${day}"></td>
      <td><input type="number" id="merchandise_amt_${day}"></td>

      <td><input type="number" id="coffee_qty_${day}"></td>
      <td><input type="number" id="coffee_amt_${day}"></td>

      <td><input type="number" id="delivery_qty_${day}"></td>
      <td><input type="number" id="delivery_amt_${day}"></td>

      <td><input type="number" id="odo_qty_${day}"></td>
      <td><input type="number" id="odo_amt_${day}"></td>

      <td><input type="number" id="keeta_qty_${day}"></td>
      <td><input type="number" id="keeta_amt_${day}"></td>

      <td><input type="number" id="foodpanda_qty_${day}"></td>
      <td><input type="number" id="foodpanda_amt_${day}"></td>

      <td><input type="number" id="breakfast_qty_${day}"></td>
      <td><input type="number" id="breakfast_amt_${day}"></td>

      <td><input type="number" id="teaset_qty_${day}"></td>
      <td><input type="number" id="teaset_amt_${day}"></td>

      <!-- Promo 1–12 -->
      <td><input type="number" id="promo1_qty_${day}"></td>
      <td><input type="number" id="promo2_qty_${day}"></td>
      <td><input type="number" id="promo3_qty_${day}"></td>
      <td><input type="number" id="promo4_qty_${day}"></td>
      <td><input type="number" id="promo5_qty_${day}"></td>
      <td><input type="number" id="promo6_qty_${day}"></td>
      <td><input type="number" id="promo7_qty_${day}"></td>
      <td><input type="number" id="promo8_qty_${day}"></td>
      <td><input type="number" id="promo9_qty_${day}"></td>
      <td><input type="number" id="promo10_qty_${day}"></td>
      <td><input type="number" id="promo11_qty_${day}"></td>
      <td><input type="number" id="promo12_qty_${day}"></td>

      <td><textarea id="other_${day}" class="auto-textarea"></textarea></td>
      <td><textarea id="remarks_${day}" class="auto-textarea"></textarea></td>
    `;

    tbody.appendChild(tr);

    setupAutoCalc(day);
    setupZExtraCalc(day);

    tr.querySelectorAll('input[type="number"]').forEach(input => {
      const isQty =
        input.id.includes("qty") ||
        input.id.includes("transaction");
      setupNumberFormat(input, isQty);
    });
  }

  createTotalRow();
  calculateTotalRow();
}

/* ===========================
   建立 TOTAL Row
=========================== */
function createTotalRow() {
  const tbody = document.getElementById("table_body");

  let totalRow = document.getElementById("total_row");
  if (totalRow) totalRow.remove();

  totalRow = document.createElement("tr");
  totalRow.id = "total_row";
  totalRow.style.background = "#e6f7ff";

  const firstRow = tbody.querySelector("tr");
  if (!firstRow) return;

  const colCount = firstRow.children.length;

  let html = `
    <td class="freeze-col-1"><b>TOTAL</b></td>
    <td class="freeze-col-2"></td>
  `;

  for (let i = 2; i < colCount; i++) {
    html += `<td><input type="text" readonly></td>`;
  }

  totalRow.innerHTML = html;
  tbody.appendChild(totalRow);
}

/* ===========================
   計算 TOTAL Row（完全對齊欄位 index）
=========================== */
function calculateTotalRow() {
  const tbody = document.getElementById("table_body");
  const rows = tbody.querySelectorAll("tr:not(#total_row)");
  const totalRow = document.getElementById("total_row");

  if (!totalRow) return;

  const totalCells = totalRow.querySelectorAll("td");

  totalCells.forEach((cell) => {
    const input = cell.querySelector("input");
    if (input) input.value = "";
  });

  let totalDailyTarget = 0;
  let totalZNet = 0;
  let totalFoodSales = 0;
  let totalFoodWaste = 0;

  let totalLoyaltySales = 0;
  let totalMH = 0;

  let totalXNet = 0;
  let totalXQty = 0;
  let totalZQty = 0;

  let sumDailyLoyaltyTargetPct = 0;
  let countDailyTargetDays = 0;

  rows.forEach(row => {
    const cells = row.querySelectorAll("td");

    cells.forEach((cell, index) => {
      const input = cell.querySelector("input");
      if (!input || input.type !== "number") return;

      const val = parseFloat(input.value) || 0;
      const totalInput = totalCells[index]?.querySelector("input");

      if (totalInput) {
        const current = parseFloat(totalInput.value) || 0;
        totalInput.value = (current + val).toFixed(1);
      }
    });

    totalDailyTarget += parseFloat(row.querySelector("input[id^='daily_sales_target_']")?.value) || 0;
    totalZNet       += parseFloat(row.querySelector("input[id^='z_net_sales_']")?.value) || 0;
    totalFoodSales  += parseFloat(row.querySelector("input[id^='z_food_sales_']")?.value) || 0;
    totalFoodWaste  += parseFloat(row.querySelector("input[id^='food_waste_amt_']")?.value) || 0;

    totalLoyaltySales += parseFloat(row.querySelector("input[id^='loyalty_Sales_']")?.value) || 0;
    totalMH           += parseFloat(row.querySelector("input[id^='mh_']")?.value) || 0;

    totalXNet += parseFloat(row.querySelector("input[id^='x_net_sales_']")?.value) || 0;
    totalXQty += parseFloat(row.querySelector("input[id^='x_transaction_']")?.value) || 0;
    totalZQty += parseFloat(row.querySelector("input[id^='z_transaction_']")?.value) || 0;

    const loyaltyTargetInput = row.querySelector("input[id^='daily_loyalty_target_']");
    if (loyaltyTargetInput && loyaltyTargetInput.value) {
      sumDailyLoyaltyTargetPct += parseFloat(loyaltyTargetInput.value) || 0;
      countDailyTargetDays++;
    }
  });

  const totalInputs = totalRow.querySelectorAll("input");

  const idxXAvg        = 4;
  const idxDailyTarget = 5;
  const idxZNet        = 6;
  const idxTargetAch   = 7;
  const idxZQty        = 10;
  const idxZAvg        = 9;
  const idxFoodSales   = 11;
  const idxFoodPct     = 12;
  const idxWasteAmt    = 13;
  const idxWastePct    = 14;
  const idxLoyaltySales = 15;
  const idxLoyaltyPct   = 16;
  const idxDailyLoyaltyTarget = 17;
  const idxLoyaltyAch   = 18;
  const idxSPMH         = 19;
  const idxMH           = 20;

 ;

  /* ===========================
     1) X Avg Check
  =========================== */
  if (totalInputs[idxXAvg]) {
    totalInputs[idxXAvg].value =
      totalXQty > 0 ? (totalXNet / totalXQty).toFixed(1) : "";
  }

  /* ===========================
     2) Z Avg Check
  =========================== */
  if (totalInputs[idxZAvg]) {
    totalInputs[idxZAvg].value =
      totalZQty > 0 ? (totalZNet / totalZQty).toFixed(1) : "";
  }

  /* ===========================
     3) Z Target Achieved (%)
  =========================== */
  if (totalInputs[idxTargetAch]) {
    totalInputs[idxTargetAch].value =
      totalDailyTarget > 0
        ? ((totalZNet / totalDailyTarget) * 100).toFixed(1) + "%"
        : "";
  }

  /* ===========================
     4) Food Sales (%)
  =========================== */
  if (totalInputs[idxFoodPct]) {
    totalInputs[idxFoodPct].value =
      totalZNet > 0
        ? ((totalFoodSales / totalZNet) * 100).toFixed(1) + "%"
        : "";
  }

  /* ===========================
     5) Food Waste($)
  =========================== */
  if (totalInputs[idxWasteAmt]) {
    totalInputs[idxWasteAmt].value = totalFoodWaste.toFixed(1);
  }

/* ===========================
   6) Food Waste(%)
=========================== */
if (totalInputs[idxWastePct]) {
  const base = totalFoodSales + totalFoodWaste;
  totalInputs[idxWastePct].value =
    base > 0
      ? ((totalFoodWaste / base) * 100).toFixed(1) + "%"
      : "";
}


  /* ===========================
     7) Loyalty Sales (%)
  =========================== */
  if (totalInputs[idxLoyaltyPct]) {
    totalInputs[idxLoyaltyPct].value =
      totalZNet > 0
        ? ((totalLoyaltySales / totalZNet) * 100).toFixed(1) + "%"
        : "";
  }

  /* ===========================
     8) Daily Loyalty Target %（平均）
  =========================== */
  const avgDailyLoyaltyTarget =
    countDailyTargetDays > 0
      ? (sumDailyLoyaltyTargetPct / countDailyTargetDays)
      : 0;

  if (totalInputs[idxDailyLoyaltyTarget]) {
    totalInputs[idxDailyLoyaltyTarget].value =
      avgDailyLoyaltyTarget > 0
        ? avgDailyLoyaltyTarget.toFixed(1) + "%"
        : "";
  }

  /* ===========================
     9) Loyalty Achieved (%)
  =========================== */
  const totalLoyaltyPctAccum =
    totalZNet > 0 ? (totalLoyaltySales / totalZNet) * 100 : 0;

  if (totalInputs[idxLoyaltyAch]) {
    totalInputs[idxLoyaltyAch].value =
      avgDailyLoyaltyTarget > 0
        ? ((totalLoyaltyPctAccum / avgDailyLoyaltyTarget) * 100).toFixed(1) + "%"
        : "";
  }

  /* ===========================
     10) SPMH
  =========================== */
  if (totalInputs[idxSPMH]) {
    totalInputs[idxSPMH].value =
      totalMH > 0 ? (totalZNet / totalMH).toFixed(1) : "";
  }

  /* ===========================
     ⭐ 更新 HEADER（Sales Target / Net Sales / Target Achieved）
  =========================== */
  document.getElementById("sales_target").value = totalDailyTarget.toFixed(1);
  document.getElementById("net_sales").value = totalZNet.toFixed(1);

  const headerTargetAch = document.getElementById("target_achieved");
  if (headerTargetAch && totalInputs[idxTargetAch]) {
    headerTargetAch.value = totalInputs[idxTargetAch].value.replace("%", "");
  }
}
