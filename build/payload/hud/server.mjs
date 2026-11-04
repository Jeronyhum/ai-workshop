// Tiny local dashboard server for the HUD (macOS / Linux / any browser).
// Usage: node server.mjs [--port 8788 | --port=8788] [--open]
// Serves hud.html and /api/status. Binds to 127.0.0.1 only.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const STATUS = path.join(HERE, "status.mjs");
const args = process.argv.slice(2);
const portArg = args.find((a) => a.startsWith("--port=")) || args[args.indexOf("--port") + 1];
const PORT = Number(portArg && !String(portArg).startsWith("--") ? String(portArg).replace(/^--port=/, "") : 8788);
const OPEN = args.includes("--open");

function openBrowser(url) {
  const cmd = process.platform === "darwin" ? "open" : "xdg-open";
  try {
    execFile(cmd, [url], () => {});
  } catch {}
}

function status(cb) {
  execFile(process.execPath, ["--no-warnings", STATUS], { timeout: 15000 }, (err, out) => {
    if (err && !out) return cb({ ok: false, error: String(err.message || err) });
    try {
      cb(JSON.parse(out.trim()));
    } catch {
      cb({ ok: false, error: "bad status output" });
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.url === "/api/status") {
    status((data) => {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      res.end(JSON.stringify(data));
    });
    return;
  }
  if (req.url === "/" || req.url === "/hud.html") {
    try {
      const html = fs.readFileSync(path.join(HERE, "hud.html"));
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    } catch {
      res.writeHead(500).end("hud.html missing");
    }
    return;
  }
  res.writeHead(404).end("not found");
});

server.on("error", (e) => {
  if (e.code === "EADDRINUSE") {
    console.error(`HUD: 포트 ${PORT}를 이미 다른 HUD(또는 프로그램)가 쓰고 있습니다. 기존 HUD 창을 쓰거나 SSU_HUD_PORT로 다른 포트를 지정하세요.`);
    process.exit(2);
  }
  console.error("HUD server error: " + String(e?.message || e));
  process.exit(1);
});

server.listen(PORT, "127.0.0.1", () => {
  const url = "http://127.0.0.1:" + PORT + "/";
  console.log("HUD: " + url);
  if (OPEN) openBrowser(url);
});
