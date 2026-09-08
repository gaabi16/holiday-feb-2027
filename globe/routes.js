/* Flight routes: airport coordinates and the durations written on each segment.
   Adding a destination means adding an entry here and a <div class="globe"
   data-route="..."> in the matching src/dest-*.html partial. No build needed
   for the route itself — only `node build.mjs` to reassemble index.html.

   A route has:
     points  — the airports in flight order, each with lon, lat, code;
     spans   — the duration labels, each covering the stretch from `from` to `to`;
     ground  — optional, the indices of the arcs that are surface transport
               (bus/taxi) rather than flights; they are drawn teal, not amber.

   A route may close on itself, starting and ending at the same airport, when
   the outbound and the return take completely different paths. The repeated
   airport code is drawn only once. */
var OTP = { code: "OTP", lon: 26.085, lat: 44.571 };
var DXB = { code: "DXB", lon: 55.364, lat: 25.253 };
var SIN = { code: "SIN", lon: 103.994, lat: 1.359 };
var KWI = { code: "KWI", lon: 47.979, lat: 29.227 };
var MNL = { code: "MNL", lon: 121.02, lat: 14.509 };
var CLJ = { code: "CLJ", lon: 23.686, lat: 46.785 };
var AUH = { code: "AUH", lon: 54.651, lat: 24.433 };
var ATH = { code: "ATH", lon: 23.945, lat: 37.936 };
var BAH = { code: "BAH", lon: 50.634, lat: 26.271 };
var KUL = { code: "KUL", lon: 101.710, lat: 2.746 };
var FCO = { code: "FCO", lon: 12.239, lat: 41.800 };
var VIE = { code: "VIE", lon: 16.570, lat: 48.110 };
var BKK = { code: "BKK", lon: 100.750, lat: 13.690 };
var PEK = { code: "PEK", lon: 116.603, lat: 40.080 };
var BRU = { code: "BRU", lon: 4.484, lat: 50.901 };
var CRL = { code: "CRL", lon: 4.454, lat: 50.459 };
var SGN = { code: "SGN", lon: 106.652, lat: 10.819 };
var ASB = { code: "ASB", lon: 58.361, lat: 37.987 };
var LGW = { code: "LGW", lon: -0.182, lat: 51.154 };
var LTN = { code: "LTN", lon: -0.368, lat: 51.875 };
var LCA = { code: "LCA", lon: 33.625, lat: 34.875 };
var SHJ = { code: "SHJ", lon: 55.517, lat: 25.329 };
var HKT = { code: "HKT", lon: 98.317, lat: 8.113 };
var MCT = { code: "MCT", lon: 58.284, lat: 23.593 };
var DAD = { code: "DAD", lon: 108.199, lat: 16.044 };
var MLE = { code: "MLE", lon: 73.529, lat: 4.192 };
var ADD = { code: "ADD", lon: 38.799, lat: 8.978 };
var ZNZ = { code: "ZNZ", lon: 39.225, lat: -6.222 };

