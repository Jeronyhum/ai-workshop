// Tiny local dashboard server for the HUD (macOS / Linux / any browser).
// Usage: node server.mjs [--port 8788] [--open]
// Serves hud.html and /api/status. Binds to 127.0.0.1 only.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const STATUS = path.join(HERE, "status.mjs");
const PORT = Number((process.argv.find((a) => a.startsWith("--port=")) || "").split("=")[1] || 8788);

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

server.listen(PORT, "127.0.0.1", () => {
  console.log("HUD: http://127.0.0.1:" + PORT + "/");
});
