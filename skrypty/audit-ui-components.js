// audit-ui-components.js
// -----------------------------------------------------
// Skrypt: wykrywa, które komponenty z "@/components/ui"
// są używane w jakich plikach projektu
// -----------------------------------------------------

import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const TARGET_DIRS = ["app", "components"];
const FILE_EXTENSIONS = [".tsx", ".ts"];

function getAllFiles(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllFiles(full));
    } else if (FILE_EXTENSIONS.some((ext) => full.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

function readFileSafe(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

// --- Analiza ---
const allFiles = TARGET_DIRS.flatMap((d) => getAllFiles(path.join(ROOT, d)));
const usage = {};

console.log("🔍 Analizuję importy z @/components/ui/...");

for (const file of allFiles) {
  const content = readFileSafe(file);
  const matches = Array.from(
    content.matchAll(/from\s+['"]@\/components\/ui\/([^'"]+)['"]/g)
  );
  for (const match of matches) {
    const component = match[1];
    if (!usage[component]) usage[component] = [];
    usage[component].push(path.relative(ROOT, file));
  }
}

// --- Raport ---
const sortedUsage = Object.fromEntries(
  Object.entries(usage)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => [k, [...new Set(v)].sort()])
);

const summary = Object.keys(sortedUsage).map((k) => ({
  component: k,
  count: sortedUsage[k].length,
}));

console.log("\n📊 Podsumowanie użycia komponentów shadcn/ui:");
console.table(summary);

fs.writeFileSync(
  ".ui-components-usage.json",
  JSON.stringify(sortedUsage, null, 2),
  "utf8"
);

console.log("\n✅ Zapisano raport: .ui-components-usage.json");
