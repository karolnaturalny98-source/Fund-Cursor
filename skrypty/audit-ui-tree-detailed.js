// audit-ui-tree-detailed.js
// -----------------------------------------------------------
// Pełny audyt: Strony → Komponenty pośrednie → Komponenty UI
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

// --- 1️⃣ Zbierz wszystkie importy ---
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

// --- 2️⃣ Lista wszystkich stron ---
const pages = getAllFiles(APP_DIR).filter((f) => f.endsWith("page.tsx"));

// --- 3️⃣ Funkcja do budowy drzewa zależności ---
function buildDependencyTree(file, seen = new Set()) {
  if (seen.has(file)) return null;
  seen.add(file);

  const imports = importMap[file] || [];
  const node = { name: path.relative(ROOT, file), children: [] };

  for (const i of imports) {
    if (i.startsWith("@/components/ui/")) {
      node.children.push({
        name: i.replace("@/components/", ""),
        type: "ui",
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

// --- 4️⃣ Analiza stron ---
console.log("🔍 Analizuję strony...");
const report = [];

for (const page of pages) {
  const tree = buildDependencyTree(page);
  const uiSet = new Set();

  // Zbierz wszystkie UI komponenty z drzewa
  function collectUI(node) {
    if (!node) return;
    if (node.type === "ui") uiSet.add(node.name);
    node.children.forEach(collectUI);
  }
  collectUI(tree);

  report.push({
    page: path.relative(ROOT, page),
    uiComponents: Array.from(uiSet).sort(),
    dependencyTree: tree,
  });
}

// --- 5️⃣ Raport ---
const summary = {
  totalPages: report.length,
  withUI: report.filter((r) => r.uiComponents.length > 0).length,
  withoutUI: report.filter((r) => r.uiComponents.length === 0).length,
};

console.log("\n📊 Podsumowanie:");
console.table(summary);

for (const r of report) {
  console.log(`\n🧩 ${r.page}`);
  if (r.uiComponents.length === 0) {
    console.log("   ⚠️  brak komponentów UI");
  } else {
    console.log(`   ✅ użyte UI: ${r.uiComponents.join(", ")}`);
  }
}

// --- 6️⃣ Zapis do pliku ---
fs.writeFileSync(
  ".ui-tree-detailed.json",
  JSON.stringify({ summary, details: report }, null, 2),
  "utf8"
);

console.log("\n✅ Zapisano raport: .ui-tree-detailed.json");
