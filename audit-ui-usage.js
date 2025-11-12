// audit-ui-usage.js
// -----------------------------------------------------
// Sprawdza, które strony (page.tsx) korzystają bezpośrednio
// lub pośrednio z komponentów z "@/components/ui/*"
// -----------------------------------------------------

import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, "app");
const COMPONENTS_DIR = path.join(ROOT, "components");

// Helpery
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

// --- 1. Zbierz wszystkie komponenty i ich importy ---
console.log("📦 Skrypt: analizuję komponenty...");
const allFiles = getAllFiles(COMPONENTS_DIR);
const importMap = {};

for (const file of allFiles) {
  const content = readFileSafe(file);
  const imports = Array.from(
    content.matchAll(/from\s+['"](.+?)['"]/g)
  ).map((m) => m[1]);
  importMap[file] = imports;
}

// --- 2. Znajdź wszystkie page.tsx ---
const pages = getAllFiles(APP_DIR).filter((f) => f.endsWith("page.tsx"));

// --- 3. Funkcja rekurencyjna: czy dany plik używa @/components/ui ---
const cache = new Map();
function usesUI(file) {
  if (cache.has(file)) return cache.get(file);
  const imports = importMap[file] || [];
  if (imports.some((i) => i.startsWith("@/components/ui/"))) {
    cache.set(file, true);
    return true;
  }
  // szukaj pośrednich zależności
  for (const i of imports) {
    if (i.startsWith("@/components/")) {
      const target = path.join(
        COMPONENTS_DIR,
        i.replace("@/components/", "")
      );
      const tsx = target + ".tsx";
      const ts = target + ".ts";
      if (fs.existsSync(tsx) && usesUI(tsx)) {
        cache.set(file, true);
        return true;
      }
      if (fs.existsSync(ts) && usesUI(ts)) {
        cache.set(file, true);
        return true;
      }
    }
  }
  cache.set(file, false);
  return false;
}

// --- 4. Analiza stron ---
console.log("🔍 Analizuję strony...");
const report = pages.map((page) => ({
  page: path.relative(ROOT, page),
  usesUI: usesUI(page),
}));

// --- 5. Wynik ---
const summary = {
  totalPages: report.length,
  usingUI: report.filter((p) => p.usesUI).length,
  notUsingUI: report.filter((p) => !p.usesUI).length,
};

console.log("\n📊 Raport użycia shadcn/ui:");
console.table(summary);
console.log("\n🔹 Strony korzystające z @/components/ui:");
report
  .filter((r) => r.usesUI)
  .forEach((r) => console.log("  ✅", r.page));
console.log("\n🔸 Strony NIEkorzystające z @/components/ui:");
report
  .filter((r) => !r.usesUI)
  .forEach((r) => console.log("  ⚠️ ", r.page));

fs.writeFileSync(
  ".ui-usage-report.json",
  JSON.stringify({ summary, details: report }, null, 2),
  "utf8"
);

console.log("\n✅ Zapisano raport: .ui-usage-report.json");
