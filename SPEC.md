# Zadání: Storm & Dawn Tandem (My Tandem Read), webová aplikace na GitHub Pages

## Cíl
Statická webová aplikace pro tandemové čtení knih Empire of Storms (EOS) a Tower of Dawn (TOD) od Sarah J. Maas. Aplikace vede čtenáře předem daným střídavým pořadím kapitol z obou knih, ukládá postup a poznámky a vypadá jako z přebalů těchto knih (fialová a oranžová, tmavé siluety).

## Technologie a omezení
- Čistě statický web nasaditelný na GitHub Pages: žádný backend, žádné účty, žádné cookies ani tracking.
- **Rozhodnuto:** vanilla HTML, CSS a JavaScript jako ES moduly, **bez build kroku** (žádný Vite, TypeScript ani framework). Kořen webu je složka `/docs` nebo kořen repa; Pages nasazuje rovnou statické soubory.
- Všechny odkazy na soubory jsou **relativní** (`./app.js`, ne `/app.js`), aby web fungoval pod `https://<uživatel>.github.io/<repo>/`.
- Všechna data uživatele jsou v `localStorage` (klíč `myTandemRead:v1`). Když je `localStorage` nedostupný nebo vyhazuje chybu (anonymní režim), aplikace běží s daty jen v paměti a zobrazí nenápadné upozornění "Progress will not be saved in this browser mode." (jen anglicky).
- Mobile-first, responzivní, použitelné i na desktopu. Maximální šířka obsahu přibližně 720 px, vycentrovaná. Na mobilu se nic nepřetéká do šířky.
- Dvě jazykové verze UI (CS/EN) a světlý, tmavý a automatický vzhled přes CSS proměnné a `prefers-color-scheme`.
- Dostupnost: popisky (`aria-label`) u ikon, ovládání klávesnicí, viditelný focus, dostatečný kontrast (včetně textu na 65% a 28% zbarvených segmentech).
- Respektovat `prefers-reduced-motion` (úvodní animaci nahradit prostým prolnutím).
- Testy: `node --test` (vestavěný test runner, žádné závislosti). Logika (rozbalení kapitol, skloňování, import/export, výpočty) je v čistých modulech bez DOMu, aby šla testovat v Node.
- GitHub Actions workflow pro deploy na Pages (`actions/upload-pages-artifact` + `actions/deploy-pages`), který před nasazením spustí testy. README s návodem (anglicky i česky stručně).
- Aplikace neobsahuje žádný text z knih ani oficiální obálky. Všechna grafika je vlastní SVG (včetně ikon a plačícího smajlíka, žádné emoji).

## Data: pořadí čtení
Zdroj: infografika "Chapter Order" (@parismaereads). Pořadí je jedna lineární osa, kterou se čtenář řídí shora dolů. Ulož ji do `chapters.json`.

Značení: `E` = Empire of Storms, `T` = Tower of Dawn, `N` = novela Nightfall (patří k EOS), `F` = novela Fireheart (patří k TOD). `E:1-5` znamená EOS kapitoly 1 až 5. Pořadí je rozdělené do 4 částí (podle sloupců infografiky):

```json
{
  "parts": [
    ["E:N","E:1-5","T:1","E:6-8","T:2-3","E:9-10","T:4-6","E:11","T:7","E:12-13","T:8-10","E:14-16","T:11-12","E:17-18","T:13-16","E:19"],
    ["T:17","E:20-23","T:18-21","E:24-25","T:22-23","E:26","T:24","E:27-29","T:25-28","E:30","T:29-31","E:31","T:32","E:32","T:33-35","E:33-37"],
    ["E:38-51","T:36-37","E:52","T:38-40","E:53","T:41-42","E:54-56","T:43","E:57-59","T:44-48","E:60-61"],
    ["T:49-51","E:62-63","T:52-53","E:64-65","T:54-56","E:66-67","T:57","E:68-75","T:58-68","T:F"]
  ]
}
```

- Skript při načtení rozbalí bloky na jednotlivé kapitoly, každá má ID `E:12`, `T:4`, `E:N`, `T:F`.
- Kapitola se zobrazuje jako číslo, speciální položky jako "Nightfall" a "Fireheart". V poznámkách a hlášeních jako "EOS: Chapter 12" nebo "TOD: Fireheart".
- Kontrola (už ověřena): celkem **145** položek (EOS: Nightfall + 75 kapitol = 76, TOD: 68 kapitol + Fireheart = 69). Počty kapitol v částech: 36, 37, 37, 35. Napiš unit test, který ověří celkový počet, počty podle knih a částí, to, že se žádné ID neopakuje, a že jsou pokryté všechny `E:1..75`, `E:N`, `T:1..68`, `T:F`.

