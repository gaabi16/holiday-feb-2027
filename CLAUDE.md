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
ambele linkuri, formatul e data: `?v=20260920`). Fără asta, browserul servește versiunea
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

**Bangkok, 13 feb – 1 mar 2027.** Două variante, pe tab-uri (id-uri `ba` / `bb`):

- **A — via Viena**, €2.576 pentru 4 (€644 / pers). Rută închisă: dus prin Viena și
  Singapore cu Scoot, întors prin Beijing și Bruxelles cu Hainan. Trei rezervări — Ryanair
  OTP→VIE (€37 / pers), Kiwi VIE→BKK→BRU (€559 / pers Basic; Guarantee €625), cursa CRL→OTP
  (€48 / pers). Noapte de cazare în Viena. Capcane: aterizăm la **Bruxelles-Zaventem** și
  plecăm de la **Charleroi**, ~60 km — de aceea cursa de €45 de la 06:40 e imposibilă și am
  folosit-o pe cea de €48 de la 14:50; toate prețurile sunt căutate pentru **un singur
  pasager**; și rămâne de lămurit viza de tranzit pentru China.
- **B — Kuwait Airways**, €2.381 pentru 4 (€595 / pers), **cea mai ieftină**. Wizz OTP↔DXB
  dus-întors (lei 4.832) plus Kuwait Airways DXB↔BKK cu escală la Kuwait (AED 6.224 pentru
  4). Doar **două rezervări**, cel mai simplu din tot documentul. Noapte în Dubai la dus.
  Atenție la bagaj: dusul e Economy SAVER cu **1 × 32 kg inclus**, dar întorsul e „Economy
  Class Zero Bag" — **fără niciun bagaj de cală**. Plecarea din Bangkok e la 03:00.

A mai existat o variantă cu Air Arabia din Sharjah (€2.669), scoasă la cererea lui Mark
fiindcă datele din căutare nu se potriveau.

**Ho Chi Minh, 13 – 28 feb 2027.** Trei variante, pe tab-uri ca la Manila:

- **A — via Viena**, €2.588 pentru 4 (€647 / pers). Rută închisă: dus prin Viena și
  Singapore cu Scoot, întors prin Așgabat și Londra cu Turkmenistan Airlines. Trei
  rezervări — Ryanair OTP→VIE (€37 / pers), Kiwi VIE→SGN→LGW (€556 / pers, Basic;
  Guarantee €622), Wizz LTN→OTP (€54 / pers). Capcana: aterizăm la **Gatwick** și plecăm
  de la **Luton**, ~90 km prin Londra — de aceea cursa Wizz de la 09:30 e imposibilă și am
  folosit-o pe cea de la 18:55. Escala din Așgabat e de doar 1h 20m, dar e în aceeași
  rezervare. De verificat viza de tranzit pentru Turkmenistan.
- **B — Singapore Airlines**, €2.789 pentru 4 (€697 / pers), cea mai scumpă. Wizz OTP→DXB
  (lei 1.536), SQ 495 + SQ 184 la dus și SQ 185 + SQ 494 la întors (AED 7.960 pentru 4),
  apoi Wizz DXB→OTP (lei 824 / pers, preț Discount Club; regular lei 879). **Câștigă o zi
  întreagă** — plecăm din Ho Chi Minh la 19:55, nu la 04:10 ca la A. Riscul e cel de la
  Manila: 3h 05m și T1→T2 la Dubai. Escala de la întors e de 15h 35m în Singapore.
- **C — Singapore Airlines + Larnaca**, €2.571 pentru 4 (€642 / pers), **cea mai ieftină**.
  Același dus ca B, dar întors cu SQ 187 + SQ 494 (același tarif ca la B) și acasă prin Abu
  Dhabi și Larnaca cu Wizz. Punctul slab e cel mai strâns transfer din document: **3 ore
  pentru 130 km**, Dubai → Abu Dhabi, cu check-in-ul Wizz închizându-se cu o oră înainte.
  Cere două nopți de cazare, Dubai și Larnaca.

