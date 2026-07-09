import { execSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const PORT = 5239;
// Sweep every port a stale simulator dev server has ever been seen on (both the old
// ~/bound-simulator-v7 copies and this Desktop copy), plus the canonical port itself.
const STALE_PORTS = [
  4173, 5173, 5174, 5175, 5180, 5181, 5185, 5186, 5187, 5188, 5190, 5191,
  5200, 5201, 5202, 5203, 5204, 5205, 5207, 5210, 5220,
  5230, 5231, 5232, 5233, 5234, 5235, 5236, 5237, 5238, PORT,
];
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function killPort(port) {
  try {
    const pids = execSync(`lsof -ti :${port}`, { encoding: "utf8" }).trim();
    if (!pids) return;
    for (const pid of pids.split("\n").filter(Boolean)) {
      try {
        process.kill(Number(pid), "SIGKILL");
        console.log(`Killed stale process ${pid} on port ${port}`);
      } catch {
        /* already gone */
      }
    }
  } catch {
    /* nothing listening */
  }
}

for (const p of STALE_PORTS) killPort(p);
console.log(`\n  Bound Simulator — dev server\n  → http://127.0.0.1:${PORT}/\n  Close ALL old tabs (5173, 5234, 5235, etc.) and use this URL only.\n`);

const child = spawn("npx", ["vite"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
});

child.on("exit", code => process.exit(code ?? 0));