## Vzhled
- Barvy: EOS fialová `#7F77DD` (text na vyplněné kapitole `#26215C`), TOD oranžová `#EF9F27` (text `#412402`).
- Banner a finále: gradient 110° `#3a1b5c` → `#8a3b7a` (45 %) → `#e0702e`. Titulek ve fontu Georgia (serif), barva `#FBE98A`.
- Úvod: světlý gradient shora dolů `#b27fd0` → `#e58aa0` → `#f6a85a` a černý serifový text (Georgia, bez kurzívy, stejně jako titulek banneru).
- Siluetová scéna (SVG, stejná na úvodu, v banneru i ve finále; definuj ji jednou a znovupoužij):
  - vlevo velká výrazná vlna (tmavě modrozelená, světlý pěnový hřeben a pár kapek pěny),
  - uprostřed se voda zklidňuje, sniží se a přechází v pobřeží,
  - vpravo břeh s městem (budovy, věžičky, druhá světlejší řada budov `#2a1838` za nimi) a vysoká věž s cimbuřím a pár oranžovými okny, sloupy a překlad u paty,
  - tmavé siluety `#140b1c`.
- **Mockup:** pokud existuje `assets/mockup.html`, převezmi z něj SVG cesty a barvy scény co nejpřesněji. Pokud neexistuje, nakresli scénu vlastními SVG tvary podle popisu výše; je to v pořádku a nemusíš se ptát.

## Navigace
- Jednoduchý hash routing: `#/` přehled, `#/notes` poznámky, `#/settings` nastavení, `#/finale` finále. Funguje tlačítko Zpět v prohlížeči a obnovení stránky.
- Úvod se zobrazí při každém načtení stránky (i po obnovení), nezávisle na routingu; po jeho skončení se přejde na aktuální hash route.
- Na každé podstránce je tlačítko "Zpět na přehled" (`back`).

## Obrazovky a chování

### 1) Úvod (při každém otevření)
- Celá obrazovka s gradientem, siluetovou scénou dole a textem `The storm is coming. / The tower is waiting. / Begin.` (černý, serif Georgia bez kurzívy, na střed).
- Žádné tlačítko, stačí kliknout nebo klepnout kamkoli (nebo stisknout libovolnou klávesu).
- Animace: text se rozpadne na malé částice (černé a ohnivě oranžové `#ff7a1a` a `#ffc04d`). Částice se zleva doprava rozletí nahoru, zhasínají a za cca 2,5 s zmizí. Pak plynule přejde úvod do přehledu. Implementace: `canvas`, vzorkování pixelů vykresleného textu po 2 px; **počet částic omezit** (např. max. ~6000, na malých/slabých zařízeních zvětšit krok vzorkování), aby animace nelagovala. Respektuj devicePixelRatio.
- Při `prefers-reduced-motion` jen jednoduché prolnutí.
- Další kliknutí během animace ji nesmí spustit znovu ani rozbít.

### 2) Přehled (hlavní obrazovka)
Shora dolů:
1. **Banner** se scénou, titulkem "My Tandem Read" a podtitulem "EMPIRE OF STORMS & TOWER OF DAWN".
2. **Tři stejně velké dlaždice** s procenty: Total/Celkem, EOS, TOD (u EOS a TOD barevný čtvereček).
3. **Řada tlačítek:** vlevo "Continue/Pokračovat" (hlavní) a "Notes/Poznámky (n)", zcela vpravo "Settings/Nastavení".
4. **Datum začátku čtení** s ikonou kalendáře a tužtičkou pro úpravu (date input). Pokud není nastavené, doplní se dnešním datem při prvním označení kapitoly.
5. **Progress pruh** (jeden segment na blok, šířka podle počtu kapitol, barva podle knihy). Plná barva = celý blok přečtený, 65 % = rozečtený, 28 % = nepřečtený. Nad pruhem odznak "You are here/Tady jsi" se šipkou: šipka ukazuje přesně na první nepřečtenou kapitolu (bez omezení), odznak se u okrajů posune, aby se vešel do šířky pruhu. Kliknutí na segment rozbalí příslušnou část.
6. **Čtyři "Části"** jako rozbalovací karty: šipka, název, mini progress bar, `přečteno / celkem`, odznak "You are here" u části s aktuální pozicí. Po otevření aplikace je rozbalená část s první nepřečtenou kapitolou (když je vše přečtené, první část).
7. **Obsah části:** bloky v pořadí čtení. Každý blok je barevný pruh (fialový EOS, oranžový TOD) se zkratkou a tlačítky kapitol. Kapitola je malé tlačítko (číslo, po přečtení vyplněné a se zatržítkem). Pod každým tlačítkem je menší ikonka tužtičky pro poznámku (zvýrazněná, pokud poznámka existuje). Aktuální kapitola má výrazný obrys.
8. **Velké tlačítko "Finished/Dočteno"** pod všemi částmi. Pokud je už uložené `finishDate`, tlačítko místo toho otevře finále (popisek stejný, bez dotazu).
9. **Patička** (jen anglicky, drobně, na střed):
   `Chapter order based on the infographic by @parismaereads. An unofficial fan project; it contains no text from the books. Empire of Storms and Tower of Dawn © Sarah J. Maas.`

