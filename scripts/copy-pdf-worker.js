// Copies the pdf.js worker bundle from node_modules into /public so it can be
// served same-origin. This matters because browsers refuse to construct a
// classic Worker() from a cross-origin script URL (it throws a
// SecurityError synchronously, regardless of CORS/CORP headers) — pointing
// GlobalWorkerOptions.workerSrc at a CDN silently falls back to pdf.js's
// slow, single-threaded "fake worker" mode in every browser. Serving the
// exact worker build that matches the installed pdfjs-dist version avoids
// that fallback and the "API version does not match Worker version" warning.
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "node_modules", "pdfjs-dist", "build", "pdf.worker.min.js");
const destDir = path.join(__dirname, "..", "public");
const dest = path.join(destDir, "pdf.worker.min.js");

try {
  if (!fs.existsSync(src)) {
    console.warn("[copy-pdf-worker] source not found, skipping:", src);
    process.exit(0);
  }
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
  console.log("[copy-pdf-worker] copied pdf.worker.min.js to /public");
} catch (err) {
  console.warn("[copy-pdf-worker] failed:", err.message);
}
