#!/usr/bin/env node

import { execSync } from "node:child_process";

const diff = execSync("git diff --cached --unified=0", { encoding: "utf8" });

if (!diff.trim()) {
  console.log("ℹ️  Brak zmian w staged diff – pomijam kontrolę `space-y-*`.");
  process.exit(0);
}

const lintedExtensions = [".ts", ".tsx", ".js", ".jsx", ".css"];
const hasLintedExtension = (file) => lintedExtensions.some((ext) => file.endsWith(ext));
const bannedPattern = /space-y-/;

let currentFile = "";
const violations = [];

for (const rawLine of diff.split("\n")) {
  if (rawLine.startsWith("+++ b/")) {
    currentFile = rawLine.slice(6).trim();
    continue;
  }

  if (!rawLine.startsWith("+") || rawLine.startsWith("+++")) {
    continue;
  }

  if (!currentFile || !hasLintedExtension(currentFile)) {
    continue;
  }

  const line = rawLine.slice(1);
  if (bannedPattern.test(line)) {
    violations.push({ file: currentFile, line: line.trim() });
  }
}

if (violations.length > 0) {
  console.error("❌ Detected new `space-y-*` usage in staged files:");
  for (const violation of violations) {
    console.error(`  -> ${violation.file}: ${violation.line}`);
  }
  console.error("Please switch to `flex flex-col fluid-stack-*` before committing.");
  process.exit(1);
}

console.log("✅ No new `space-y-*` classes detected in staged changes.");