var ROUTES = {
  "mnl-a": {
    points: [OTP, DXB, SIN, MNL],
    spans: [
      { from: 0, to: 1, text: ["5h 05m"] },
      { from: 1, to: 3, text: ["13h", "SIN layover 1h 50m"] }
    ]
  },
  "mnl-b": {
    points: [OTP, DXB, KWI, MNL],
    spans: [
      { from: 0, to: 1, text: ["5h 05m"] },
      { from: 1, to: 3, text: ["14h 25m", "KWI layover 3h 15m"] }
    ]
  },
  "mnl-c": {
    points: [CLJ, AUH, DXB, SIN, MNL],
    ground: [1],
    spans: [
      { from: 0, to: 1, text: ["5h 10m"] },
      { from: 1, to: 2, text: ["bus", "to confirm"], ground: true },
      { from: 2, to: 4, text: ["13h", "SIN layover 1h 50m"] }
    ]
  },
  "mnl-d": {
    points: [OTP, FCO, BAH, MNL],
    spans: [
      { from: 0, to: 1, text: ["2h 20m"] },
      { from: 1, to: 3, text: ["19h 30m", "BAH layover 5h 30m"] }
    ]
  },
  "sgn-b": {
    points: [OTP, DXB, SIN, SGN],
    spans: [
      { from: 0, to: 1, text: ["5h 05m"] },
      { from: 1, to: 3, text: ["16h 15m", "SIN layover 6h 40m"] }
    ]
  },
  "sgn-c": {
    /* out and back the same way as far as Dubai, then home via Abu Dhabi and Larnaca */
    points: [OTP, DXB, SIN, SGN, SIN, DXB, AUH, LCA, OTP],
    ground: [5],
    spans: [
      { from: 0, to: 1, text: ["5h 05m"] },
      { from: 1, to: 3, text: ["16h 15m", "SIN layover 6h 40m"] },
      { from: 5, to: 6, text: ["transfer", "130 km"], ground: true },
      { from: 6, to: 7, text: ["4h 55m"] }
    ]
  },
  "mnl-e": {
    /* out and back on Dubai<->Manila, then home via Abu Dhabi and Larnaca */
    points: [OTP, DXB, MNL, DXB, AUH, LCA, OTP],
    ground: [3],
    spans: [
      { from: 0, to: 1, text: ["5h 05m"] },
      { from: 1, to: 2, text: ["9h", "direct"] },
      { from: 3, to: 4, text: ["transfer", "to confirm"], ground: true },
      { from: 4, to: 5, text: ["4h 55m"] }
    ]
  },
  "bkk-a": {
    /* the route closes on itself: out via Vienna and Singapore, back via Beijing
         and Brussels — we land at Zaventem and leave from Charleroi */
    points: [OTP, VIE, SIN, BKK, PEK, BRU, CRL, OTP],
    ground: [5],
    spans: [
      { from: 0, to: 1, text: ["1h 40m"] },
      { from: 1, to: 3, text: ["16h 15m", "SIN layover 2h"] },
      { from: 3, to: 5, text: ["19h 25m", "PEK layover 4h 20m"] },
      { from: 5, to: 6, text: ["transfer", "to confirm"], ground: true }
    ]
  },
  "bkk-b": {
    points: [OTP, DXB, KWI, BKK],
    spans: [
      { from: 0, to: 1, text: ["5h 05m"] },
      { from: 1, to: 3, text: ["12h 10m", "KWI layover 3h 40m"] }
    ]
  },
  "znz": {
    points: [CLJ, AUH, ADD, ZNZ],
    spans: [
      { from: 0, to: 1, text: ["5h 10m"] },
      { from: 1, to: 3, text: ["7h 30m", "ADD layover 35m"] }
    ]
  },
  "bkk-c": {
    points: [OTP, DXB, SHJ, BKK],
    ground: [1],
    spans: [
      { from: 0, to: 1, text: ["5h 05m"] },
      { from: 1, to: 2, text: ["transfer", "25 km"], ground: true },
      { from: 2, to: 3, text: ["6h 15m", "direct"] }
    ]
  },
  "mle": {
    points: [OTP, DXB, SHJ, MLE],
    ground: [1],
    spans: [
      { from: 0, to: 1, text: ["5h 05m"] },
      { from: 1, to: 2, text: ["transfer", "25 km"], ground: true },
      { from: 2, to: 3, text: ["4h 25m", "direct"] }
    ]
  },
  "sgn-a": {
    /* another closed route: out via Vienna and Singapore, back via Ashgabat and
         London — we land at Gatwick and leave from Luton */
    points: [OTP, VIE, SIN, SGN, ASB, LGW, LTN, OTP],
    ground: [5],
    spans: [
      { from: 0, to: 1, text: ["1h 40m"] },
      { from: 1, to: 3, text: ["16h 05m", "SIN layover 2h 10m"] },
      { from: 3, to: 5, text: ["16h 30m", "ASB layover 1h 20m"] },
      { from: 5, to: 6, text: ["transfer", "to confirm"], ground: true }
    ]
  },
  "dad": {
    /* out and back the same way as far as Dubai, then home via Abu Dhabi and Larnaca */
    points: [OTP, DXB, SIN, DAD, SIN, DXB, AUH, LCA, OTP],
    ground: [5],
    spans: [
      { from: 0, to: 1, text: ["5h 05m"] },
      { from: 1, to: 3, text: ["17h 45m", "SIN layover 7h 45m"] },
      { from: 5, to: 6, text: ["transfer", "130 km"], ground: true },
      { from: 6, to: 7, text: ["4h 55m"] }
    ]
  },
  "hkt": {
    /* two surface transfers, both in the Gulf: Dubai->Sharjah on the way out,
         Dubai->Abu Dhabi on the way back */
    points: [OTP, DXB, SHJ, HKT, MCT, DXB, AUH, LCA, OTP],
    ground: [1, 5],
    spans: [
      { from: 0, to: 1, text: ["5h 05m"] },
      { from: 1, to: 2, text: ["transfer", "25 km"], ground: true },
      { from: 2, to: 3, text: ["6h 20m"] },
      { from: 3, to: 5, text: ["10h 15m", "MCT layover 2h 35m"] },
      { from: 5, to: 6, text: ["transfer", "130 km"], ground: true }
    ]
  },
  "kul": {
    points: [OTP, ATH, BAH, SIN, KUL],
    spans: [
      { from: 0, to: 1, text: ["1h 35m"] },
      { from: 1, to: 4, text: ["18h 50m", "BAH and SIN layovers"] }
    ]
  }
};
