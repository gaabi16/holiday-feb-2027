# Document vacanță familie — februarie 2027

## Ce e proiectul

Trei fișiere — `index.html`, `style.css`, `globe.js` — hostate pe GitHub Pages. Îl citesc
4 membri de familie care aleg destinația: Mark, mama, tata, Alex. Nu sunt tehnici.
Documentul e în română.

- `index.html` — doar conținutul: destinațiile, tabelele, rutele scrise pe zile;
- `style.css` — tot aspectul, cu variabilele în `:root`;
- `globe.js` — rutele (`ROUTES`), motorul de glob și conturul lumii (`LAND`).

Scopul lui: să pui în paralel mai multe destinații și variante de zbor, cu prețuri și cu
riscurile de conexiune, ca să se poată lua o decizie fără să deschidă nimeni Skyscanner.

## Cum lucrez la el

Mark trimite screenshot-uri de pe site-uri de zboruri. Din ele extrag datele și le adaug
în document. Nu inventez prețuri sau orare care nu apar în surse.

Reguli pe care le-a cerut explicit:

- **Scurt.** A respins deja o versiune fiindcă era prea lungă. Fiecare destinație e un
  `<details>` pliat. Închise, zece destinații trebuie să încapă într-un ecran.
- **Toate sumele în EUR**, dar cu moneda reală de plată specificată pe fiecare segment.
  Curs folosit: 1 € = 5,25 RON, 1 € = 4,26 AED (6 sept 2026). E scris în footer.
- **Total pentru 4 persoane și sumă per persoană**, mereu amândouă.
- **Marcate explicit nopțile în care e nevoie de cazare pe drum** — sunt cost ascuns și
  contează la comparație. În HTML sunt blocurile `.stay`.
- **Conexiunile riscante marcate** — blocurile `.gap .risk`. Bilete separate + schimbare
  de terminal = risc real, se scrie ca atare.
- Fără disclaimere lungi, fără repetarea acelorași cifre în două locuri.

## Aspect

Estetică de flight tracker, cerută explicit: fundal navy închis, glob nocturn, traseu
chihlimbariu. Variabilele sunt în `:root`. Font: IBM Plex Sans + IBM Plex Mono pentru
ore, coduri de aeroport și prețuri.

Nu adăuga framework-uri și nu adăuga build. Cele trei fișiere se leagă între ele cu căi
relative, așa că documentul merge deschis direct de pe disc, cu dublu-click.

## Globurile

Sunt canvas interactive, desenate de `globe.js`: se rotesc trăgând cu mouse-ul sau cu
degetul, se apropie din butoanele `+` / `−` (rotița merge doar după un click pe glob,
altfel ar fura derularea paginii; pe telefon merge și pinch), iar pe fiecare bucată de
traseu e scrisă durata zborului. Proiecție ortografică scrisă de mână, fără librării,
centrată automat pe mijlocul rutei.

**Pentru o destinație nouă nu e nevoie de Node.** Adaugi ruta în obiectul `ROUTES` din
`globe.js` și pui în `index.html` un `<div class="globe" data-route="cod-ruta">` cu
canvas-ul și butoanele (copiază blocul de la Manila). O rută are:

- `points` — aeroporturile în ordinea zborului, cu `lon`, `lat`, `code`;
- `spans` — etichetele cu durata, fiecare peste bucata de traseu de la `from` la `to`;
- `ground` — opțional, indecșii arcelor care sunt transport terestru (bus/taxi), nu
  zbor — se desenează punctat și estompat în loc de amber plin.

Pe etichete stau doar cifre — durata zborului și escala, fără „dus” sau „întors”, fiindcă
direcția se citește oricum din coloana din dreapta. Duratele se scriu doar dacă apar în
surse; unde avem doar timpul total al unei legături cu escală, eticheta acoperă tot spanul
(`{from:1, to:3}`), nu se împarte pe segmente. Eticheta se așază singură pe cea mai lungă
bucată din span și pe partea mai liberă a liniei, ca să nu cadă peste codurile de
aeroport. Un span cu `muted:true` se desenează cu același stil estompat ca segmentele
`ground` — pentru etichete gen „bus, de verificat”, nu durate confirmate.

Coastele sunt codificate compact în variabila `LAND` din `globe.js` (~11 KB, între
marcajele `LAND-DATA`). Se regenerează doar dacă vrei altă rezoluție:

```
npm install world-atlas topojson-client
node make-globe.mjs
```

Scriptul rescrie singur blocul din `globe.js`.

## Structura unei destinații

```
<details class="dest">
  <summary>  nume, date, preț per pers, total  </summary>
  <div class="body">
    tabel .compare        — doar dacă are mai multe variante de zbor
    .tabs                 — tab-uri pe radio+CSS, fără JS, câte un pane per variantă
      .split              — glob stânga, .route dreapta
      .grid2              — cost + cum ieftinim
      .grid2              — de știut + de verificat
    .alert                — risc care se aplică la toate variantele
  </div>
</details>
```

## Ce e deja în document

**Manila, 13 feb – 1 mar 2027.** București↔Dubai identic în ambele variante (Wizz W4 3267
/ W4 3268, 1.536 lei dus pentru 4, rezervare 1+3 la întors ca să prindem tariful mic la o
persoană). Diferă doar Dubai↔Manila:

- **A — Singapore Airlines**, €1.482 pentru 4 luat de pe un site terț (oficial ar fi AED
  6.880). Total €2.387. Cere două nopți de hotel, în Dubai și în Singapore.
- **B — Kuwait Airways**, AED 6.832 pentru 4 = €1.604. Total €2.509. Zero nopți de hotel,
  aproape o zi în plus în Filipine.
- **C — via Cluj-Napoca**, în evaluare, nu un total finalizat ca A/B. Înlocuiește doar
  prima bucată: Wizz Cluj-Napoca↔Abu Dhabi (€692 pentru 4, găsit pe wizzair.com) în loc de
  București↔Dubai (€905), plus un bus/taxi Abu Dhabi↔Dubai (~130 km, cost și durată încă
  necunoscute). De la Dubai încolo e identic cu A — același zbor Singapore Airlines,
  aceleași două nopți de cazare. Zborul de întors (AUH→CLJ) a fost găsit pentru 27 feb,
  dar planul cere revenire pe 28 feb — de recăutat cu data corectă înainte să se ia o
  decizie pe cifrele astea.

Riscul comun la A/B: Wizz e la Terminalul 2 în Dubai, SQ și Kuwait sunt la Terminalul 1,
iar terminalele nu sunt legate airside. La A conexiunea strânsă e la întors (3h05), la B e
la dus (2h35) — adică exact unde doare mai tare. La C riscul e altul: bus-ul Dubai→Abu
Dhabi la întors, cu durată necunoscută, înaintea zborului Wizz — de aceea nu are încă un
total de persoană afișat ca A și B.

## De făcut

- Adăugat următoarele destinații pe măsură ce vin screenshot-urile.
- Nopțile de cazare nu au încă estimări de preț. Când apar, intră în comparație, fiindcă
  ele decid dacă B e de fapt mai ieftin decât A.
