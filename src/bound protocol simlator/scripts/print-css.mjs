// Shared print stylesheet for every generated BOUND document.
//
// Imported by build-audit-report.mjs, build-whitepaper.mjs, build-market.mjs and
// build-competitors.mjs so all four print identically. Editing it here updates every
// document on the next build.
//
// Design decisions worth keeping:
//   * Print forces the LIGHT palette. The screen documents are dark by design; a dark
//     background on paper wastes toner and reads badly, so the variables are overridden
//     rather than the components restyled.
//   * Page breaks are controlled by `break-inside: avoid` on atomic blocks (tables rows,
//     KPI tiles, notes, formulas) rather than by forcing breaks between sections, which
//     would leave large gaps at the bottom of pages.
//   * `thead { display: table-header-group }` repeats column headers when a long table
//     spans pages — the single most important rule for readable printed tables.

export const PRINT_CSS = `
/* ---------------------------------------------------------------- print ---- */
.print-only{display:none}
.sb-print{margin-top:8px;width:100%;padding:8px 12px;border-radius:8px;cursor:pointer;font-size:12px;
  font-weight:600;border:1px solid color-mix(in srgb,var(--accent2) 40%,transparent);
  background:var(--accentSoft);color:var(--accent);font-family:var(--sans);text-align:left;
  display:flex;align-items:center;gap:7px}
.sb-print:hover{border-color:var(--accent2);background:color-mix(in srgb,var(--accent2) 16%,transparent)}

@media print{
  /* Light palette on paper, whatever the on-screen theme is */
  :root,:root[data-theme="dark"],:root[data-theme="light"]{
    --paper:#FFFFFF; --surface:#FFFFFF; --raise:#FAFAF8;
    --ink:#14201A; --ink2:#33403A; --ink3:#5A655F; --ink4:#6E766D; --ink5:#8A928B;
    --line:#C9D1CC; --line2:#E2E7E3;
    --accent:#1B4A3C; --accent2:#2C6A57; --accentSoft:#EDF4F0;
    --good:#1F6B4F; --goodSoft:#E9F3ED;
    --warn:#7E5200; --warnSoft:#FAF0DA;
    --crit:#8C2F22; --critSoft:#F8E7E2;
    --bar:#2C6A57; --barTrack:#E2E7E3;
    --c-green:#2C6A57; --c-blue:#2F5C9E; --c-amber:#8A5E12; --c-red:#8C2F22; --c-grid:#D8DEDA;
    --shadow:none;
  }
  @page{ size:A4; margin:17mm 15mm 18mm; }

  html,body{background:#fff !important;background-image:none !important;color:var(--ink) !important}
  body{font-size:10pt;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact}

  /* Chrome furniture that must not reach paper */
  .sidebar,.sb-back,.sb-print,.no-print{display:none !important}
  .print-only{display:block !important}

  /* The two-column app shell collapses to a single full-width flow */
  .layout{display:block !important}
  .content{display:block !important}
  .content .mast-inner,.content .wrap,.wrap{max-width:none !important;margin:0 !important;padding:0 !important}

  /* Masthead becomes a cover block rather than a coloured banner */
  .mast{background:none !important;border-bottom:1.5pt solid var(--accent2) !important;
    padding:0 0 10pt !important;margin-bottom:16pt !important;break-after:avoid}
  .mast h1{font-size:24pt !important;line-height:1.15}
  .mast .lede{font-size:11pt !important}
  .metarow{border-top:none !important;padding-top:8pt !important}

  /* Keep headings attached to the text they introduce */
  h1,h2,h3,h4,.sec-head,.part-label,.sb-title{break-after:avoid;page-break-after:avoid}
  .sec-head{border-bottom:0.75pt solid var(--line) !important}
  section{break-before:auto}
  .part-label{break-before:page;page-break-before:always;margin-top:0 !important}
  section:first-of-type,.part-label:first-of-type{break-before:avoid;page-break-before:avoid}

  /* Atomic blocks must never be split across a page boundary */
  .kpi,.mcard,.note,.formula,.cap,.barrow,.chart,.verdict,figure,img,svg{
    break-inside:avoid;page-break-inside:avoid}
  p,li{orphans:3;widows:3}

  /* Tables: show in full, repeat the header row on every page */
  .tbl-scroll{overflow:visible !important;border:none !important}
  table{width:100% !important;font-size:8.5pt !important;border-collapse:collapse;break-inside:auto}
  thead{display:table-header-group}
  tfoot{display:table-footer-group}
  tr{break-inside:avoid;page-break-inside:avoid}
  thead th{background:var(--accentSoft) !important;color:var(--accent) !important;
    border-bottom:0.75pt solid var(--accent2) !important}
  tbody td{border-bottom:0.5pt solid var(--line2) !important}

  /* Links print as text; the URL is appended only where it is not already visible */
  a{color:var(--accent) !important;text-decoration:none}
  a[href^="http"]::after{content:" <" attr(href) ">";font-size:7.5pt;color:var(--ink3);word-break:break-all}
  .cite a[href^="http"]::after{content:none}

  /* Cards and tiles flatten — borders read better than fills on paper */
  .kpi,.mcard,.note,.formula{background:none !important;border:0.75pt solid var(--line) !important}
  .pill,.rating,.tag{border:0.5pt solid var(--line) !important;background:none !important}
}
`;

// The Export-PDF control injected into each document's sidebar.
export const PRINT_BUTTON = `<button class="sb-print" onclick="window.print()" title="Opens your browser's print dialog — choose &quot;Save as PDF&quot;">
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3.5h12V9"/><path d="M6 18H4.5A1.5 1.5 0 0 1 3 16.5v-5A1.5 1.5 0 0 1 4.5 10h15a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5H18"/><rect x="6" y="14" width="12" height="6.5" rx="1"/></svg>
  Export PDF
</button>`;

// A print-only running header, placed at the top of the document flow.
export const printHead = (title, meta) => `<div class="print-only" style="display:none;font-family:var(--mono);font-size:7.5pt;letter-spacing:.1em;text-transform:uppercase;color:var(--ink3);border-bottom:0.5pt solid var(--line);padding-bottom:5pt;margin-bottom:12pt">${title} &nbsp;·&nbsp; ${meta}</div>`;
