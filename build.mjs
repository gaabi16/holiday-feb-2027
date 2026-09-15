/* Assembles index.html out of the partials in src/.
   Run it after editing anything under src/, or after the rates change:

     node build.mjs

   The output is a single self-contained index.html, so the document still
   opens straight off the disk with a double-click and works on GitHub Pages.
   The ?v= cache-busting stamp on style.css and the scripts is filled in here
   from today's date, so the browser never serves a stale CSS or JS.

   MONEY
   -----
   Every euro figure on the page is computed here, at build time, from the
   amount actually paid in the airline's own currency. Write this in a partial:

     {{RON 1536}}          -> 292      the euro total for all four of us
     {{RON 1536 pp}}       -> 73       the same, per person
     {{AED 6832}}          -> 1,604
     {{RON 1536 + AED 6832 + EUR 200}}     -> a total across segments
     {{RON 1536 + AED 6832 pp}}            -> that total, per person
     {{EUR 2576 - RON 4832 - AED 6224}}    -> a difference between two options

   So the source amount stays visible in the file next to the figure it
   produces, and every derived number — segment, total, per person, the
   summary headline, the comparison table — comes from the same arithmetic
   instead of being typed twice and drifting apart.

   Rates come from rates.json, refreshed each weekday by fetch-rates.mjs.
   Rebuild after a refresh or the page keeps the old numbers. */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, "src");

const PARTY = 4; // everything on the page is priced for four people

const rates = JSON.parse(readFileSync(join(root, "rates.json"), "utf8"));
const perEur = { EUR: 1, ...rates.eur };

const read = (name) => readFileSync(join(src, name), "utf8").trimEnd();

/* {{RON 1536 + AED 6832 pp}} — amounts added or subtracted, optionally per person. */
const MONEY = /\{\{([A-Z]{3}\s[\d.]+(?:\s*[+-]\s*[A-Z]{3}\s[\d.]+)*)(\s+pp)?\}\}/g;

let converted = 0;

function money(text, where) {
  return text.replace(MONEY, (whole, sum, perPerson) => {
    let eur = 0;

    for (const [, sign, cur, amt] of sum.matchAll(/([+-]?)\s*([A-Z]{3})\s+([\d.]+)/g)) {
      if (!(cur in perEur)) {
        throw new Error(`${where}: no rate for ${cur} in rates.json — ${whole}`);
      }
      eur += (sign === "-" ? -1 : 1) * (parseFloat(amt) / perEur[cur]);
    }

    if (perPerson) eur /= PARTY;
    converted++;
    return Math.round(eur).toLocaleString("en-US");
  });
}

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

const parts = ["head.html", "header.html", ...destinations, "footer.html"];

const page =
  parts
    .map((name) => money(read(name), name))
    .join("\n\n")
    .replaceAll("__V__", stamp)
    .replaceAll("__RATE_RON__", rates.eur.RON.toFixed(2))
    .replaceAll("__RATE_AED__", rates.eur.AED.toFixed(2))
    .replaceAll("__RATE_DATE__", formatDate(rates.date)) + "\n";

const leftover = page.match(/\{\{[^}]*\}\}|__[A-Z_]+__/);
if (leftover) {
  throw new Error(`build: unresolved placeholder in the output — ${leftover[0]}`);
}

writeFileSync(join(root, "index.html"), page);

console.log(
  `build: index.html <- ${destinations.length} destinations, ${converted} figures ` +
    `at ${rates.eur.RON} RON / ${rates.eur.AED} AED (${rates.date}), v=${stamp}`
);

function formatDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];
  return `${d} ${months[m - 1]} ${y}`;
}
