// audit-ui-dependency-tree.js
// -----------------------------------------------------------
// Pełny audyt zależności komponentów shadcn/ui
// Strona → komponenty pośrednie → komponenty UI
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

// --- Krok 1: Zbuduj mapę importów dla wszystkich plików ---
console.log("📦 Buduję mapę importów...");
const allFiles = getAllFiles(COMPONENTS_DIR);
const importMap = {};

for (const file of allFiles) {
  const content = readFileSafe(file);
  const imports = Array.from(content.matchAll(/from\s+['"](.+?)['"]/g)).map(
    (m) => m[1]
  );
  importMap[file] = imports;
}

// --- Krok 2: Lista plików stron ---
const pages = getAllFiles(APP_DIR).filter((f) => f.endsWith("page.tsx"));

// --- Krok 3: Pomocnicze funkcje ---
const visited = new Map();

function resolveComponentImports(file) {
  if (visited.has(file)) return visited.get(file);
  const imports = importMap[file] || [];
  const resolved = new Set();

  for (const i of imports) {
    if (i.startsWith("@/components/")) {
      const localPath = i.replace("@/components/", "");
      const tsx = path.join(COMPONENTS_DIR, localPath + ".tsx");
      const ts = path.join(COMPONENTS_DIR, localPath + ".ts");

      if (fs.existsSync(tsx)) resolved.add(tsx);
      else if (fs.existsSync(ts)) resolved.add(ts);
    }
  }

  visited.set(file, Array.from(resolved));
  return visited.get(file);
}

// --- Krok 4: Szukaj komponentów UI w całym drzewie ---
function findUIComponentsRecursive(file, seen = new Set()) {
  if (seen.has(file)) return new Set();
  seen.add(file);

  const uiComponents = new Set();
  const imports = importMap[file] || [];

  // Bezpośrednie użycie UI
  for (const i of imports) {
    if (i.startsWith("@/components/ui/")) {
      uiComponents.add(i.replace("@/components/ui/", ""));
    }
  }

  // Pośrednie użycie
  for (const dep of resolveComponentImports(file)) {
    for (const ui of findUIComponentsRecursive(dep, seen)) {
      uiComponents.add(ui);
    }
  }

  return uiComponents;
}

// --- Krok 5: Analiza każdej strony ---
console.log("🔍 Analizuję zależności stron...");
const report = [];

for (const page of pages) {
  const uiUsed = findUIComponentsRecursive(page);
  report.push({
    page: path.relative(ROOT, page),
    uiComponents: Array.from(uiUsed).sort(),
  });
}

// --- Krok 6: Wyniki ---
const summary = {
  totalPages: report.length,
  withUI: report.filter((r) => r.uiComponents.length > 0).length,
  withoutUI: report.filter((r) => r.uiComponents.length === 0).length,
};

console.log("\n📊 Podsumowanie:");
console.table(summary);

console.log("\n🔹 Strony korzystające z komponentów UI:");
for (const r of report.filter((r) => r.uiComponents.length > 0)) {
  console.log(`\n✅ ${r.page}`);
  console.log(`   → ${r.uiComponents.join(", ")}`);
}

console.log("\n🔸 Strony bez komponentów UI:");
for (const r of report.filter((r) => r.uiComponents.length === 0)) {
  console.log(`⚠️  ${r.page}`);
}

fs.writeFileSync(
  ".ui-dependency-tree.json",
  JSON.stringify({ summary, details: report }, null, 2),
  "utf8"
);

console.log("\n✅ Zapisano raport: .ui-dependency-tree.json");
