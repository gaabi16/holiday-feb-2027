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

**Când modifici `style.css` sau `globe.js`, bump-ează `?v=` din `index.html`** (e pe
ambele linkuri, formatul e data: `?v=20260914`). Fără asta, browserul servește versiunea
veche din cache și pagina apare stricată — s-a întâmplat deja: tab-ul C nu afișa nimic,
fiindcă CSS-ul din cache nu avea regula lui.

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
  zbor — se desenează turcoaz în loc de amber.

Pe etichete stau doar cifre — durata zborului și escala, fără „dus” sau „întors”, fiindcă
direcția se citește oricum din coloana din dreapta. Duratele se scriu doar dacă apar în
surse; unde avem doar timpul total al unei legături cu escală, eticheta acoperă tot spanul
(`{from:1, to:3}`), nu se împarte pe segmente. Eticheta se așază singură pe cea mai lungă
bucată din span și pe partea mai liberă a liniei, ca să nu cadă peste codurile de
aeroport. Fiecare etichetă își caută locul cu cea mai mică suprapunere peste ce e deja
desenat — fără asta, aeroporturi apropiate (Bruxelles-Zaventem și Charleroi sunt la 46 km,
Abu Dhabi și Dubai la 116 km) ajung cu etichetele una peste alta.

O rută se poate închide, adică `points` să înceapă și să se termine cu același aeroport —
așa arată Bangkok, unde dusul și întorsul merg pe drumuri complet diferite. Codul
aeroportului repetat se scrie o singură dată.

Segmentele `ground` se desenează turcoaz (`#3ddbd9`), linie plină cu aceeași aură ca
zborurile — se vede că nu e zbor, dar nu e ștearsă. Un span cu `ground:true` primește
aceeași culoare pe etichetă.

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
- **D — via Roma**, singura fără Dubai: Wizz OTP↔FCO (lei 324 dus / lei 194 întors de
  persoană, €395 pentru 4) plus Gulf Air FCO↔MNL prin Bahrain (€2.323 pentru 4 la
  Gotogate, cu bagaj de cală). Total €2.718, €680 de persoană — cea mai scumpă. Zero nopți
  de hotel, dar și cele mai puține zile: 15–27 feb în loc de 13 feb – 1 mar, adică vreo 10
  zile în Filipine față de 12 la A și 13 la B. Datele Wizz și Gulf Air se potrivesc între
  ele, spre deosebire de C. Prețurile Wizz sunt marcate „Discount Club price” — de
  verificat dacă cer abonament.

- **E — Cebu Pacific**, cea mai ieftină la zboruri: €2.005 pentru 4, €501 de persoană.
  Wizz OTP→DXB (lei 1.536), Cebu Pacific DXB↔MNL dus-întors (€1.303 pentru 4, singurul zbor
  direct pe bucata lungă — 9h la dus, 9h 45m la întors), apoi acasă prin Abu Dhabi și
  Larnaca cu Wizz (AED 896 + €199,96). În schimb cere **trei nopți de cazare** — Dubai la
  dus, încă una în Golf la întors și una în Larnaca — plus același bus Dubai→Abu Dhabi ca
  la C. Nicio conexiune strânsă, toate pauzele trec de 10h. De verificat dacă tariful Cebu
  Pacific include bagaj de cală: filtrele de bagaje erau nebifate la căutare.

Riscul comun la A/B: Wizz e la Terminalul 2 în Dubai, SQ și Kuwait sunt la Terminalul 1,
iar terminalele nu sunt legate airside. La A conexiunea strânsă e la întors (3h05), la B e
la dus (2h35) — adică exact unde doare mai tare. La C riscul e altul: bus-ul Dubai→Abu
Dhabi la întors, cu durată necunoscută, înaintea zborului Wizz — de aceea nu are încă un
total de persoană afișat ca A și B. La D riscul e tot bilete separate, dar la Roma și cu
marjă mai mare — 3h 20m la dus, 3h 45m la întors. La E nu e niciun risc de conexiune, dar
sunt trei nopți de plătit.

Cu cinci variante, tabelul `.compare` nu mai încape pe ecran îngust, așa că stă într-un
`.tablewrap` care se derulează pe orizontală.