### Chování označování
- Kliknutí na nepřečtenou kapitolu: pokud jsou před ní nepřečtené kapitoly, zobraz u ní inline dotaz (`markPrev`) s volbami "Yes, all" a "Just this one". Jinak ji rovnou označ.
- Kliknutí na přečtenou kapitolu ji označí zpět jako nepřečtenou.
- **Pokud je nastavené `finishDate` a uživatel jakoukoli kapitolu odznačí, `finishDate` se smaže** (čtení už není dokončené).
- "Continue/Pokračovat": otevře část s první nepřečtenou kapitolou, plynule na ni odroluje a zvýrazní ji. Pokud je vše přečtené, tlačítko se jmenuje "Done/Hotovo" a otevře finále.
- Procenta: `přečtené / všechny` zaokrouhlené na celé číslo, zvlášť pro Total, EOS a TOD.

### Poznámky
- Tužtička u kapitoly otevře inline editor: textové pole, **číslo strany** (volitelné, číselné) a **datum** (předvyplněno dnešním, lze změnit), tlačítka Save a Cancel. Prázdný text poznámku smaže.
- Stránka **Notes**: seznam všech poznámek v pořadí čtení. U každé štítek v barvě knihy ("EOS: Chapter 12"), text, řádek "Page 88 · Part 2 · 27 Oct 2026" a ikonky úpravy a smazání. Úprava vrátí na přehled a otevře editor u dané kapitoly (rozbalí část a odroluje na ni). Smazání se zeptá na potvrzení. Prázdný stav: "Nothing here yet. Add a note with the pencil next to a chapter."
- Žádné vyhledávání.

### Settings
Karty: Language (Česky/English), Appearance (Light/Dark/Auto), Progress backup (Export/Import), Replay intro animation, Start over.
- Export stáhne JSON (`my-tandem-read-backup.json`) s verzí schématu. Import ho zvaliduje (verze, typy, jen známá ID kapitol) a před přepsáním se zeptá. Neplatný soubor zobrazí srozumitelnou chybu a nic nepřepíše.
- Start over: červená karta s popisem "Deletes your read chapters, notes and start date.", po kliknutí potvrzení "Really delete all progress?" (Yes, delete / Cancel). Maže přečtené kapitoly, poznámky, datum začátku a konce, ale ne jazyk a vzhled.
- Změna jazyka přeloží celou aplikaci okamžitě, včetně formátu dat (CS `18. 10. 2026`, EN `18 Oct 2026`). Názvy kapitol, finále a patička zůstávají anglicky.

### Finished/Dočteno
- Pokud něco zbývá: dotaz `askFin` (Yes, finished / Not yet).
- Po dokončení se uloží `finishDate` a otevře se finále (`#/finale`): banner se scénou a texty (vždy anglicky, serif, `#FBE98A`):
  - **You did not yield.**
  - You turned the last page with your head held high, Fireheart.
  - The storm has passed, the tower still stands, and the dawn is yours.
- Pod tím vlastní SVG ikonka plačícího smajlíka a text "Tissues are on the house." (CS: "Tady máš kapesníčky na slzy.") a tři dlaždice: počet kapitol, dny čtení (včetně prvního dne), počet poznámek. Dole rozmezí dat.
- Finále jde otevřít znovu tlačítkem Dočteno (viz výše) nebo přes `#/finale`, dokud je `finishDate` uloženo. Bez `finishDate` přesměruj na přehled.

## Texty UI a skloňování
Slovník CS/EN (klíč → text). Texty závislé na počtu `{n}` mají **tvary podle pravidel množného čísla** (`Intl.PluralRules`: cs `one`/`few`/`other`, en `one`/`other`), ne jeden pevný řetězec. Napiš na to unit testy (1, 2, 4, 5, 11, 21).

