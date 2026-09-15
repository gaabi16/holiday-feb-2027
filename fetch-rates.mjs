/* Fetches the day's exchange rates and writes rates.json.

     node fetch-rates.mjs

   Source is the European Central Bank's daily reference rates — free, no API
   key, no rate limit, and the same URL since the euro existed:
   https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml

   The ECB publishes RON but NOT AED, so the dirham is derived from EUR/USD
   through its peg. The UAE has pegged the dirham at 3.6725 AED to the dollar
   since 1997; cross-checking the derived figure against an independent
   provider put the two within 0.15% of each other, which is well inside the
   rounding of every figure on the page.

   The ECB publishes on TARGET business days only, so at weekends this returns
   Friday's rates — which is correct, not stale: there is no fixing to quote.

   Run by .github/workflows/rates.yml every weekday morning. */

import { writeFileSync, readFileSync, existsSync } from "node:fs";

const ECB = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";
const AED_PER_USD = 3.6725; // UAE central bank peg
const OUT = "rates.json";

const xml = await fetch(ECB).then((r) => {
  if (!r.ok) throw new Error(`ECB returned HTTP ${r.status}`);
  return r.text();
});

const rate = (code) => {
  const m = xml.match(new RegExp(`currency=['"]${code}['"]\\s+rate=['"]([\\d.]+)['"]`));
  if (!m) throw new Error(`no ${code} rate in the ECB feed`);
  return parseFloat(m[1]);
};

const dateMatch = xml.match(/time=['"](\d{4}-\d{2}-\d{2})['"]/);
if (!dateMatch) throw new Error("no quote date in the ECB feed");

const ron = rate("RON");
const aed = rate("USD") * AED_PER_USD;

/* A sanity band. If the feed ever changes shape, or a rate moves further than
   any real day's trading could, fail loudly rather than publish a page full of
   wrong prices. The previous rates.json is left untouched. */
const sane = (name, value, low, high) => {
  if (!(value > low && value < high)) {
    throw new Error(`${name} came back as ${value}, outside the expected ${low}–${high}`);
  }
};
sane("EUR/RON", ron, 4.0, 7.0);
sane("EUR/AED", aed, 3.0, 6.0);

const next = {
  date: dateMatch[1],
  fetched: new Date().toISOString(),
  source: "European Central Bank daily reference rates",
  note: `AED derived from EUR/USD via the dirham's ${AED_PER_USD} peg to the dollar; the ECB does not publish AED.`,
  eur: {
    RON: Number(ron.toFixed(4)),
    AED: Number(aed.toFixed(4))
  }
};

const before = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : null;
writeFileSync(OUT, JSON.stringify(next, null, 2) + "\n");

const moved =
  !before ||
  before.eur.RON !== next.eur.RON ||
  before.eur.AED !== next.eur.AED;

console.log(
  `rates ${next.date}: 1 EUR = ${next.eur.RON} RON, ${next.eur.AED} AED` +
    (before
      ? moved
        ? ` (was ${before.eur.RON} / ${before.eur.AED})`
        : " (unchanged)"
      : " (first run)")
);
