/**
 * Inject mobile CSS/JS into all bound-*.html docs in public/.
 * Also run from sync-simulator-public.mjs after copying HTML.
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");

const MOBILE_LINKS =
  '<link rel="stylesheet" href="/bound-doc-mobile.css">\n<script src="/bound-doc-mobile.js" defer></script>';

function injectMobile(html) {
  if (html.includes("/bound-doc-mobile.css")) return html;

  if (html.includes("</head>")) {
    return html.replace("</head>", `${MOBILE_LINKS}\n</head>`);
  }
  return html;
}

const files = readdirSync(publicDir).filter((f) => f.startsWith("bound-") && f.endsWith(".html"));

for (const file of files) {
  const path = join(publicDir, file);
  const html = readFileSync(path, "utf8");
  const next = injectMobile(html);
  if (next !== html) {
    writeFileSync(path, next, "utf8");
    console.log("patched mobile assets:", file);
  }
}

console.log("Done.");