A doua destinație cu tab-uri, deci al doilea set de id-uri în CSS: `sa` / `sb` / `sc`,
lângă `va`…`ve` de la Manila. Fiecare destinație cu tab-uri are nevoie de setul ei, fiindcă
selectorii `#id:checked~.pane-x` merg doar între frați.

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

**Da Nang, 14 – 28 feb 2027.** Singura variantă cu **bagaj de cală inclus** (25 kg, scris
în condițiile de tarif). Wizz OTP→DXB (lei 1.536), Singapore Airlines DXB↔DAD (AED 7.760
pentru 4, cel mai mic tarif SQ din document), apoi acasă prin Abu Dhabi și Larnaca cu Wizz.
Total €2.524 pentru 4, €630 de persoană. Bucata Singapore↔Da Nang e operată de **Scoot**,
cu aceleași condiții de tarif dar fără divertisment la bord.

Zborul SQ pleacă din Dubai **luni 15 feb**, deci venim cu Wizz duminică 14 și dormim o
noapte în Dubai — dacă am veni sâmbătă ca la celelalte destinații, ar fi două. Prețul și
orele Wizz din tabel sunt însă cele găsite pentru 13 feb, de recăutat pentru 14. La întors
sunt 17h de escală în Singapore, peste noapte, plus același transfer strâns de 3 ore
Dubai→Abu Dhabi ca la Ho Chi Minh C. Sejurul e cel mai scurt din document: 10 nopți.

**Maldive, 14 – 25 feb 2027.** Singura destinație cu alte date: plecăm duminică 14 și
suntem acasă joi 25 februarie, deci ies doar **9 nopți**, cel mai scurt sejur din document.
Wizz OTP↔DXB dus-întors (lei 4.152) plus Air Arabia SHJ↔MLE (AED 7.227 pentru 4), în total
€2.487, €621 de persoană. **Cel mai scurt drum din tot documentul** — 4h 25m dus și 4h 30m
întors, direct, fără escală.

Costul ascuns e transferul Dubai→Sharjah de la dus: aterizăm la 20:20 și Air Arabia pleacă
la 02:45, deci noaptea se duce pe cei 25 km și pe așteptare, chiar dacă nu plătim hotel. La
întors transferul e ziua, cu 6h 20m la dispoziție. Întorsul Air Arabia e mai scump decât
dusul: AED 1.021 față de AED 785 de persoană.

Există și o a doua cursă de întoarcere la același preț — **G91012**, MLE 12:20 → SHJ 15:50,
în loc de G9094 la 11:15 → 14:45. E notată în traseu, nu ca variantă separată: totul
altceva e identic, iar diferența e o oră în plus în Maldive contra unui transfer de 5h 15m
în loc de 6h 20m.

**Zanzibar, 13 – 28 feb 2027.** A doua cea mai ieftină din document: €2.104 pentru 4, €526
de persoană — după Manila E. Wizz **din Cluj-Napoca** la Abu Dhabi (lei 3.632, aceeași
rezervare ca la Manila C) plus Ethiopian Airlines AUH↔ZNZ prin Addis Abeba, luat prin
lastminute.com la €353 / pers, cu bagaj de cală inclus (oficial ar fi AED 6.600, adică €387
/ pers). Doar două rezervări. Drumul e scurt pentru distanță: 7h 30m la dus.

Are însă cele două extreme ale documentului: **escala de 35 de minute din Addis Abeba**,
cea mai strânsă de oriunde (protejată de rezervarea Ethiopian, dar la limită pentru o
conexiune internațională), și **18 ore de așteptare în Abu Dhabi la întors** — aterizăm la
03:10 și Wizz pleacă la 21:15. Plus încă o noapte în Abu Dhabi la dus și drumul până în
Cluj. De verificat viza pentru Tanzania.

## De făcut

- Adăugat următoarele destinații pe măsură ce vin screenshot-urile.
- Nopțile de cazare nu au încă estimări de preț. Când apar, intră în comparație, fiindcă
  ele decid dacă B e de fapt mai ieftin decât A.
