#!/usr/bin/env node
// Minimal static server for the P1-E playback page (throwaway evidence tooling).
// Serves page/ and fixtures/ from experiments/p1-e on 127.0.0.1:4180 — localhost only.
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".mp4": "video/mp4", ".webm": "video/webm", ".json": "application/json" };

createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (path === "/") path = "/page/index.html";
  const file = resolve(join(ROOT, path));
  if (!file.startsWith(ROOT) || !existsSync(file)) { res.writeHead(404); res.end("not found"); return; }
  res.writeHead(200, { "Content-Type": MIME[extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
}).listen(4180, "127.0.0.1", () => console.log("p1-e server on http://127.0.0.1:4180"));
