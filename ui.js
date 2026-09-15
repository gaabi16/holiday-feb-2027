/* Page interactions: the open/close animation on the destination cards.

   The tab panes animate from CSS (see .pane in style.css) because they only
   fade and slide — no height change, so nothing has to be measured.

   The cards need JavaScript. A <details> element goes straight from
   display:none to block, which CSS cannot transition. The pure-CSS answer
   (interpolate-size: allow-keywords with ::details-content) is still
   Chromium-only in 2026, and the family reads this on iPhones, so the height
   is animated here with the Web Animations API instead — that works
   everywhere and needs no library.

   Anyone who has asked their system for less motion gets the plain, instant
   toggle: the listener bails out and the browser's own behaviour takes over. */
(function () {
  "use strict";

  var DURATION = 260;
  var EASE = "cubic-bezier(.4, 0, .2, 1)";

  var quiet = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (quiet || !document.body.animate) return;

  var cards = document.querySelectorAll("details.dest");

  for (var i = 0; i < cards.length; i++) setup(cards[i]);

  function setup(card) {
    var summary = card.querySelector("summary");
    var body = card.querySelector(".body");
    if (!summary || !body) return;

    var running = null;

    summary.addEventListener("click", function (e) {
      e.preventDefault();

      /* A second click mid-animation reverses it from wherever it got to,
         rather than jumping. */
      if (running) {
        running.cancel();
        running = null;
      }

      if (card.open) close();
      else open();
    });

    function open() {
      card.open = true;
      run(0, measure());
    }

    function close() {
      var from = body.offsetHeight;
      card.classList.add("is-closing");
      run(from, 0).then(function (finished) {
        card.classList.remove("is-closing");
        if (finished) card.open = false;
      });
    }

    /* The body is padded, so offsetHeight is the height to animate to. It has
       to be read while the card is open and unclipped. */
    function measure() {
      return body.offsetHeight;
    }

    function run(from, to) {
      body.style.overflow = "hidden";

      running = body.animate(
        [
          { height: from + "px", opacity: from ? 1 : 0 },
          { height: to + "px", opacity: to ? 1 : 0 }
        ],
        { duration: DURATION, easing: EASE }
      );

      return new Promise(function (resolve) {
        running.onfinish = function () {
          body.style.overflow = "";
          running = null;
          resolve(true);
        };
        /* cancel() fires when the user clicks again mid-flight; the new
           animation owns the cleanup from there. */
        running.oncancel = function () {
          resolve(false);
        };
      });
    }
  }
})();
