const base = window.ES_DATA;
const overrides = window.ES_METADATA || {};
const watchlist = window.ES_WATCHLIST || { papers: [], edges: [] };
const papers = base.papers.concat(watchlist.papers).map((paper) => Object.assign({}, paper, overrides[paper.id] || {}));
const edges = base.edges.concat(watchlist.edges);

// The map is deliberately information-dense: cards carry the same headline
// quantities as the table, while the edge caption explains what changed.
const CARD_W = 280;
const CARD_H = 220;
const CARD_GAP = 34;
const MAP_W = 2400;
const MAP_H = 1900;
const SVG_NS = "http://www.w3.org/2000/svg";
const edgeLabels = {
  "zukowski1993>pan1998": "从理论 event-ready 到首次光子交换",
  "pan1998>duan2001": "把光子 BSM 推广到 memory repeater 架构",
  "duan2001>chou2005": "DLCZ single-click：纠缠写入远端 ensemble",
  "chou2005>chou2007": "异步准备两对 memory → functional node",
  "duan2001>yuan2008": "BDCZ/TPI：用两光子 BSM 建立 repeater node",
  "yuan2008>yu2020": "300 m → 22 km field / 50 km coiled fibre",
  "chou2007>jing2019": "两 memory → 三 memory multipartite entanglement",
  "yu2020>lago2021": "telecom herald + AFC temporal multiplexing",
  "yu2020>liu2021": "ensemble QFC → absorptive AFC memory",
  "yu2020>luo2022": "城域距离扩展：12.5 km 独立节点",
  "luo2022>liu2024": "postselected link → 三节点并发纠缠",
  "luo2022>knaut2024": "atomic ensemble → nanophotonic spin register",
  "luo2022>stolk2024": "postselected → fully-live herald/feed-forward",
  "lago2021>zhu2025": "62 modes → 1205 modes；加入 CHSH",
  "liu2021>zhu2025": "AFC memory + TPI → metropolitan repeater",
  "stolk2024>zhu2025": "live herald/feed-forward → Bell-nonlocal repeater",
  "yu2020>luo2026": "1522 nm S-band + 双频锁相 → 420 km",
  "duan2001>luo2026": "DLCZ/SPI 架构的长光纤相位稳定化",
  "yuan2008>vanleent2022": "ensemble repeater node → single-atom TPI",
  "luo2026>lu2026_diqkd": "SPI/QFC 链路 → 100 km DI-QKD",
  "knaut2024>liu2026_ion": "长寿命 register → trapped-ion repeater memory",
  "stolk2024>liu2026_ion": "live heralding → ion–ion DI-QKD"
};

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
function shortLine(value, max = 43) {
  const text = String(value ?? "-").replace(/\s+/g, " ");
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
function edgeRecord(edge) {
  if (Array.isArray(edge)) return { from: edge[0], to: edge[1], type: edge[2] || "protocol" };
  return edge;
}
function laneFor(paper) {
  if (paper.y <= 130) return 0;
  if (paper.y <= 230) return 1;
  if (paper.y <= 330) return 2;
  return 3;
}
function makeLayout() {
  // Preserve the original chronological order, but wrap it into a readable
  // grid. This prevents the large cards from colliding while keeping branch
  // lanes (TPI, hardware, applications) visually distinct.
  const ordered = papers.slice().sort((a, b) => (a.x - b.x) || (a.y - b.y));
  const base = ordered.map((paper, index) => {
    const column = index % 7;
    const row = Math.floor(index / 7);
    return {
      id: paper.id,
      x: 30 + column * 330,
      y: 30 + row * 400 + laneFor(paper) * 245
    };
  });

  // The old row/lane formula could place two cards in the same column on top
  // of each other (most visibly Lago-Rivera 2021 and Zhu 2025). Push cards
  // down only when their actual rectangles collide, preserving the compact
  // chronological layout everywhere else.
  const columns = new Map();
  base.forEach((item) => {
    const column = Math.round((item.x - 30) / 330);
    if (!columns.has(column)) columns.set(column, []);
    columns.get(column).push(item);
  });
  columns.forEach((items) => {
    items.sort((a, b) => a.y - b.y);
    let nextY = -Infinity;
    items.forEach((item) => {
      item.y = Math.max(item.y, nextY);
      nextY = item.y + CARD_H + CARD_GAP;
    });
  });
  return new Map(base.map(({ id, x, y }) => [id, { x, y }]));
}
function setZoom(factor) { state.scale = Math.max(0.55, Math.min(2.8, state.scale * factor)); drawScene(); }
function drawScene() { scene.setAttribute("transform", `translate(${state.tx} ${state.ty}) scale(${state.scale})`); scene.querySelectorAll(".node").forEach((node) => node.classList.toggle("selected", node.dataset.id === state.selected)); }

function uniqueSorted(values) {
  return [...new Set(values.map((value) => Math.round(value * 100) / 100))].sort((a, b) => a - b);
}

function rectFor(position, margin = 0) {
  return {
    left: position.x - margin,
    right: position.x + CARD_W + margin,
    top: position.y - margin,
    bottom: position.y + CARD_H + margin
  };
}

function segmentClear(a, b, obstacles) {
  const horizontal = Math.abs(a.y - b.y) < 0.01;
  const vertical = Math.abs(a.x - b.x) < 0.01;
  if (!horizontal && !vertical) return false;
  return !obstacles.some((obstacle) => {
    if (horizontal) {
      const left = Math.min(a.x, b.x); const right = Math.max(a.x, b.x);
      return a.y > obstacle.top && a.y < obstacle.bottom && right > obstacle.left && left < obstacle.right;
    }
    const top = Math.min(a.y, b.y); const bottom = Math.max(a.y, b.y);
    return a.x > obstacle.left && a.x < obstacle.right && bottom > obstacle.top && top < obstacle.bottom;
  });
}

function routeEdge(from, to, layout, visible) {
  const a = layout.get(from.id); const b = layout.get(to.id);
  const horizontal = Math.abs(b.x - a.x) >= Math.abs(b.y - a.y);
  const forward = horizontal ? b.x >= a.x : b.y >= a.y;
  let start; let end; let initialDir;
  if (horizontal) {
    start = { x: forward ? a.x + CARD_W : a.x, y: a.y + CARD_H / 2 };
    end = { x: forward ? b.x : b.x + CARD_W, y: b.y + CARD_H / 2 };
    initialDir = forward ? 1 : 3;
  } else {
    start = { x: a.x + CARD_W / 2, y: forward ? a.y + CARD_H : a.y };
    end = { x: b.x + CARD_W / 2, y: forward ? b.y : b.y + CARD_H };
    initialDir = forward ? 2 : 0;
  }

  const others = visible
    .filter((paper) => paper.id !== from.id && paper.id !== to.id)
    .map((paper) => rectFor(layout.get(paper.id), 22));
  const xs = uniqueSorted([
    0, MAP_W, start.x, end.x,
    ...others.flatMap((obstacle) => [obstacle.left, obstacle.right])
  ]);
  const ys = uniqueSorted([
    0, MAP_H, start.y, end.y,
    ...others.flatMap((obstacle) => [obstacle.top, obstacle.bottom])
  ]);
  const startX = xs.indexOf(start.x); const startY = ys.indexOf(start.y);
  const endX = xs.indexOf(end.x); const endY = ys.indexOf(end.y);
  const stateKey = (x, y, direction) => `${x},${y},${direction}`;
  const queue = [{ x: startX, y: startY, direction: -1, cost: 0 }];
  const distances = new Map([[stateKey(startX, startY, -1), 0]]);
  const previous = new Map();
  const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  const points = (x, y) => ({ x: xs[x], y: ys[y] });
  let finish = null;

  while (queue.length) {
    queue.sort((left, right) => left.cost - right.cost);
    const current = queue.shift();
    if (current.x === endX && current.y === endY) { finish = current; break; }
    directions.forEach(([dx, dy], nextDirection) => {
      if (current.direction === -1 && nextDirection !== initialDir) return;
      const nx = current.x + dx; const ny = current.y + dy;
      if (nx < 0 || ny < 0 || nx >= xs.length || ny >= ys.length) return;
      const here = points(current.x, current.y); const next = points(nx, ny);
      if (!segmentClear(here, next, others)) return;
      const length = Math.abs(next.x - here.x) + Math.abs(next.y - here.y);
      const turnPenalty = current.direction >= 0 && current.direction !== nextDirection ? 48 : 0;
      const cost = current.cost + length + turnPenalty;
      const key = stateKey(nx, ny, nextDirection);
      if (cost >= (distances.get(key) ?? Infinity)) return;
      distances.set(key, cost);
      previous.set(key, stateKey(current.x, current.y, current.direction));
      queue.push({ x: nx, y: ny, direction: nextDirection, cost });
    });
  }

  if (!finish) return [start, end];
  let key = stateKey(finish.x, finish.y, finish.direction);
  const path = [];
  while (key) {
    const [x, y] = key.split(",").map(Number);
    path.unshift(points(x, y));
    key = previous.get(key);
  }
  return path;
}

function simplifyPath(path) {
  return path.filter((point, index) => {
    if (index === 0 || index === path.length - 1) return true;
    const previous = path[index - 1]; const next = path[index + 1];
    return !((Math.abs(previous.x - point.x) < 0.01 && Math.abs(point.x - next.x) < 0.01)
      || (Math.abs(previous.y - point.y) < 0.01 && Math.abs(point.y - next.y) < 0.01));
  });
}

function pathD(path) {
  return simplifyPath(path).map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ");
}

function pointAlong(path, fraction = 0.5) {
  const segments = path.slice(1).map((point, index) => ({
    from: path[index], to: point,
    length: Math.hypot(point.x - path[index].x, point.y - path[index].y)
  }));
  const total = segments.reduce((sum, segment) => sum + segment.length, 0);
  let distance = total * fraction;
  for (const segment of segments) {
    if (distance <= segment.length) {
      const ratio = segment.length ? distance / segment.length : 0;
      return {
        x: segment.from.x + (segment.to.x - segment.from.x) * ratio,
        y: segment.from.y + (segment.to.y - segment.from.y) * ratio,
        horizontal: Math.abs(segment.to.y - segment.from.y) < 0.01
      };
    }
    distance -= segment.length;
  }
  const last = path[path.length - 1]; return { x: last.x, y: last.y, horizontal: true };
}

function textWidth(text, fontSize = 11) {
  return [...String(text)].reduce((width, character) => width + (/[^\x00-\x7F]/.test(character) ? fontSize : fontSize * 0.56), 0);
}

function fitText(text, maxWidth, fontSize = 10.5) {
  const value = String(text ?? "-").replace(/\s+/g, " ");
  if (textWidth(value, fontSize) <= maxWidth) return value;
  let result = "";
  for (const character of [...value]) {
    if (textWidth(`${result}${character}…`, fontSize) > maxWidth) break;
    result += character;
  }
  return `${result}…`;
}

function wrapLabel(text, maxWidth = 205) {
  const lines = []; let line = "";
  [...String(text)].forEach((character) => {
    if (line && textWidth(`${line}${character}`, 11) > maxWidth) { lines.push(line); line = ""; }
    line += character;
  });
  if (line) lines.push(line);
  if (lines.length <= 2) return lines;
  return [lines[0], fitText(lines.slice(1).join(""), maxWidth - 10, 11)];
}

function overlaps(left, right) {
  return left.left < right.right && left.right > right.left && left.top < right.bottom && left.bottom > right.top;
}

function placeLabel(anchor, lines, nodeRects, placedLabels) {
  const width = Math.min(225, Math.max(92, Math.max(...lines.map((line) => textWidth(line, 11))) + 16));
  const height = lines.length * 14 + 8;
  // Same-row edges run through the narrow gap between two cards. Their text
  // must therefore be lifted above or below the whole card row, not merely
  // nudged a few pixels away from the path.
  const candidates = [
    [0, -150], [0, 150], [0, -105], [0, 105], [0, -70], [0, 70],
    [-80, -150], [80, -150], [-80, 150], [80, 150],
    [-80, -70], [80, -70], [-80, 70], [80, 70], [-120, 0], [120, 0]
  ];
  for (const [dx, dy] of candidates) {
    const left = Math.max(4, Math.min(MAP_W - width - 4, anchor.x - width / 2 + dx));
    const top = Math.max(4, Math.min(MAP_H - height - 4, anchor.y - height / 2 + dy));
    const box = { left, right: left + width, top, bottom: top + height };
    if (nodeRects.some((rect) => overlaps(box, rect)) || placedLabels.some((rect) => overlaps(box, rect))) continue;
    placedLabels.push(box);
    return { ...box, lines };
  }
  const left = Math.max(4, Math.min(MAP_W - width - 4, anchor.x - width / 2));
  const top = Math.max(4, Math.min(MAP_H - height - 4, anchor.y - height / 2));
  const box = { left, right: left + width, top, bottom: top + height };
  placedLabels.push(box);
  return { ...box, lines };
}

function render() {
  const visible = papers.filter(matches);
  document.getElementById("tableCount").textContent = `${visible.length} / ${papers.length} 篇可见`;
  scene.innerHTML = "";
  const byId = new Map(papers.map((paper) => [paper.id, paper]));
  const layout = makeLayout();
  const nodeRects = visible.map((paper) => rectFor(layout.get(paper.id), 5));
  const edgeRecords = [];
  edges.map(edgeRecord).forEach(({ from, to, type }) => {
    const a = byId.get(from); const b = byId.get(to);
    if (!a || !b || !matches(a) || !matches(b)) return;
    const route = routeEdge(a, b, layout, visible);
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", pathD(route));
    path.setAttribute("class", `edge ${type}`); scene.appendChild(path);
    path.dataset.from = from;
    path.dataset.to = to;
    const key = `${from}>${to}`;
    const caption = shortLine((edgeLabels[key] || ({ protocol: "协议/架构继承", metric: "参数或距离提升", hardware: "实验技术改进", application: "应用扩展" }[type] || "关系")), 46);
    edgeRecords.push({ route, type, caption });
  });
  const placedLabels = [];
  edgeRecords.forEach(({ route, type, caption }) => {
    const labelBox = placeLabel(pointAlong(route), wrapLabel(caption), nodeRects, placedLabels);
    const group = document.createElementNS(SVG_NS, "g");
    group.setAttribute("class", `edge-label-group ${type}`);
    const background = document.createElementNS(SVG_NS, "rect");
    background.setAttribute("class", "edge-label-bg");
    background.setAttribute("x", labelBox.left); background.setAttribute("y", labelBox.top);
    background.setAttribute("width", labelBox.right - labelBox.left); background.setAttribute("height", labelBox.bottom - labelBox.top);
    const label = document.createElementNS(SVG_NS, "text");
    label.setAttribute("class", `edge-label ${type}`);
    label.setAttribute("x", labelBox.left + 8); label.setAttribute("y", labelBox.top + 14);
    labelBox.lines.forEach((line, index) => {
      const tspan = document.createElementNS(SVG_NS, "tspan");
      tspan.setAttribute("x", labelBox.left + 8); tspan.setAttribute("dy", index ? 14 : 0); tspan.textContent = line;
      label.appendChild(tspan);
    });
    group.append(background, label); scene.appendChild(group);
  });
  visible.forEach((paper) => {
    const pos = layout.get(paper.id);
    const node = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const lines = [
      `${paper.year} · ${paper.short}`,
      `memory: ${paper.memory} · ${paper.material}`,
      `source: ${paper.source}`,
      `protocol: ${paper.protocol}`,
      `ηmem: ${paper.memoryEfficiency || "-"} · ηint: ${paper.interfaceEfficiency || paper.efficiency || "-"}`,
      `storage: ${paper.storage}`,
      `SPI: P=${paper.spi.p} · C=${paper.spi.c}`,
      `TPI: V=${paper.tpi.hom} · P=${paper.tpi.p} · F=${paper.tpi.f}`,
      `distance: ${paper.distance}`,
      `app: ${paper.applications.join(" / ")}`,
      `feature: ${paper.features}`
    ].map((line, index) => fitText(line, CARD_W - 24, index === 0 ? 13 : 10.5));
    node.classList.add("node"); node.dataset.id = paper.id; node.setAttribute("transform", `translate(${pos.x} ${pos.y})`); node.setAttribute("clip-path", "url(#node-clip)");
    node.innerHTML = `<rect class="node-card" width="${CARD_W}" height="${CARD_H}"></rect>${lines.map((line, index) => `<text class="${index === 0 ? "node-title" : "node-line"}" x="12" y="${20 + index * 18}">${esc(line)}</text>`).join("")}`;
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
  svg.addEventListener("wheel", (event) => { event.preventDefault(); setZoom(event.deltaY < 0 ? 1.04 : 0.96); }, { passive: false });
}
categories.forEach(([label, key]) => { const button = document.createElement("button"); button.className = "chip"; button.textContent = label; button.dataset.key = key; button.addEventListener("click", () => { state.filter = key; document.querySelectorAll(".chip").forEach((item) => item.classList.toggle("active", item === button)); render(); }); filters.appendChild(button); });
filters.firstChild.classList.add("active");
[["协议继承", "protocol"], ["参数/距离提升", "metric"], ["实验技术改进", "hardware"], ["应用扩展", "application"]].forEach(([label, cls]) => { const item = document.createElement("span"); item.innerHTML = `<i class="${cls}"></i>${label}`; legend.appendChild(item); });
document.getElementById("search").addEventListener("input", (event) => { state.search = event.target.value; render(); });
document.getElementById("reset").addEventListener("click", () => { state.search = ""; state.filter = "all"; document.getElementById("search").value = ""; document.querySelectorAll(".chip").forEach((item, index) => item.classList.toggle("active", index === 0)); render(); });
document.getElementById("zoomIn").addEventListener("click", () => setZoom(1.06)); document.getElementById("zoomOut").addEventListener("click", () => setZoom(0.943));
document.getElementById("zoomReset").addEventListener("click", () => { state.scale = 1; state.tx = 0; state.ty = 0; drawScene(); });
document.getElementById("paperCount").textContent = papers.length; addPan(); render();
