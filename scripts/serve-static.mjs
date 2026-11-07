import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, relative, extname, isAbsolute, sep } from "node:path";
const root = resolve("out");
const base = "/deccan-table-demo";
const port = Number(process.env.PORT || 4173);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname === base) {
      res.writeHead(308, { Location: base + "/" + url.search });
      res.end();
      return;
    }
    if (!url.pathname.startsWith(base + "/")) {
      res.writeHead(404);
      res.end("Open " + base + "/");
      return;
    }
    let file = resolve(
      root,
      "." + decodeURIComponent(url.pathname.slice(base.length)),
    );
    const rel = relative(root, file);
    if (isAbsolute(rel) || rel === ".." || rel.startsWith(".." + sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    try {
      const info = await stat(file);
      if (info.isDirectory()) {
        if (!url.pathname.endsWith("/")) {
          res.writeHead(308, { Location: url.pathname + "/" + url.search });
          res.end();
          return;
        }
        file = resolve(file, "index.html");
      }
      const data = await readFile(file);
      res.writeHead(200, {
        "Content-Type": mime[extname(file)] || "application/octet-stream",
      });
      res.end(req.method === "HEAD" ? undefined : data);
    } catch {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end(await readFile(resolve(root, "404.html")));
    }
  } catch {
    res.writeHead(400);
    res.end("Bad request");
  }
});
server.listen(port, "127.0.0.1", () =>
  console.log(`Static export: http://localhost:${port}${base}/`),
);
