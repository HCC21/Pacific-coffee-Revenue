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
   Z‑Reading 其他計算
=========================== */
function setupZExtraCalc(day) {
  const target = document.getElementById(`daily_sales_target_${day}`);
  const zNet = document.getElementById(`z_net_sales_${day}`);
  const zFood = document.getElementById(`z_food_sales_${day}`);
  const zTargetAch = document.getElementById(`z_target_achieved_${day}`);
  const zFoodPct = document.getElementById(`z_food_sales_pct_${day}`);

  const mh = document.getElementById(`mh_${day}`);
  const spmh = document.getElementById(`spmh_${day}`);

  const loyaltySales = document.getElementById(`loyalty_Sales_${day}`);
  const loyaltyPct = document.getElementById(`loyalty_sales_pct_${day}`);

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

  target.addEventListener("input", calcTargetAchieved);
  zNet.addEventListener("input", () => {
    calcTargetAchieved();
    calcFoodPct();
    calcSPMH();
    calcLoyaltyPct();
  });

  zFood.addEventListener("input", calcFoodPct);
  mh.addEventListener("input", calcSPMH);
  loyaltySales.addEventListener("input", calcLoyaltyPct);
}

/* ===========================
   生成整個月份表格（已修正）
=========================== */
function generateMonthRows() {
  const monthInput = document.getElementById("month_select").value;
  const tbody = document.getElementById("table_body");

  if (!monthInput) return;

  // ⭐ 完全清空舊資料
  tbody.innerHTML = "";

  const [year, month] = monthInput.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();

  const weekdayCode = ["S", "M", "T", "W", "T", "F", "S"];
  const hkHolidays = [
    `${year}-01-01`,
    `${year}-05-01`,
    `${year}-10-01`,
    `${year}-12-25`,
  ];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month - 1, day);
    const weekday = weekdayCode[dateObj.getDay()];
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const isWeekend = (dateObj.getDay() === 0 || dateObj.getDay() === 6);
    const isHoliday = hkHolidays.includes(dateStr);
    const redClass = (isWeekend || isHoliday) ? "red-day" : "";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="freeze-col-1 date-cell ${redClass}">${day}</td>
      <td class="freeze-col-2 weekday-cell ${redClass}">${weekday}</td>

      <td><input type="number" id="x_net_sales_${day}"></td>
      <td><input type="number" id="x_r_${day}"></td>
      <td><input type="number" id="x_food_sales_${day}"></td>
      <td><input type="number" id="x_transaction_${day}"></td>
      <td><input type="number" id="x_avg_check_${day}" class="auto-calc" readonly></td>

      <td><input type="number" id="daily_sales_target_${day}"></td>
      <td><input type="number" id="z_net_sales_${day}"></td>
      <td><input type="text" id="z_target_achieved_${day}" class="auto-calc" readonly></td>
      <td><input type="number" id="z_transaction_${day}"></td>
      <td><input type="number" id="z_avg_check_${day}" class="auto-calc" readonly></td>
      <td><input type="number" id="z_r_${day}"></td>
      <td><input type="number" id="z_food_sales_${day}"></td>
      <td><input type="text" id="z_food_sales_pct_${day}" class="auto-calc" readonly></td>

      <td><input type="number" id="mh_${day}"></td>
      <td><input type="number" id="mh_al_yol_${day}"></td>
      <td><input type="number" id="spmh_${day}" class="auto-calc" readonly></td>
      <td><input type="number" id="loyalty_Sales_${day}"></td>
      <td><input type="text" id="loyalty_sales_pct_${day}" class="auto-calc" readonly></td>

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

      <td><input type="number" id="nutribite_qty_${day}"></td>
      <td><input type="number" id="nutribite38_qty_${day}"></td>
      <td><input type="number" id="promo1_qty_${day}"></td>
      <td><input type="number" id="promo2_qty_${day}"></td>
      <td><input type="number" id="promo3_qty_${day}"></td>
      <td><input type="number" id="promo4_qty_${day}"></td>

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
    html += `<td><input type="text" class="auto-calc" readonly></td>`;
  }

  totalRow.innerHTML = html;
  tbody.appendChild(totalRow);
}


