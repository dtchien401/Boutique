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
  const tabs = ['revenue', 'expense', 'investment', 'equip', 'construction'];

  tabs.forEach(t => {
    const el = document.getElementById(`tab-${t}`);
    if (el) el.classList.add('hidden-tab');

    const btn = document.getElementById(`btn-${t}`);
    if (btn) btn.classList.remove('active');
  });

  const activeTab = document.getElementById(`tab-${tabName}`);
  const activeBtn = document.getElementById(`btn-${tabName}`);

  if (activeTab) activeTab.classList.remove('hidden-tab');
  if (activeBtn) activeBtn.classList.add('active');
}

function toggleAccordion(id) {
  const content = document.getElementById(id);
  const icon = document.getElementById(`icon-${id}`);

  if (content) content.classList.toggle('active');
  if (icon) icon.classList.toggle('active');
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadAllSections();
  switchTab("revenue");
});
