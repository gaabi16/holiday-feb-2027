# Document vacanță familie — februarie 2027

## Ce e proiectul

Un singur fișier `index.html`, self-contained, hostat pe GitHub Pages. Îl citesc 4 membri
de familie care aleg destinația: Mark, mama, tata, Alex. Nu sunt tehnici. Documentul e în
română.

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

Nu adăuga framework-uri. Fișierul trebuie să rămână unul singur, care merge deschis
direct de pe disc.

## Globurile

Se generează cu `make-globe.mjs` (Node + d3-geo + world-atlas + topojson-client).
Proiecție ortografică centrată automat pe mijlocul rutei, arce de cerc mare între
waypoint-uri, SVG-ul are stilurile inline ca să fie self-contained.

```
npm install d3-geo world-atlas topojson-client
node make-globe.mjs
```

Pentru o destinație nouă: adaugi un `buildGlobe([...])` cu waypoint-urile (lon, lat, cod
IATA, plus offset-uri de etichetă ca să nu se suprapună), rulezi scriptul, apoi lipești
SVG-ul rezultat în `index.html`.

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

Riscul comun: Wizz e la Terminalul 2 în Dubai, SQ și Kuwait sunt la Terminalul 1, iar
terminalele nu sunt legate airside. La A conexiunea strânsă e la întors (3h05), la B e la
dus (2h35) — adică exact unde doare mai tare.

## De făcut

- Adăugat următoarele destinații pe măsură ce vin screenshot-urile.
- Nopțile de cazare nu au încă estimări de preț. Când apar, intră în comparație, fiindcă
  ele decid dacă B e de fapt mai ieftin decât A.
