/**
 * Sync DocHub static assets from the Vite simulator package into Next.js public/.
 * Run after updating files under "src/bound protocol simlator/public".
 *
 * Usage: node scripts/sync-simulator-public.mjs
 */
import { cpSync, mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync, rmSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src", "bound protocol simlator", "public");
const dst = join(root, "public");

const htmlFiles = [
  "bound-architecture.html",
  "bound-business-plan.html",
  "bound-competitors-analysis.html",
  "bound-cost-analysis.html",
  "bound-delivery-roadmap.html",
  "bound-gtm-strategy.html",
  "bound-investment-qa.html",
  "bound-market-analysis.html",
  "bound-seed-proposal.html",
  "bound-tokenomics-audit.html",
  "bound-whitepaper.html",
];

const dirs = ["decks", "evidence", "legal", "media"];

if (!existsSync(src)) {
  console.error("Simulator public folder not found:", src);
  process.exit(1);
}

mkdirSync(dst, { recursive: true });

for (const file of htmlFiles) {
  const from = join(src, file);
  const to = join(dst, file);
  if (!existsSync(from)) {
    console.warn("skip missing", file);
    continue;
  }
  let html = readFileSync(from, "utf8");
  // Standalone Vite hub is /#docs; Next.js hub is /dataroom#docs
  html = html.replaceAll("location.assign('/#docs')", "location.assign('/dataroom#docs')");
  html = html.replaceAll("location.assign('/simulator#docs')", "location.assign('/dataroom#docs')");
  writeFileSync(to, html, "utf8");
  console.log("synced", file);
}

for (const dir of dirs) {
  const from = join(src, dir);
  const to = join(dst, dir);
  if (!existsSync(from)) {
    console.warn("skip missing dir", dir);
    continue;
  }
  if (existsSync(to)) rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
  console.log("synced dir", dir, `(${readdirSync(from).length} top-level entries)`);
}

console.log("Done.");