/* ===========================
   計算 TOTAL Row（含整月百分比）
=========================== */
function calculateTotalRow() {
  const tbody = document.getElementById("table_body");
  const rows = tbody.querySelectorAll("tr:not(#total_row)");
  const totalRow = document.getElementById("total_row");

  if (!totalRow) return;

  const totalCells = totalRow.querySelectorAll("td");

  // 先清空 TOTAL row
  totalCells.forEach((cell) => {
    const input = cell.querySelector("input");
    if (input) input.value = "";
  });

  // ⭐ 整月累積數據
  let totalDailyTarget = 0;
  let totalNetSales = 0;
  let totalFoodSales = 0;
  let totalLoyaltySales = 0;

  rows.forEach(row => {
    const cells = row.querySelectorAll("td");

    cells.forEach((cell, index) => {
      const input = cell.querySelector("input[type='number']");
      if (!input) return;

      const val = parseFloat(input.value) || 0;

      const totalInput = totalCells[index]?.querySelector("input");
      if (totalInput) {
        const current = parseFloat(totalInput.value) || 0;
        totalInput.value = (current + val).toFixed(1);
      }
    });

    // ⭐ 累積整月計算所需數據
    totalDailyTarget += parseFloat(row.querySelector("input[id^='daily_sales_target_']")?.value) || 0;
    totalNetSales += parseFloat(row.querySelector("input[id^='z_net_sales_']")?.value) || 0;
    totalFoodSales += parseFloat(row.querySelector("input[id^='z_food_sales_']")?.value) || 0;
    totalLoyaltySales += parseFloat(row.querySelector("input[id^='loyalty_Sales_']")?.value) || 0;
  });

  // ⭐⭐ TOTAL 百分比欄位 index（根據你嘅欄位順序）
  const idxTargetAch = 7;   // Z Target Achieved(%)
  const idxFoodPct   = 12;  // Food Sales(%)
  const idxLoyaltyPct = 17; // Loyalty Sales(%)

  const totalInputs = totalRow.querySelectorAll("input");

  // ⭐ TOTAL Target Achieved %
  if (totalInputs[idxTargetAch]) {
    totalInputs[idxTargetAch].value =
      totalDailyTarget > 0
        ? ((totalNetSales / totalDailyTarget) * 100).toFixed(1) + "%"
        : "";
  }

  // ⭐ TOTAL Food Sales %
  if (totalInputs[idxFoodPct]) {
    totalInputs[idxFoodPct].value =
      totalNetSales > 0
        ? ((totalFoodSales / totalNetSales) * 100).toFixed(1) + "%"
        : "";
  }

  // ⭐ TOTAL Loyalty Sales %
  if (totalInputs[idxLoyaltyPct]) {
    totalInputs[idxLoyaltyPct].value =
      totalNetSales > 0
        ? ((totalLoyaltySales / totalNetSales) * 100).toFixed(1) + "%"
        : "";
  }

  // ⭐ 更新 HEADER（Sales Target / Net Sales）
  if (typeof updateHeaderTotals === "function") {
    updateHeaderTotals();
  }
}
/* ===========================
   Excel 匯出
=========================== */
document.getElementById("exportExcelBtn").addEventListener("click", () => {
  const table = document.getElementById("month_table");

  const coffeeHouse = document.getElementById("coffee_house").value || "";
  const month = document.getElementById("month_select").value || "";
  const areaManager = document.getElementById("area_manager").value || "";
  const salesTarget = document.getElementById("sales_target").value || "";
  const netSales = document.getElementById("net_sales").value || "";

  const wb = XLSX.utils.book_new();

  const headerSheet = [
    ["Coffee House:", coffeeHouse],
    ["Month:", month],
    ["Area Manager:", areaManager],
    ["Sales Target:", salesTarget],
    ["Net Sales:", netSales],
    [],
    ["---------------------------------------------"],
    []
  ];

  const wsHeader = XLSX.utils.aoa_to_sheet(headerSheet);
  const wsTable = XLSX.utils.table_to_sheet(table);

  XLSX.utils.sheet_add_json(wsHeader, XLSX.utils.sheet_to_json(wsTable, { header: 1 }), {
    skipHeader: true,
    origin: "A9"
  });

  XLSX.utils.book_append_sheet(wb, wsHeader, "Report");
  XLSX.writeFile(wb, "report.xlsx");
});

/* ===========================
   PDF 匯出
=========================== */
document.getElementById("exportPdfBtn").addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF("landscape", "mm", "a4");

  const coffeeHouse = document.getElementById("coffee_house").value || "";
  const month = document.getElementById("month_select").value || "";
  const areaManager = document.getElementById("area_manager").value || "";
  const salesTarget = document.getElementById("sales_target").value || "";
  const netSales = document.getElementById("net_sales").value || "";

  let y = 10;
  pdf.setFontSize(14);
  pdf.text(`Coffee House: ${coffeeHouse}`, 10, y); y += 8;
  pdf.text(`Month: ${month}`, 10, y); y += 8;
  pdf.text(`Area Manager: ${areaManager}`, 10, y); y += 8;
  pdf.text(`Sales Target: ${salesTarget}`, 10, y); y += 8;
  pdf.text(`Net Sales: ${netSales}`, 10, y); y += 10;

  pdf.setLineWidth(0.5);
  pdf.line(10, y, 287, y);
  y += 5;

  const table = document.getElementById("month_table");
  const canvas = await html2canvas(table, { scale: 1 });
  const imgData = canvas.toDataURL("image/png");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgWidth = pageWidth - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 10, y, imgWidth, imgHeight);
  pdf.save("report.pdf");
});

