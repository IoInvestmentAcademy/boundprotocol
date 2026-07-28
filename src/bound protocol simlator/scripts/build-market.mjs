// Build the BOUND Protocol Market Analysis — public/bound-market-analysis.html
//
// Content comes verbatim from scripts/market-content.json, generated from
// BOUND_Market_Analysis_July2026.docx by scripts/gen-market-content.py (which also
// applies the approved BCI -> BLI terminology correction). This script assigns
// presentation only; it never rewrites, summarises, or truncates the source text.
//
// Shares the BND Token Economic Audit stylesheet so all three documents match.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PRINT_CSS, PRINT_BUTTON } from "./print-css.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const doc = JSON.parse(readFileSync(path.join(root, "scripts/market-content.json"), "utf8"));

/* ---------- helpers ---------- */
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Bold a leading "Label:" lead-in. Guarded so a mid-sentence colon can never split a paragraph.
const LABEL_MAX = 60;
function lead(text) {
  const i = text.indexOf(":");
  if (i < 0 || i > LABEL_MAX) return esc(text);
  return `<b>${esc(text.slice(0, i + 1))}</b>${esc(text.slice(i + 1))}`;
}

// Make URLs clickable without altering a single visible character.
const linkify = html => html.replace(/https?:\/\/[^\s<]+[^\s<.,)]/g,
  m => `<a href="${m}" target="_blank" rel="noopener noreferrer">${m}</a>`);

const para = b => `<p>${b.boldLabel ? lead(b.text) : esc(b.text)}</p>`;
const list = b => `<ul class="find">${b.items.map(i => `<li>${b.boldLabel ? lead(i) : esc(i)}</li>`).join("")}</ul>`;
const cite = b => `<p class="cite">${linkify(esc(b.text))}</p>`;
const note = b => `<div class="note">${esc(b.text)}</div>`;
const cap = t => `<div class="cap">${esc(t)}</div>`;

const table = b => `<div class="tbl-scroll"><table><thead><tr>${
  b.head.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${
  b.rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")
}</tbody></table></div>` + (b.cap ? cap(b.cap) : "");

function render(blocks) {
  return blocks.map(b => {
    switch (b.t) {
      case "p": return para(b);
      case "ul": return list(b);
      case "cite": return cite(b);
      case "note": return note(b);
      case "table": return table(b);
      case "sub": return `<h4 class="sub">${esc(b.title)}</h4>${render(b.blocks)}`;
      default: throw new Error(`unknown block type: ${b.t}`);
    }
  }).join("\n");
}

/* ---------- body ---------- */
const B = doc.chapters.map(ch => `<section id="${ch.id}"><div class="sec-head">${
  `<div class="sec-num">${ch.num || "§"}</div>`
}<h2>${esc(ch.title)}</h2></div>
${render(ch.blocks)}
</section>`).join("\n");

const sidebarNav = doc.chapters.map(ch =>
  `<a data-id="${ch.id}" href="#${ch.id}"><span class="snav-num">${ch.num || "§"}</span>${esc(ch.nav)}</a>`
).join("");

/* ---------- styles: audit stylesheet + this document's additions ---------- */
// Base stylesheet, shared by all four documents. Read from scripts/base.css rather
// than from a generated page — reading a build artifact made every rebuild append
// its own CSS again, compounding duplicates on each run.
const rawCss = readFileSync(path.join(root, "scripts/base.css"), "utf8");

