const base = window.ES_DATA;
const overrides = window.ES_METADATA || {};
const papers = base.papers.map((paper) => Object.assign({}, paper, overrides[paper.id] || {}));
const { edges } = base;

const svg = document.getElementById("map");
const scene = document.getElementById("scene");
const detail = document.getElementById("detail");
const rows = document.getElementById("rows");
const filters = document.getElementById("filters");
const legend = document.getElementById("legend");
const state = { search: "", filter: "all", selected: "yu2020", scale: 1, tx: 0, ty: 0 };
const categories = [["全部", "all"], ["DLCZ / SPI", "spi"], ["TPI / BSM", "tpi"], ["AFC / 复用", "afc"], ["固态自旋", "spin"], ["多节点 / 应用", "network"]];

function esc(value) {
  return String(value ?? "-").replace(/[&<>"']/g, (match) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[match]));
}
function matches(paper) {
  const query = state.search.toLowerCase().trim();
  const text = [paper.title, paper.short, paper.year, paper.authors, paper.material, paper.protocol, paper.features, paper.applications.join(" ")].join(" ").toLowerCase();
  if (query && !query.split(/\s+/).every((token) => text.includes(token))) return false;
  if (state.filter === "all") return true;
  if (state.filter === "spi") return /SPI|DLCZ|single-click/i.test(paper.protocol);
  if (state.filter === "tpi") return /TPI|BSM/i.test(paper.protocol);
  if (state.filter === "afc") return /AFC|multiplex/i.test(paper.protocol);
  if (state.filter === "spin") return /spin|SiV|diamond|single atom/i.test([paper.memory, paper.material, paper.protocol].join(" "));
  if (state.filter === "network") return paper.applications.some((item) => /network|metropolitan|CHSH|live|城域|多节点/i.test(item));
  return true;
}
function setZoom(factor) { state.scale = Math.max(0.55, Math.min(2.8, state.scale * factor)); drawScene(); }
function drawScene() { scene.setAttribute("transform", `translate(${state.tx} ${state.ty}) scale(${state.scale})`); scene.querySelectorAll(".node").forEach((node) => node.classList.toggle("selected", node.dataset.id === state.selected)); }
function render() {
  const visible = papers.filter(matches);
  document.getElementById("tableCount").textContent = `${visible.length} / ${papers.length} 篇可见`;
  scene.innerHTML = "";
  const byId = new Map(papers.map((paper) => [paper.id, paper]));
  edges.forEach(([from, to, type]) => {
    const a = byId.get(from); const b = byId.get(to);
    if (!a || !b || !matches(a) || !matches(b)) return;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const x1 = a.x + 138; const y1 = a.y + 32; const x2 = b.x; const y2 = b.y + 32;
    path.setAttribute("d", `M ${x1} ${y1} C ${x1 + 35} ${y1}, ${x2 - 35} ${y2}, ${x2} ${y2}`);
    path.setAttribute("class", `edge ${type}`); scene.appendChild(path);
  });
  visible.forEach((paper) => {
    const node = document.createElementNS("http://www.w3.org/2000/svg", "g");
    node.classList.add("node"); node.dataset.id = paper.id; node.setAttribute("transform", `translate(${paper.x} ${paper.y})`);
    node.innerHTML = `<rect width="138" height="64"></rect><text class="year" x="10" y="16">${paper.year}</text><text class="title" x="10" y="33">${esc(paper.short)}</text><text class="tag" x="10" y="50">${esc(paper.protocol.slice(0, 22))}</text>`;
    node.addEventListener("click", () => select(paper.id)); scene.appendChild(node);
  });
  drawScene();
  rows.innerHTML = visible.map((paper) => `<tr data-id="${paper.id}"><td><span class="paper">${paper.year} · ${esc(paper.short)}</span><span class="sub">${esc(paper.authors)}</span></td><td>${esc(paper.memory)}<span class="sub">${esc(paper.material)}</span></td><td>${esc(paper.source)}</td><td>${esc(paper.protocol)}</td><td>memory: ${esc(paper.memoryEfficiency || "-")}<span class="sub">interface: ${esc(paper.interfaceEfficiency || paper.efficiency || "-")}<br>storage: ${esc(paper.storage)}</span></td><td>${esc(paper.spi.p)}<span class="sub">C: ${esc(paper.spi.c)}</span></td><td>${esc(paper.tpi.hom)}<span class="sub">P: ${esc(paper.tpi.p)} · F: ${esc(paper.tpi.f)}</span></td><td>${esc(paper.distance)}<span class="sub">${esc(paper.distanceType)}</span></td></tr>`).join("");
  rows.querySelectorAll("tr").forEach((row) => row.addEventListener("click", () => select(row.dataset.id)));
  if (!visible.some((paper) => paper.id === state.selected)) state.selected = visible[0]?.id || "";
  showDetail();
}
function select(id) { state.selected = id; showDetail(); drawScene(); document.querySelector(`tr[data-id="${id}"]`)?.scrollIntoView({ block: "nearest" }); }
function showDetail() {
  const paper = papers.find((item) => item.id === state.selected);
  if (!paper) { detail.innerHTML = "<p>没有匹配的论文。</p>"; return; }
  detail.innerHTML = `<p class="eyebrow">${paper.year} · ${esc(paper.protocol)}</p><h2>${esc(paper.title)}</h2><p class="authors">${esc(paper.authors)}<br>${esc(paper.venue)}</p><p><a href="https://doi.org/${encodeURI(paper.doi)}" target="_blank" rel="noreferrer">DOI: ${esc(paper.doi)}</a>${paper.arxiv ? ` · <a href="https://arxiv.org/abs/${esc(paper.arxiv)}" target="_blank" rel="noreferrer">arXiv</a>` : ""}</p><h3>实验对象与机制</h3><dl><dt>memory / 材料</dt><dd>${esc(paper.memory)} · ${esc(paper.material)}</dd><dt>光源</dt><dd>${esc(paper.source)}</dd><dt>存储协议</dt><dd>${esc(paper.protocol)}</dd><dt>距离</dt><dd>${esc(paper.distance)}（${esc(paper.distanceType)}）</dd><dt>memory efficiency</dt><dd>${esc(paper.memoryEfficiency || "-")}</dd><dt>接口/QFC efficiency</dt><dd>${esc(paper.interfaceEfficiency || paper.efficiency || "-")}</dd><dt>存储时间</dt><dd>${esc(paper.storage)}</dd></dl><h3>观测量</h3><dl><dt>SPI：P<sub>ent</sub></dt><dd>${esc(paper.spi.p)}</dd><dt>SPI：concurrence</dt><dd>${esc(paper.spi.c)}</dd><dt>TPI：V<sub>HOM</sub></dt><dd>${esc(paper.tpi.hom)}</dd><dt>TPI：P<sub>ent</sub></dt><dd>${esc(paper.tpi.p)}</dd><dt>TPI：Bell fidelity</dt><dd>${esc(paper.tpi.f)}</dd></dl><h3>实现机制</h3><div class="feature">${esc(paper.mechanism || paper.features)}</div><h3>特点 / 应用</h3><div class="feature">${esc(paper.features)}<br><br><strong>应用：</strong>${paper.applications.map(esc).join(" · ")}</div><h3>引用与证据</h3><p class="sub">${esc(paper.evidence)} ${esc(paper.evidenceDetail || "")}</p><h3>比较注意</h3><p class="sub">SPI 的 concurrence、TPI 的 Bell fidelity、CHSH 和 heralding rate 不是同一指标；coiled fibre、fiber path 和独立节点间距也不等价。</p>`;
}
function addPan() {
  let drag = null;
  svg.addEventListener("pointerdown", (event) => { if (event.target.closest(".node")) return; drag = { x: event.clientX, y: event.clientY, tx: state.tx, ty: state.ty }; svg.classList.add("dragging"); svg.setPointerCapture(event.pointerId); });
  svg.addEventListener("pointermove", (event) => { if (!drag) return; state.tx = drag.tx + event.clientX - drag.x; state.ty = drag.ty + event.clientY - drag.y; drawScene(); });
  svg.addEventListener("pointerup", () => { drag = null; svg.classList.remove("dragging"); });
  svg.addEventListener("wheel", (event) => { event.preventDefault(); setZoom(event.deltaY < 0 ? 1.1 : 0.91); }, { passive: false });
}
categories.forEach(([label, key]) => { const button = document.createElement("button"); button.className = "chip"; button.textContent = label; button.dataset.key = key; button.addEventListener("click", () => { state.filter = key; document.querySelectorAll(".chip").forEach((item) => item.classList.toggle("active", item === button)); render(); }); filters.appendChild(button); });
filters.firstChild.classList.add("active");
[["协议继承", "protocol"], ["参数/距离提升", "metric"], ["实验技术改进", "hardware"], ["应用扩展", "application"]].forEach(([label, cls]) => { const item = document.createElement("span"); item.innerHTML = `<i class="${cls}"></i>${label}`; legend.appendChild(item); });
document.getElementById("search").addEventListener("input", (event) => { state.search = event.target.value; render(); });
document.getElementById("reset").addEventListener("click", () => { state.search = ""; state.filter = "all"; document.getElementById("search").value = ""; document.querySelectorAll(".chip").forEach((item, index) => item.classList.toggle("active", index === 0)); render(); });
document.getElementById("zoomIn").addEventListener("click", () => setZoom(1.2)); document.getElementById("zoomOut").addEventListener("click", () => setZoom(0.83));
document.getElementById("zoomReset").addEventListener("click", () => { state.scale = 1; state.tx = 0; state.ty = 0; drawScene(); });
document.getElementById("paperCount").textContent = papers.length; addPan(); render();
