#!/usr/bin/env node

// Simple dev server with SPA fallback.
// Serves static files from the project root.
// Unknown paths (e.g. /software/) fall back to /index.html
// so the client-side router can handle them.

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8080;
const ROOT = path.join(__dirname, "..");

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".json": "application/json",
  ".css": "text/css",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let filePath = path.join(ROOT, url.pathname);

  // If path ends with / try index.html in that dir, otherwise fall back to root index.html
  if (filePath.endsWith("/")) {
    filePath = path.join(filePath, "index.html");
  }

  // Try to serve the file directly
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // SPA fallback: serve root index.html for unknown paths
  const indexPath = path.join(ROOT, "index.html");
  res.writeHead(200, { "Content-Type": "text/html" });
  fs.createReadStream(indexPath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}`);
});