const maCss = `
/* Ambient abstract-green background — identical recipe to the audit page */
body{
  background-color:var(--paper);
  background-image:
    radial-gradient(58% 46% at 86% -6%, color-mix(in srgb,var(--accent2) 26%,transparent), transparent 60%),
    radial-gradient(52% 42% at 2% 6%, color-mix(in srgb,var(--accent2) 15%,transparent), transparent 58%),
    radial-gradient(60% 50% at 110% 40%, color-mix(in srgb,var(--accent) 16%,transparent), transparent 56%),
    radial-gradient(50% 44% at -10% 82%, color-mix(in srgb,var(--accent2) 12%,transparent), transparent 55%),
    radial-gradient(46% 40% at 78% 108%, color-mix(in srgb,var(--accent) 12%,transparent), transparent 55%);
  background-attachment:fixed;
  background-repeat:no-repeat;
}
.mast{background:
  radial-gradient(120% 150% at 85% -14%, color-mix(in srgb,var(--accent2) 30%,transparent) 0%, transparent 56%),
  radial-gradient(90% 120% at 6% -30%, color-mix(in srgb,var(--accent) 22%,transparent) 0%, transparent 52%);
  border-bottom:1px solid var(--line);
}
.layout{display:flex;align-items:flex-start;min-height:100vh}
.sidebar{position:sticky;top:0;height:100vh;flex:0 0 262px;width:262px;overflow-y:auto;
  background:color-mix(in srgb,var(--surface) 78%,transparent);border-right:1px solid var(--line);
  padding:26px 0;z-index:5}
.sb-head{padding:0 20px 18px;border-bottom:1px solid var(--line2);margin-bottom:8px}
.sb-title{font-family:var(--serif);font-size:21px;font-weight:600;color:var(--ink);letter-spacing:-.01em;line-height:1.1}
.sb-sub{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink3);margin-top:6px}
.sb-back{margin-top:16px;width:100%;padding:8px 12px;border-radius:8px;cursor:pointer;font-size:12px;
  font-weight:600;border:1px solid var(--line);background:var(--raise);color:var(--ink2);font-family:var(--sans);text-align:left}
.sb-back:hover{border-color:var(--accent2);color:var(--accent2)}
.snav{padding:2px 12px 20px}
.snav a{display:flex;gap:9px;align-items:baseline;padding:7px 9px;border-radius:7px;text-decoration:none;
  color:var(--ink2);font-size:13px;line-height:1.3;border:1px solid transparent;transition:background .12s,color .12s}
.snav a:hover{background:var(--raise);color:var(--ink)}
.snav a.active{background:var(--accentSoft);color:var(--accent);border-color:color-mix(in srgb,var(--accent2) 28%,transparent);font-weight:600}
.snav-num{font-family:var(--mono);font-size:11px;color:var(--accent2);min-width:20px;flex-shrink:0}
.content{flex:1;min-width:0}
.content .mast-inner{max-width:940px;margin:0;padding:44px 44px 34px}
.content .wrap{max-width:940px;margin:0;padding:0 44px}
/* Confidentiality marker in the masthead */
.confidential{display:inline-block;margin-top:14px;padding:5px 11px;border-radius:999px;
  font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;font-weight:600;
  color:var(--warn);background:var(--warnSoft);border:1px solid color-mix(in srgb,var(--warn) 34%,transparent)}
/* Works Cited entries */
.cite{font-size:12.5px;line-height:1.6;color:var(--ink2);margin:0 0 9px;padding-left:2px}
.cite a{color:var(--accent2);text-decoration:none;word-break:break-word}
.cite a:hover{text-decoration:underline}
@media(max-width:880px){
  .layout{flex-direction:column}
  .sidebar{position:static;height:auto;width:100%;flex:none;border-right:none;border-bottom:1px solid var(--line);padding:16px 0}
  .snav{display:flex;flex-wrap:wrap;gap:4px}
  .content .mast-inner{padding:32px 22px 24px}.content .wrap{padding:0 22px}
}
`;

/* ---------- shell ---------- */
const f = doc.front;
const shell = `<!doctype html>
<html lang="en" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Market Analysis — BOUND Protocol</title>
<style>${rawCss}${maCss}${PRINT_CSS}</style></head><body>
<div class="layout">
<aside class="sidebar">
  <div class="sb-head">
    <div class="sb-title">${esc(f.kind)}</div>
    <div class="sb-sub">${esc(f.brand)}</div>
    <button class="sb-back" onclick="location.assign('/#docs')">&larr; Back to Library</button>
    ${PRINT_BUTTON}
  </div>
  <nav class="snav">${sidebarNav}</nav>
</aside>
<div class="content">
<div class="mast"><div class="mast-inner">
<div class="eyebrow">${esc(f.kind)}</div><h1>${esc(f.tagline)}</h1>
<p class="lede">${esc(f.brand)} — the RWA liquidity opportunity, sized from the tokenized-asset flow economy.</p>
<div class="metarow">
<div><div class="k">Document</div><div class="v">${esc(f.kind)}</div></div>
<div><div class="k">Date</div><div class="v">${esc(f.date)}</div></div>
<div><div class="k">Protocol</div><div class="v">${esc(f.brand)}</div></div>
</div>
<div class="confidential">${esc(f.confidential)}</div>
</div></div>
<div class="wrap">
${B}
<footer><div class="disc"><b>Note.</b> This page is a faithful transcription of ${esc(f.brand)} ${esc(f.kind)}, ${esc(f.date)}. Regenerate via <span class="mono">node scripts/build-market.mjs</span> after any change to the source document.</div>
<div>${esc(f.brand)} · ${esc(f.kind)} · ${esc(f.date)}</div></footer>
</div></div></div>
<script>(function(){
  var links=[].slice.call(document.querySelectorAll('.snav a[data-id]'));
  var secs=links.map(function(a){return document.getElementById(a.getAttribute('data-id'));});
  function spy(){var y=window.scrollY+150,cur=0;for(var i=0;i<secs.length;i++){if(secs[i]&&secs[i].offsetTop<=y)cur=i;}for(var j=0;j<links.length;j++){links[j].classList.toggle('active',j===cur);}}
  links.forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();var el=document.getElementById(a.getAttribute('data-id'));if(el){el.scrollIntoView({behavior:'smooth',block:'start'});}});});
  window.addEventListener('scroll',spy,{passive:true});spy();
})();</script>
</body></html>`;

writeFileSync(path.join(root, "public/bound-market-analysis.html"), shell);
console.log(`Wrote public/bound-market-analysis.html`);
console.log(`${doc.chapters.length} chapters · ${shell.length.toLocaleString()} bytes`);