```json
{
  "cs": {"total":"Celkem","cont":"Pokračovat","allDone":"Hotovo","notes":"Poznámky","settings":"Nastavení","startLbl":"Začátek čtení:","notSet":"zatím nenastaveno","save":"Uložit","cancel":"Zrušit","here":"Tady jsi","part":"Část","yesAll":"Ano, všechny","onlyThis":"Jen tuto","notePH":"Co tě u téhle kapitoly zaujalo?","page":"Strana","date":"Datum","finish":"Dočteno","yesFin":"Ano, dočteno","notYet":"Ještě ne","back":"Zpět na přehled","empty":"Zatím tu nic není. Poznámku přidáš tužtičkou u kapitoly.","lang":"Jazyk","look":"Vzhled","light":"Světlý","dark":"Tmavý","auto":"Podle zařízení","backup":"Záloha postupu","exp":"Exportovat","imp":"Importovat","reset":"Začít znovu","resetD":"Smaže přečtené kapitoly, poznámky i datum začátku.","resetQ":"Opravdu smazat veškerý postup?","yesDel":"Ano, smazat","replay":"Pustit úvodní animaci znovu","chapters":"Kapitol","days":"Dní čtení","tissues":"Tady máš kapesníčky na slzy.",
    "markPrev":{"one":"Označit i {n} předchozí nepřečtenou kapitolu?","few":"Označit i {n} předchozí nepřečtené kapitoly?","other":"Označit i {n} předchozích nepřečtených kapitol?"},
    "askFin":{"one":"Ještě ti zbývá {n} kapitola. Označit ji jako přečtenou a dokončit?","few":"Ještě ti zbývají {n} kapitoly. Označit je jako přečtené a dokončit?","other":"Ještě ti zbývá {n} kapitol. Označit je jako přečtené a dokončit?"}},
  "en": {"total":"Total","cont":"Continue","allDone":"Done","notes":"Notes","settings":"Settings","startLbl":"Reading started:","notSet":"not set yet","save":"Save","cancel":"Cancel","here":"You are here","part":"Part","yesAll":"Yes, all","onlyThis":"Just this one","notePH":"What stood out in this chapter?","page":"Page","date":"Date","finish":"Finished","yesFin":"Yes, finished","notYet":"Not yet","back":"Back to overview","empty":"Nothing here yet. Add a note with the pencil next to a chapter.","lang":"Language","look":"Appearance","light":"Light","dark":"Dark","auto":"Auto","backup":"Progress backup","exp":"Export","imp":"Import","reset":"Start over","resetD":"Deletes your read chapters, notes and start date.","resetQ":"Really delete all progress?","yesDel":"Yes, delete","replay":"Replay intro animation","chapters":"Chapters","days":"Days reading","tissues":"Tissues are on the house.",
    "markPrev":{"one":"Also mark {n} earlier unread chapter as read?","other":"Also mark {n} earlier unread chapters as read?"},
    "askFin":{"one":"{n} chapter left. Mark it as read and finish?","other":"{n} chapters left. Mark them as read and finish?"}}
}
```

## Datový model (`localStorage`)
```json
{
  "version": 1,
  "read": {"E:N": true, "E:1": true},
  "notes": {"E:12": {"t": "text", "p": "88", "d": "2026-10-27"}},
  "startDate": "2026-10-18",
  "finishDate": "",
  "lang": "cs",
  "theme": "auto"
}
```
Chybějící nebo poškozená data se ošetří výchozími hodnotami (žádný pád aplikace). Výchozí jazyk podle `navigator.language` (cs → cs, jinak en).

## Akceptační kritéria
1. Pořadí a počty kapitol přesně odpovídají `chapters.json` (145 položek); unit test prochází.
2. Úvodní animace se přehraje při každém otevření a jde pustit znovu v Nastavení; s `prefers-reduced-motion` je to jen prolnutí.
3. Označování, dotaz na předchozí kapitoly, "Pokračovat", procenta, datum začátku a pruh se značkou "You are here" fungují podle popisu.
4. Poznámky mají text, stranu a datum a jsou vidět v přehledu i na stránce Notes.
5. Export, import (včetně odmítnutí neplatného souboru) a Start over fungují a po obnovení stránky se stav zachová.
6. Přepnutí jazyka přeloží celou aplikaci, včetně správného skloňování u počtů a formátu dat.
7. Tlačítko Zpět a obnovení stránky fungují na všech podstránkách.
8. Aplikace běží na GitHub Pages bez serveru (relativní cesty) a na mobilu (šířka 360 px) se nic nepřetéká do šířky.
9. `node --test` projde a workflow nasazuje až po úspěšných testech.

## Mimo rozsah
Uživatelské účty, synchronizace mezi zařízeními, vyhledávání v poznámkách, texty z knih.
