async function loadSection(targetId, filePath) {
  const el = document.getElementById(targetId);
  if (!el) return;

  try {
    const res = await fetch(filePath);
    if (!res.ok) throw new Error(`Không load được ${filePath}`);
    const html = await res.text();
    el.innerHTML = html;
  } catch (err) {
    el.innerHTML = `<div class="p-4 text-red-600 text-sm">Lỗi load ${filePath}</div>`;
    console.error(err);
  }
}

async function loadAllSections() {
  await Promise.all([
    loadSection("section-header", "sections/header.html"),
    loadSection("section-metrics", "sections/metrics.html"),
    loadSection("section-tabs-nav", "sections/tabs-nav.html"),
    loadSection("section-tab-revenue", "sections/tab-revenue.html"),
    loadSection("section-tab-expense", "sections/tab-expense.html"),
    loadSection("section-tab-equip", "sections/tab-equip.html"),
    loadSection("section-tab-construction", "sections/tab-construction.html"),
    loadSection("section-tab-investment", "sections/tab-investment.html"),
    loadSection("section-footer-strategy", "sections/footer-strategy.html")
  ]);
}

function switchTab(tabName) {
  const tabs = ["revenue", "expense", "investment", "equip", "construction"];

  tabs.forEach(t => {
    const el = document.getElementById(`tab-${t}`);
    if (el) el.classList.add("hidden-tab");

    const btn = document.getElementById(`btn-${t}`);
    if (btn) btn.classList.remove("active");
  });

  const activeTab = document.getElementById(`tab-${tabName}`);
  const activeBtn = document.getElementById(`btn-${tabName}`);

  if (activeTab) activeTab.classList.remove("hidden-tab");
  if (activeBtn) activeBtn.classList.add("active");
}

function toggleAccordion(id) {
  const content = document.getElementById(id);
  const icon = document.getElementById(`icon-${id}`);

  if (content) content.classList.toggle("active");
  if (icon) icon.classList.toggle("active");
}

function formatCurrencyVN(value) {
  return Number(value).toLocaleString("vi-VN");
}

function getRevenueData() {
  const rows = document.querySelectorAll("#tab-revenue tbody tr");
  const data = [];

  rows.forEach((row) => {
    const month = Number(row.dataset.month || 0);
    const pt = Number(row.dataset.pt || 0);
    const customers = Number(row.dataset.customers || 0);
    const revenue = Number(row.dataset.revenue || 0);

    if (month && revenue >= 0) {
      data.push({ month, pt, customers, revenue });
    }
  });

  return data;
}

function calculateExpenseRows() {
  const revenueData = getRevenueData();

  const fixedMonthlyCost = 600000000;
  const payrollRate = 0.35;
  const opsRate = 0.05;
  const growthRate = 0.05;

  return revenueData.map(item => {
    const payroll = item.revenue * payrollRate;
    const ops = item.revenue * opsRate;
    const growth = item.revenue * growthRate;
    const variable = payroll + ops + growth;
    const totalCost = fixedMonthlyCost + variable;
    const profit = item.revenue - totalCost;

    return {
      month: item.month,
      pt: item.pt,
      customers: item.customers,
      revenue: item.revenue,
      fixed: fixedMonthlyCost,
      payroll,
      ops,
      growth,
      variable,
      totalCost,
      profit
    };
  });
}

function renderExpenseTable() {
  const tbody = document.getElementById("expense-table-body");
  if (!tbody) return;

  const rows = calculateExpenseRows();
  tbody.innerHTML = "";

  rows.forEach((row, index) => {
    const isLast = index === rows.length - 1;
    const profitClass = row.profit >= 0 ? "text-emerald-700" : "text-red-500";
    const rowClass = isLast ? "highlight-row" : "hover:bg-slate-50/50 transition-colors";

    const tr = document.createElement("tr");
    tr.className = rowClass;

    tr.innerHTML = `
      <td class="px-6 py-5 font-bold ${isLast ? "text-emerald-700" : "text-blue-600"}">
        ${isLast ? `Tháng ${String(row.month).padStart(2, "0")} (Full)` : `Tháng ${String(row.month).padStart(2, "0")}`}
      </td>
      <td class="px-6 py-5 text-center font-semibold">${row.pt}</td>
      <td class="px-6 py-5 text-center font-semibold">${row.customers}</td>
      <td class="px-6 py-5 text-right font-semibold">${formatCurrencyVN(row.revenue)}</td>
      <td class="px-6 py-5 text-right font-medium">${formatCurrencyVN(row.fixed)}</td>
      <td class="px-6 py-5 text-right font-medium">${formatCurrencyVN(row.payroll)}</td>
      <td class="px-6 py-5 text-right font-medium">${formatCurrencyVN(row.ops)}</td>
      <td class="px-6 py-5 text-right font-medium">${formatCurrencyVN(row.growth)}</td>
      <td class="px-6 py-5 text-right font-bold">${formatCurrencyVN(row.totalCost)}</td>
      <td class="px-6 py-5 text-right font-black ${profitClass}">${row.profit < 0 ? `(${formatCurrencyVN(Math.abs(row.profit))})` : formatCurrencyVN(row.profit)}</td>
    `;

    tbody.appendChild(tr);
  });

  renderExpenseSummary(rows);
}

function renderExpenseSummary(rows) {
  const totalRevenue = rows.reduce((sum, r) => sum + r.revenue, 0);
  const totalFixed = rows.reduce((sum, r) => sum + r.fixed, 0);
  const totalVariable = rows.reduce((sum, r) => sum + r.variable, 0);
  const totalProfit = rows.reduce((sum, r) => sum + r.profit, 0);

  const revenueEl = document.getElementById("sum-revenue");
  const fixedEl = document.getElementById("sum-fixed");
  const variableEl = document.getElementById("sum-variable");
  const profitEl = document.getElementById("sum-profit");

  if (revenueEl) revenueEl.textContent = formatCurrencyVN(totalRevenue);
  if (fixedEl) fixedEl.textContent = formatCurrencyVN(totalFixed);
  if (variableEl) variableEl.textContent = formatCurrencyVN(totalVariable);

  if (profitEl) {
    profitEl.textContent = totalProfit < 0
      ? `(${formatCurrencyVN(Math.abs(totalProfit))})`
      : formatCurrencyVN(totalProfit);

    profitEl.className = totalProfit >= 0
      ? "text-2xl font-black text-emerald-700"
      : "text-2xl font-black text-red-600";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadAllSections();
  renderExpenseTable();
  switchTab("revenue");
});
