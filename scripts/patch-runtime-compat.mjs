import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const nextPackagePath = join(projectRoot, "node_modules/next/package.json");
const nextPackage = JSON.parse(readFileSync(nextPackagePath, "utf8"));

if (nextPackage.version !== "16.4.3") {
  console.log(`Skipping runtime compatibility patch for Next.js ${nextPackage.version}.`);
  process.exit(0);
}

const replacements = [
  ["rawHeaders.hasOwnProperty(", "Object.prototype.hasOwnProperty.call(rawHeaders, "],
  ["headers.hasOwnProperty(", "Object.prototype.hasOwnProperty.call(headers, "],
  ["e.hasOwnProperty(a.r4)", "Object.prototype.hasOwnProperty.call(e,a.r4)"],
  ["e.hasOwnProperty(s.r4)", "Object.prototype.hasOwnProperty.call(e,s.r4)"],
  ["e.hasOwnProperty(i.r4)", "Object.prototype.hasOwnProperty.call(e,i.r4)"],
];
const searchRoots = [
  join(projectRoot, "node_modules/next/dist/compiled/next-server"),
  join(projectRoot, "node_modules/next/dist/server/api-utils"),
];
let changedFiles = 0;
let checksFound = 0;

function patchDirectory(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      patchDirectory(path);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".js")) continue;

    let source = readFileSync(path, "utf8");
    const original = source;
    for (const [search, replacement] of replacements) {
      checksFound += source.split(search).length - 1;
      source = source.replaceAll(search, replacement);
      checksFound += source.split(replacement).length - 1;
    }
    if (source !== original) {
      writeFileSync(path, source);
      changedFiles += 1;
    }
  }
}

for (const root of searchRoots) patchDirectory(root);

if (checksFound === 0) {
  throw new Error("Expected Next.js 16.4.3 header checks were not found.");
}

console.log(
  changedFiles === 0
    ? "Runtime compatibility checks are already patched."
    : `Patched runtime compatibility checks in ${changedFiles} files.`,
);
