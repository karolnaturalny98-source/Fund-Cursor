// audit-ui-tree-pro.js
// -----------------------------------------------------------
// Pełny audyt UI komponentów + metryki złożoności + HTML raport
// -----------------------------------------------------------

import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, "app");
const COMPONENTS_DIR = path.join(ROOT, "components");

const readFileSafe = (file) => {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
};

const getAllFiles = (dir, ext = [".tsx", ".ts"]) => {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllFiles(full, ext));
    } else if (ext.some((e) => full.endsWith(e))) {
      results.push(full);
    }
  }
  return results;
};

// 1️⃣ Budowa mapy importów
console.log("📦 Buduję mapę importów komponentów...");
const allFiles = getAllFiles(COMPONENTS_DIR);
const importMap = {};
for (const file of allFiles) {
  const content = readFileSafe(file);
  const imports = Array.from(content.matchAll(/from\s+['"](.+?)['"]/g)).map(
    (m) => m[1]
  );
  importMap[file] = imports;
}

// 2️⃣ Lista stron
const pages = getAllFiles(APP_DIR).filter((f) => f.endsWith("page.tsx"));

// 3️⃣ Funkcja budująca drzewo
function buildDependencyTree(file, seen = new Set()) {
  if (seen.has(file)) return null;
  seen.add(file);

  const imports = importMap[file] || [];
  const node = { name: path.relative(ROOT, file), type: "component", children: [] };

  for (const i of imports) {
    if (i.startsWith("@/components/ui/")) {
      node.children.push({
        name: i.replace("@/components/", ""),
        type: "ui",
        children: [],
      });
    } else if (i.startsWith("@/components/")) {
      const local = i.replace("@/components/", "");
      const tsx = path.join(COMPONENTS_DIR, local + ".tsx");
      const ts = path.join(COMPONENTS_DIR, local + ".ts");
      const childPath = fs.existsSync(tsx) ? tsx : fs.existsSync(ts) ? ts : null;
      if (childPath) {
        const childNode = buildDependencyTree(childPath, seen);
        if (childNode) node.children.push(childNode);
      }
    }
  }
  return node;
}

// 4️⃣ Pomocnicze metryki
function collectMetrics(node, depth = 1, metrics = { depth: 1, total: 0, ui: 0 }) {
  if (!node) return metrics;
  metrics.total++;
  metrics.depth = Math.max(metrics.depth, depth);
  if (node.type === "ui") metrics.ui++;
  node.children.forEach((c) => collectMetrics(c, depth + 1, metrics));
  return metrics;
}

// 5️⃣ Analiza stron
console.log("🔍 Analizuję strony...");
const report = [];
for (const page of pages) {
  const tree = buildDependencyTree(page);
  const uiSet = new Set();

  function collectUI(node) {
    if (!node) return;
    if (node.type === "ui") uiSet.add(node.name);
    node.children.forEach(collectUI);
  }
  collectUI(tree);

  const metrics = collectMetrics(tree);
  const complexity = (metrics.depth * uiSet.size) + (metrics.total / 10);

  report.push({
    page: path.relative(ROOT, page),
    uiComponents: Array.from(uiSet).sort(),
    metrics: {
      ...metrics,
      uiCount: uiSet.size,
      complexity: complexity.toFixed(1),
    },
    dependencyTree: tree,
  });
}

// 6️⃣ Generowanie HTML raportu
console.log("🧱 Generuję raport HTML...");

function renderTree(node) {
  if (!node) return "";
  const label =
    node.type === "ui"
      ? `<span class="ui">💠 ${node.name}</span>`
      : `<span>${node.name}</span>`;
  if (!node.children.length) return `<li>${label}</li>`;
  return `<li><details><summary>${label}</summary><ul>${node.children
    .map(renderTree)
    .join("")}</ul></details></li>`;
}

const html = `
<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<title>UI Dependency Tree - PRO Report</title>
<style>
  body { font-family: 'Segoe UI', sans-serif; background: #f8fafc; color: #111; padding: 2rem; }
  h1 { color: #2563eb; }
  .summary { background: #e0f2fe; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; }
  .page { background: #fff; padding: 1rem 1.5rem; margin-bottom: 1.2rem; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  ul { list-style-type: none; padding-left: 1.5rem; }
  li { margin: 4px 0; }
  summary { cursor: pointer; font-weight: 500; }
  .ui { color: #059669; font-weight: bold; }
  .metrics { font-size: 0.9rem; color: #334155; margin-bottom: 0.5rem; }
  .high { color: #dc2626; font-weight: bold; }
  details[open] summary { color: #1d4ed8; }
</style>
</head>
<body>
<h1>📊 UI Dependency Tree – PRO Report</h1>

<div class="summary">
  <strong>Stron:</strong> ${report.length}<br>
  <strong>Z komponentami UI:</strong> ${
    report.filter((r) => r.uiComponents.length > 0).length
  }<br>
  <strong>Bez komponentów UI:</strong> ${
    report.filter((r) => r.uiComponents.length === 0).length
  }
</div>

${report
  .map((r) => {
    const c = r.metrics.complexity > 30 ? "high" : "";
    return `
    <div class="page">
      <h2>${r.page}</h2>
      <div class="metrics">
        UI count: <strong>${r.metrics.uiCount}</strong> |
        Depth: <strong>${r.metrics.depth}</strong> |
        Total deps: <strong>${r.metrics.total}</strong> |
        Complexity: <strong class="${c}">${r.metrics.complexity}</strong>
      </div>
      <p><strong>Komponenty UI:</strong> ${
        r.uiComponents.length
          ? r.uiComponents.join(", ")
          : "<em>brak komponentów UI</em>"
      }</p>
      <ul>${renderTree(r.dependencyTree)}</ul>
    </div>`;
  })
  .join("")}
</body>
</html>
`;

fs.writeFileSync(".ui-tree-pro.html", html, "utf8");
console.log("✅ Wygenerowano raport: .ui-tree-pro.html");