**Kuala Lumpur, 13 – 28 feb 2027.** O singură variantă, fără tab-uri: Aegean OTP↔ATH
(€587 pentru 4 la BudgetAir, fără bagaj de cală) plus Gulf Air ATH↔KUL prin Bahrain și
Singapore (€2.136 pentru 4 la Gotogate, cu bagaj inclus; oficial ar fi €2.236). Total
€2.723, adică €680 de persoană — mai scump decât oricare variantă de Manila. Cele trei
zboruri Gulf Air sunt pe același bilet, deci escalele din Bahrain și Singapore sunt
protejate; riscul e la Atena, unde biletul Aegean e separat și avem 2h 50m la dus. La
întors prindem 10h 30m peste noapte în aeroportul din Bahrain.

Două lucruri de lămurit înainte de orice decizie pe cifrele astea: Skyscanner dă zborul
Gulf Air de dus pe 13 feb, dar site-ul Gulf Air scrie 14-Feb-2027; și prețul de €607 de pe
aegeanair.com e pentru întoarcerea de dimineață (A3960, 07:45), care nu prinde aterizarea
Gulf Air de la 13:45.

**Bangkok, 13 – 28 feb 2027.** Ruta se închide, nu e dus-întors pe același drum: dus prin
Viena și Singapore cu Scoot, întors prin Beijing și Bruxelles cu Hainan. Trei rezervări
separate — Ryanair OTP→VIE (€37 / pers), Kiwi.com pentru VIE→BKK→BRU (€559 / pers, tarif
Basic; Guarantee ar fi €625), plus cursa CRL→OTP (€48 / pers). Total €2.576 pentru 4, €644
de persoană. Cere o noapte de cazare în Viena, neinclusă.

Două capcane, amândouă în document: aterizăm la **Bruxelles-Zaventem (BRU)** și plecăm de
la **Charleroi (CRL)**, două aeroporturi la vreo 60 km, cu transferul pe cont propriu — de
aceea cursa de €45 de la 06:40 e imposibilă și am folosit-o pe cea de €48 de la 14:50. Iar
toate prețurile sunt căutate pentru **un singur pasager**, deci trebuie refăcută căutarea
pentru 4. Rămâne de lămurit și viza de tranzit pentru China, la escala de 4h 20m din
Beijing.

**Ho Chi Minh, 13 – 28 feb 2027.** A doua rută închisă: dus prin Viena și Singapore cu
Scoot, întors prin Așgabat și Londra cu Turkmenistan Airlines. Trei rezervări — Ryanair
OTP→VIE sâmbătă 13 feb (€37 / pers), Kiwi.com pentru VIE→SGN→LGW (€556 / pers, Basic;
Guarantee €622), plus Wizz LTN→OTP (€54 / pers). Total €2.588 pentru 4, €647 de persoană.
Noapte de cazare în Viena, 13 → 14 feb, neinclusă.

Aceeași capcană ca la Bangkok, în altă parte: aterizăm la **Gatwick** și plecăm de la
**Luton**, vreo 90 km prin Londra, cu 5h 15m la dispoziție — de aceea cursa Wizz de la
09:30 e imposibilă și am folosit-o pe cea de la 18:55, la același preț. Escala din Așgabat
e de doar 1h 20m, dar e în aceeași rezervare Kiwi. De verificat viza de tranzit pentru
Turkmenistan și prețurile pentru 4 pasageri, nu 1.

**Phuket, 13 – 28 feb 2027.** Cea mai încâlcită la sol: **două transferuri între
aeroporturi, amândouă în Golf**. La dus Wizz aterizează la Dubai (lei 1.536 pentru 4), dar
Air Arabia pleacă din **Sharjah**, la ~25 km — de aici și o noapte de cazare în Golf. La
întors Oman Air aduce înapoi la Dubai, iar Wizz pleacă din **Abu Dhabi**, la ~130 km, în
doar 5h 05m. Kiwi pentru SHJ→HKT și HKT→MCT→DXB costă €513 / pers (Basic), plus Wizz
AUH→LCA (AED 896) și LCA→OTP (€199,96), cu încă o noapte în Larnaca. Total €2.754 pentru
4, €688 de persoană.

Aici taxa Kiwi Guarantee e **€254 de persoană**, de patru ori mai mare decât la Bangkok și
Ho Chi Minh, unde era €66 — e pus la „de verificat", fiindcă schimbă mult calculul dacă
vrem protecție.

## De făcut

- Adăugat următoarele destinații pe măsură ce vin screenshot-urile.
- Nopțile de cazare nu au încă estimări de preț. Când apar, intră în comparație, fiindcă
  ele decid dacă B e de fapt mai ieftin decât A.
