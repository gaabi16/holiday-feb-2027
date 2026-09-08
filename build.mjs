/* Assembles index.html out of the partials in src/.
   Run it after editing anything under src/:

     node build.mjs

   The output is a single self-contained index.html, so the document still
   opens straight off the disk with a double-click and works on GitHub Pages.
   The ?v= cache-busting stamp on style.css and the globe scripts is filled in
   here from today's date, so the browser never serves a stale CSS or JS. */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, "src");

const read = (name) => readFileSync(join(src, name), "utf8").trimEnd();

/* Destinations are picked up by filename, so the order on the page is the
   numeric prefix: dest-01-manila.html, dest-02-kuala-lumpur.html, ... */
const destinations = readdirSync(src)
  .filter((f) => /^dest-\d\d-.*\.html$/.test(f))
  .sort();

if (destinations.length === 0) {
  console.error("build: no src/dest-*.html files found");
  process.exit(1);
}

const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");

const page = [read("head.html"), read("header.html"), ...destinations.map(read), read("footer.html")]
  .join("\n\n")
  .replaceAll("__V__", stamp) + "\n";

writeFileSync(join(root, "index.html"), page);

console.log(`build: index.html <- ${destinations.length} destinations, v=${stamp}`);
for (const d of destinations) console.log(`  ${d}`);
