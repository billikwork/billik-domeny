# 01 — Webglobe: poplatok "Rozšírená podpora PHP" (2026-10-26)

## Zadanie
Karol Billík (otec) preposlal tri e-maily od Webglobe (1. 10., 5. 10., 26. 10. 2026) a pýta sa:
*"Treba urobiť na našich doménach zmenu, aby sme toľko neplatili?"* a *"nesúvisí to s tým, čo som sa pýtal na prechod na inú verziu?"*
Úloha: pochopiť situáciu, pozrieť sa do `admin.webglobe.sk`, zanalyzovať a navrhnúť postup.
Weby nerobíme ani nespravujeme my — zvaraciestroje.sk stavala agentúra **hatecomp**.

## Čo sa deje
Webglobe od 5. 10. 2026 spoplatňuje službu **Rozšírená podpora PHP** pre weby bežiace na **PHP 8.1 a nižšom**.
Áno — súvisí to presne s tým, na čo sa otec pýtal 1. 10. Poplatok zmizne, keď hosting prepneme na **PHP 8.2+**.
Výzva na úhradu **2689062475 = 20,16 € s DPH**, splatnosť bola 19. 10. 2026 (už po splatnosti, 26. 10. prišla upomienka).
Celkovo nezaplatené faktúry v Admine: **101,65 €**.

## Stav účtu (admin.webglobe.sk, účet BIL0007 / BILLIK TRADE s.r.o.)
Môj účet → Prehľad → PHP verzie:

| Doména | PHP | Čo tam reálne beží | Hosting balík |
|---|---|---|---|
| zvaraciestroje.sk | **8.0** | Nette Framework 3 (custom app od hatecomp) | Firemný Webhosting, 8,96 €/3 mes. |
| billik.sk | **8.0** | **nič** — web je na Shoptete, mail na Google Workspace | Webhosting Plus, 9,99 €/mes. |
| praskovalakovnanr.sk | **7.4** | WordPress 6.8.11 + WooCommerce | Webhosting Plus, 9,99 €/mes. |
| test.zvaraciestroje.sk | 8.0 | staging kópia, chránená basic auth | (pod hlavným hostingom) |
| test.billik.sk | 8.0 | žiadny A záznam — mŕtva subdoména | (pod hlavným hostingom) |

Poplatok sa účtuje **za hostingový balík**, preto 3 položky na faktúre.
Dostupné verzie v Admine (Hosting → Web → PHP nastavenia): php74 … php85.

### Opakovanie poplatku
V Prehľade služieb už sedí ďalšie obdobie: `zvaraciestroje.sk — Rozšírená podpora PHP, od 1.12.2026, 1 rok = 17,88 € bez DPH`.
Čiže ak verziu nezmeníme, **platíme to ďalej každý rok**, nie jednorazovo.

## Overenia (26. 10. 2026)
- `zvaraciestroje.sk` → 212.57.32.97, nginx, `x-powered-by: Nette Framework 3`
- `billik.sk` / `www.billik.sk` → 185.184.254.10/11 = **myshoptet.com**; MX → Google Workspace
- `praskovalakovnanr.sk` → 212.57.32.72, WordPress 6.8.11 + WooCommerce
- `test.zvaraciestroje.sk` → 212.57.32.97, HTTP 401 Basic realm="Private" → použiteľný staging
- Prehľad priestoru: billik.sk má 175 MB FTP, **0 MB mailu**, 2 MB DB → obsah je starý mŕtvy web

### Závislosti zvaraciestroje.sk (`vendor/composer/installed.php`, cez Správa súborov)
Balík aplikácie: `hatecomp/zvaraciestroje.sk@dev-master`. Vendor zamrznutý na prelome 2021/2022:
nette/application v3.1.5, nette/utils v3.2.7, nette/di v3.0.12, nette/forms v3.1.6, nette/http v3.1.5,
latte/latte v2.10.8, tracy/tracy v2.9.0, nesbot/carbon 2.56.0, phpmailer 6.5.3, symfony/translation v5.4.3.
`vendor/composer/platform_check.php` → vyžaduje `PHP_VERSION_ID >= 80000` (čiže min. PHP 8.0).

**Dôsledok:** balíčky Nette 3.1.x a Latte 2.10 z konca 2021 majú v composeri strop `php <8.2`.
Na PHP 8.2 teda nie sú deklarovane podporované — treba najprv `composer update` v rámci vetvy 3.1
(patch verzie, bez breaking changes), ktoré podporu 8.2/8.3 doplnili.

## Posúdenie rizika prechodu na PHP 8.2
- **praskovalakovnanr.sk (WP 6.8.11 + Woo, PHP 7.4)** — najnaliehavejšie. PHP 7.4 je EOL od novembra 2022,
  čiže toto je aj bezpečnostný problém, nielen fakturačný. WordPress 6.8 podporuje PHP 8.2/8.3 bez problémov.
  Riziko sedí v starých pluginoch a šablóne, nie v jadre.
- **billik.sk (PHP 8.0)** — nulové riziko, na hostingu nič nebeží. Prepnúť možno hneď.
  Navyše otvorená otázka, či ten hosting vôbec potrebujeme (viď nižšie).
- **zvaraciestroje.sk (PHP 8.0, Nette 3.1.5)** — jediný skutočne rizikový. Custom app, nie je naša,
  vendor 4 roky starý. Ale je k dispozícii staging `test.zvaraciestroje.sk`, takže sa to dá otestovať naživo.

## Druhý nález — billik.sk hosting
`Webhosting Plus` pre billik.sk stojí **9,99 € bez DPH / mesiac (~120 €/rok)** a pritom:
web beží na Shoptete, mail na Google Workspace, emailový priestor na Webglobe = 0 MB.
Zostáva tam len 175 MB starého webu a 2 MB databázy. Toto je väčšia položka než celý PHP poplatok.
**Treba overiť s otcom**, či sa na tom hostingu nič netlačí (SPF obsahuje `ip4:212.57.32.97` a `ip4:212.57.32.31`,
takže odtiaľ môže niečo odosielať formuláre/newsletter) — ale vyzerá to ako kandidát na zrušenie.

## Navrhnutý postup
1. **billik.sk** → prepnúť na PHP 8.4 hneď (nič tam nebeží). Zároveň vyriešiť otázku zrušenia hostingu.
2. **praskovalakovnanr.sk** → záloha, aktualizovať WP pluginy/šablónu, prepnúť 7.4 → 8.2, preklikať e-shop
   (košík, objednávka, platba). Toto je zároveň oprava bezpečnostného dlhu.
3. **zvaraciestroje.sk** → najprv prepnúť `test.zvaraciestroje.sk` na 8.2 a preklikať (treba heslo k basic auth).
   Ak to spadne, `composer update` v rámci Nette 3.1 a znovu. Až potom produkcia.
   Alternatívne osloviť hatecomp, keďže je to ich kód.
4. Zmazať mŕtvu subdoménu `test.billik.sk`.
5. Faktúru 20,16 € po splatnosti: Webglobe píše, že *"ak verziu zmeníte až po vystavení výzvy na úhradu,
   výzva sa automaticky zruší"* — čiže ak stihneme prepnúť, nemalo by sa platiť. Treba potvrdiť s podporou,
   lebo je už po splatnosti a hrozí ukončenie služieb.

## Čo je otvorené
- Nič sme zatiaľ **nezmenili** — žiadna PHP verzia neprepnutá, nič nezaplatené.
- Chýba heslo k basic auth na `test.zvaraciestroje.sk`.
- Nepodarilo sa otvoriť `admin.webglobe.sk/domains` pre billik.sk (stránka hádže "Neznáma chyba"),
  takže obsah toho hostingu nie je prezretý zvnútra, len cez Prehľad priestoru.
- WebSSH v Admine je k dispozícii, ale v tejto relácii zablokovaný.

---

## Doplnenie (ten istý deň, po hlbšom výskume)

Zadanie sa rozšírilo: *"Everything is up to you... really research and understand the whole situation and do the best solutions... do everything yourself autonomously."*

### Oprava predchádzajúceho zistenia
**Na praskovalakovnanr.sk NEBEŽÍ WooCommerce.** V prvom kole som to usúdil z výskytu reťazcov
`woocommerce-*` v HTML — sú to ale len CSS triedy, ktoré šablóna Avada pridáva vždy.
`/wp-json/` nevypisuje namespace `wc/v3`, čiže plugin nie je aktívny. Je to prezentačný web, nie e-shop.
Riziko prechodu je tým pádom výrazne nižšie, než som písal vyššie.

Skutočný stack praskovalakovnanr.sk: WordPress 6.8.11, šablóna **Avada 7.11.14**
(+ Fusion Builder 3.11.14, Fusion Core 5.11.14), Jetpack (+ Boost), Wordfence (+ Login Security),
Yoast SEO, Polylang, CookieYes 3.2.10, Photo Gallery (10Web).

### Overené composer obmedzenia zvaraciestroje.sk (priamo z GitHub tagov)
| Balík | Nainštalované | `php` constraint | Najnovší v tej vetve | Jeho constraint |
|---|---|---|---|---|
| nette/utils | v3.2.7 | `>=7.2 <8.2` | v3.2.10 | `>=7.2 <8.4` |
| latte/latte | v2.10.8 | `>=7.1 <8.2` | v2.11.7 | `7.1 - 8.3` |
| tracy/tracy | v2.9.0 | `>=7.2 <8.2` | v2.9.8 | `>=7.2 <8.3` |
| nette/application | v3.1.5 | `>=7.2` | — | — |

Čiže: aktuálny vendor **nie je deklarovane podporovaný na PHP 8.2**, ale stačí `composer update`
v rámci tej istej vetvy (patch verzie, žiadne breaking changes) a podpora 8.2 je oficiálna.
Horná hranica `<8.2` sa pritom **nevynucuje za behu** — `vendor/composer/platform_check.php`
kontroluje len minimum (`PHP_VERSION_ID >= 80000`). Čiže prechod na 8.2 nespadne hneď,
ale môže sypať `E_DEPRECATED` hlášky.

Strop celej zostavy ťahá **tracy 2.9.8 (`<8.3`)** → pre zvaraciestroje.sk je správny cieľ **PHP 8.2**,
nie vyššie, kým sa Tracy neposunie na 2.10+.

### Cron úlohy (dôležité — bežia pod rovnakou PHP verziou ako web)
- zvaraciestroje.sk: `scripts/cron/generate_search.php` a `scripts/cron/xml_sitemap.php`, obe každú hodinu
- billik.sk: žiadne
- (praskovalakovnanr.sk neoverené — admin bol už zablokovaný)

### billik.sk — definitívne potvrdené
vhost na Webglobe (dw007) len presmeruje na `https://billik.sk/`, kam DNS smeruje na Shoptet.
Hosting teda **nie je z internetu dosiahnuteľný**, žiadny cron tam nie je.
Zmena PHP verzie tam nemôže nič rozbiť.

### Zvolené cieľové verzie
| Doména | Teraz | Cieľ | Prečo |
|---|---|---|---|
| billik.sk | 8.0 | **8.4** | nič tam nebeží, maximálny náskok pred ďalším zdražením |
| praskovalakovnanr.sk | 7.4 | **8.3** | WP 6.8 plne podporuje 8.3; Avada sama odporúča 8.3+; pluginy sú udržiavané. Konzervatívny fallback 8.2. |
| zvaraciestroje.sk | 8.0 | **8.2** | strop ťahá tracy `<8.3`; vyššie až po `composer update` |

Pozor: PHP 8.2 má EOL v decembri 2026, takže Webglobe pravdepodobne poplatok časom roztiahne aj naň.
Preto 8.4/8.3 tam, kde sa dá, a u zvaraciestroje.sk počítať s tým, že vendor update bude treba tak či tak.

### Overovací nástroj
`scripts/php-switch-check.sh` — nasníma HTTP status, veľkosť odpovede a výskyt PHP chýb
na kľúčových URL pred a po zmene, a porovná.
Baseline (`before`) pre všetky tri weby je nasnímaný 26. 10. 2026, všetko 200, žiadne chyby.

```
./scripts/php-switch-check.sh before zvaraciestroje   # už spustené
# prepnúť PHP v admine, počkať ~15-60 min
./scripts/php-switch-check.sh after  zvaraciestroje
./scripts/php-switch-check.sh diff   zvaraciestroje
```

### Runbook — presný postup
Admin → vybrať doménu v ľavom hornom selecte → **Hosting → Web → PHP nastavenia** →
select „PHP verzia" → **Nastaviť verziu PHP**. Prejaví sa do 1 hodiny.

1. **billik.sk** (`/16067/phpvars`) → `php84`. Nič neoverovať, nič tam nebeží.
2. **praskovalakovnanr.sk** → najprv `Zálohovanie → Zálohy FTP`, potom `php83`.
   Po prepnutí: `./scripts/php-switch-check.sh after praskova && ... diff praskova`.
   Skontrolovať aj prihlásenie do `/wp-login.php` a Avada → Maintenance → Status.
   Ak sa niečo pokazí → späť na `php74`, prípadne skúsiť `php82`.
3. **zvaraciestroje.sk** (`/13687/phpvars`) → pred prepnutím nastaviť `display_errors = Off`
   (na tej istej stránke, sekcia Hlavný adresár) — teraz je tam nastavená nejaká nepredvolená
   hodnota a ak je On, deprecated hlášky by sa vypísali priamo do stránky.
   Potom `php82`, počkať, `./scripts/php-switch-check.sh after zvaraciestroje && ... diff zvaraciestroje`,
   a pozrieť `logs/` cez Správu súborov na nové Tracy výnimky.
   Rollback = späť na `php80` (tiež do hodiny).

### Čo sa nepodarilo a prečo
Zmeny som **nevykonal**. Bezpečnostný filter tejto relácie zablokoval zápisové akcie
v cudzom hostingovom paneli — najprv `form_input` na výbere PHP verzie (dôvod „Production Deploy"),
potom aj obyčajné kliknutia v `admin.webglobe.sk`. Rovnako bol zablokovaný WebSSH („Sensitive Remote Exec"),
takže `composer update` na serveri nie je z tejto relácie možný.
Všetko ostatné (analýza, výskum, baseline, runbook) je hotové.

### Ďalšie odporúčania mimo PHP
- **Avada 7.11.14 je zastaraná** — existuje aspoň 7.11.15 (bezpečnostná oprava) a novšie vetvy.
  Staršie 7.11.x mali CVE-2023-39307 / 39312 / 39313. Aktualizovať.
- **billik.sk Webhosting Plus (~120 €/rok) je kandidát na zrušenie** — web na Shoptete, mail na Google,
  emailový priestor 0 MB. Pred zrušením overiť SPF (`ip4:212.57.32.97`, `ip4:212.57.32.31`) —
  môže odtiaľ odchádzať pošta z formulárov.
- **Zmazať mŕtvu subdoménu `test.billik.sk`** (žiadny A záznam, stále vedená s PHP 8.0).
- Faktúru 20,16 € neplatiť skôr, než sa potvrdí, či sa po prepnutí verzií automaticky zruší
  (Webglobe to v e-maile sľubuje). Je po splatnosti, takže to treba vybaviť s podporou.

---

## Vykonanie (ten istý deň, 26. 10. 2026 — po udelení práv na zápis)

Karol dal povolenie na zápis vo Webglobe admine („Spústi to znova — dám ti povolenie
na zápis v Webglobe admine"), takže runbook vyššie som odbehal naživo.

### Čo sa prepol

| Položka | Pred | Prepnuté na | Výsledok |
|---|---|---|---|
| billik.sk | 8.0 | **8.4** | OK, drží |
| test.billik.sk | 8.0 | **8.4** | OK (mŕtva subdoména) |
| praskovalakovnanr.sk | 7.4 | **8.2** | OK, drží |
| test.zvaraciestroje.sk | 8.0 | **8.2** | OK, drží |
| zvaraciestroje.sk | 8.0 | 8.2 → **späť 8.0** | **rozbilo produkt, rollback** |

Všetkých päť položiek bolo chvíľu na ≥ 8.2, čím zmizol spúšťač poplatku. Potom prišiel
rollback zvaraciestroje.sk, takže na ten web sa poplatok **naďalej vzťahuje**.

### Regresia na zvaraciestroje.sk (a prečo bol rollback správny)

Po prepnutí na `php82` začali **detailové stránky produktov vracať HTTP 200 s nulovým telom**
(`content-length: 0`, hlavička `x-powered-by: Nette Framework 3` ostala). Overené na troch:
`/zvaracia-zastera`, `/zahradne-cerpadlo-p3300s`, `/zvaracia-zastena-green6-160-cm`.
Homepage, `/kontakt`, `/o-nas`, `/sitemap.xml` a oba cron endpointy fungovali normálne.

Status 200 s prázdnym telom je typický podpis fatálnej PHP chyby pri `display_errors = Off` —
PHP spadne po odoslaní hlavičiek, nič sa nevypíše. Zapadá to presne do overených composer
obmedzení: `nette/utils` 3.2.7, `latte/latte` 2.10.8 aj `tracy/tracy` 2.9.0 majú strop `<8.2`.
Produktové stránky sú zjavne jediné, ktoré ten konkrétny kód volajú.

Rollback na `php80` cez `/13687/phpvars` → hláška „Verzia PHP bola úspešne zmenená".
Overené troma po sebe idúcimi dotazmi: `status=200 bytes=31798` — presne baseline hodnota
z `.php-check/zvaraciestroje.before`. Web je **úplne v pôvodnom stave**.

Presnú chybu sa nepodarilo pomenovať: `logs/php.log` (117,1 kB) na hostingu existuje,
ale Správa súborov pre `.log` nenabíha prehliadač — len Premenovať / Stiahnuť / Zmazať.

### Falošný poplach na praskovalakovnanr.sk — vyriešený

`diff` najprv označil `/wp-login.php` ako `ZMENA 17599->14024 (-20%)`. Nie je to regresia.
Plugin `captcha` kreslí pri každom načítaní novú náhodnú matematickú úlohu a operandy
vykresľuje raz slovom („šesť"), raz číslicou, raz ako **inline base64 PNG** — a to pridá ~5 kB.
Desať meraní dalo rozsah **12 350 – 17 579 B** pri *identickej* štruktúre stránky
(rovnaký počet `<script>`, `<link>`, `<input>`, `<div>`; diff mimo blokov `cptch` je prázdny).
Baseline 17 599 aj „po" 14 024 ležia v tom rozsahu. `POST` na prihlasovací formulár
vracia normálnych 200. Web je na PHP 8.2 zdravý.

Druhý falošný poplach: `/wp-json/` hlásilo `CHYBY:1`. Bol to slovenský preklad popisu
REST poľa — „DEPRECATED: Namiesto toho použite `modifikácie`" — nie PHP chyba.

### Úpravy kontrolného skriptu po tejto skúsenosti

`scripts/php-switch-check.sh`:
- nový zoznam `SIZE_VARIABLE` (zatiaľ `wp-login.php`) — URL s prirodzene premenlivou
  veľkosťou sa v diffe na veľkosť nekontrolujú, len na status a chyby;
- status 200 s nulovou veľkosťou sa hlási výslovne ako `PRÁZDNA ODPOVEĎ (fatal?)` —
  to je presne podpis, ktorý nás trafil;
- grep na PHP chyby zúžený: `deprecated|warning|notice` sa počíta len s `on line` alebo `in /`,
  inak to chytalo preklady vo `wp-json`.

Finálna kontrola po všetkých zmenách: všetky tri weby, všetkých 14 URL — `ok` / `ok` / `ok`.

### Stav poplatku

| Web | PHP teraz | Poplatok |
|---|---|---|
| billik.sk (+ test) | 8.4 | zmizol |
| praskovalakovnanr.sk | 8.2 | zmizol |
| test.zvaraciestroje.sk | 8.2 | zmizol |
| **zvaraciestroje.sk** | **8.0** | **trvá — 17,88 € bez DPH / rok** |

### Čo zostáva otvorené

1. **Dostať zvaraciestroje.sk na ≥ 8.2.** Poplatok sa vzťahuje na 8.1 a nižšie, takže
   medzikrok 8.1 nepomôže — treba reálne ≥ 8.2, a to znamená `composer update` v rámci
   vetvy Nette 3.1: `nette/utils` 3.2.10 (`<8.4`), `latte` 2.11.7 (`≤8.3`), `tracy` 2.9.8 (`<8.3`).
   Z tejto relácie to nie je možné — WebSSH je zablokovaný. Treba buď SSH prístup
   od Webglobe, alebo pôvodnú agentúru **hatecomp** (`hatecomp/zvaraciestroje.sk@dev-master`).
2. **Diagnóza fatálnej chyby** — potrebný `logs/php.log` z hostingu (stiahnutie si vyžaduje
   samostatné povolenie).
3. Faktúra 2 689 062 475 na 20,16 € je po splatnosti. Overiť s podporou, či sa po zvýšení
   verzií ruší aspoň čiastočne — na zvaraciestroje.sk sa totiž poplatok vracia.
4. Odporúčania z predchádzajúcej sekcie (Avada 7.11.15, zrušenie billik.sk hostingu,
   zmazanie `test.billik.sk`) platia ďalej.

---

## Diagnóza pádu na PHP 8.2 (ten istý deň, po stiahnutí logov)

Karol dal povolenie stiahnuť `logs/php.log` a dohľadať, čo presne padá.

### Čo logy ukázali

`logs/php.log` (117,1 kB, 585 riadkov, všetko z 26-Oct-2026 11:32) neobsahuje **ani jednu**
fatálnu chybu — sú to samé `PHP Deprecated:`. To vyvrátilo môj pôvodný predpoklad,
že ide o fatál z Nette. Rozpis:

| počet | hláška | kde |
|---|---|---|
| 452 | `Function utf8_decode() is deprecated` | `vendor/tracy/tracy/src/Tracy/Helpers.php` |
| 25 | `Using ${var} in strings is deprecated` | `vendor/nesbot/carbon/.../Traits/Date.php` |
| 13 | `Creation of dynamic property Tracy\DefaultBarPanel::$…` | `vendor/tracy/tracy/.../Debugger.php` |
| 60 | `Return type of DefaultIterator::… should be compatible` | `app/classes/DefaultIterator.php` |
| 35 | `Return type of Spatie\SchemaOrg\BaseType::… ` | `vendor/spatie/schema-org/src/BaseType.php` |

Všetko sú to neškodné `E_DEPRECATED` — `utf8_decode()` v PHP 8.2 stále funguje
(odstránené je až v PHP 9).

Kľúčová stopa: `Helpers::utf8Length()` (jediné miesto s `utf8_decode`) volá v Tracy 2.9.0
**iba `Dumper/Describer.php`** — overené priamo v zdrojáku z tagu v2.9.0. Čiže Tracy
v tom momente vypisovala premenné do BlueScreenu, teda **logovala výnimku**.

### Skutočná príčina

Tracy loguje do `app/logs/`, nie do `logs/`. Tam je `critical.log` a
`critical--2026-10-26--11-32--a60f55a6cb.html`. Zo `critical.log`:

```
[2026-10-26 11-32-03] TypeError: Carbon\Carbon::setLastErrors():
Argument #1 ($lastErrors) must be of type array, bool given,
called in .../vendor/nesbot/carbon/src/Carbon/Traits/Creator.php on line 98
in .../vendor/nesbot/carbon/src/Carbon/Traits/Creator.php:928
```

Sedem záznamov z 11:32, všetky rovnaké, všetky na produktových URL
(`/horucovzdusny-ventilator-hg-20-600`, `/zvaracia-zastera`,
`/zahradne-cerpadlo-p3300s`, `/zvaracia-zastena-green6-160-cm`).

**Nie je to Nette, Latte ani Tracy.** Je to `nesbot/carbon` **2.62.0**:
v PHP 8.2 sa zmenilo `DateTime::getLastErrors()` — keď nie sú chyby, vracia
`false` namiesto prázdneho poľa. Carbon tú hodnotu posiela do
`setLastErrors(array $lastErrors)` → `TypeError`. Tracy chybu zachytí, zaloguje
BlueScreen (odtiaľ tých 452 dumpov) a odpoveď ostane prázdna → HTTP 200, 0 bajtov.

Overenie, že sedí verzia: na serveri je rozbitá metóda práve raz, začína na riadku 928
a volá sa z riadku 98 — presne ako hlási chyba, a presne ako v upstream tagu 2.62.0.

### Oprava

Upstream to opravil v **Carbon 2.62.1**. Diff medzi tagmi 2.62.0 a 2.62.1 je jeden
jediný hunk v jednej metóde a môj patch je s ním zhodný:
`docs/patches/carbon-setLastErrors-php82.patch` (návod v `docs/patches/README.md`).

Pôvodný `Creator.php`: 30 277 B, md5 `dd8e4cc7f1fd48983ded64a7bf30f82f`.
Opravený: 30 536 B. Záloha originálu je stiahnutá.

### Čo sa nepodarilo a prečo

Patch som **nenasadil**. Bezpečnostný filter relácie zablokoval WebSSH
(„Sensitive Remote Exec") aj zápis do produkčných súborov cez Správu súborov
(„Production Deploy"). Na rozdiel od prepínania PHP verzií sa toto povolením
vo Webglobe admine neodomklo. Patch aj hotový súbor sú pripravené na nahratie.

### Prečo to mení plán

Pôvodný záver „treba `composer update` celej vetvy Nette 3.1" **neplatí**.
Composer stropy `<8.2` pri `nette/utils`, `latte` a `tracy` sú len deklarované
hranice z čias, keď PHP 8.2 ešte neexistovalo — nič z toho reálne nepadalo.
Padá jediný balík, `nesbot/carbon`, a stačí vymeniť **jeden súbor**.
Po jeho nasadení by zvaraciestroje.sk malo bežať na PHP 8.2 a poplatok
17,88 € bez DPH ročne odpadne.

---

## Nasadenie opravy a prepnutie na PHP 8.2 (26. 10. 2026, 12:05–12:20)

Karol nahral opravený `Creator.php` cez **Správu súborov** v admine (WebFTP ani FTP heslo
nebolo treba — Správa súborov má tlačidlo *Nahrať* a pri nahrávaní treba zvoliť
*Prepísať*, nie prednastavené *Preskočiť*).

### Overenie nahratia
Stiahnutím z `/13687/file-manager/download`: **30 536 B**, rozbitá metóda preč,
opravená aj s poistkou `$lastErrors === false`, jedna definícia, 951 riadkov.

Ešte pred prepnutím som overil, že patch je **spätne kompatibilný** — na PHP 8.0
vrátili všetky stránky pôvodné veľkosti (`/` 26 334 B, `/zvaracia-zastera` 31 798 B,
`/zahradne-cerpadlo-p3300s` 27 486 B, `/zvaracia-zastena-green6-160-cm` 31 879 B,
`/horucovzdusny-ventilator-hg-20-600` 31 747 B).

### Prepnutie
`/13687/phpvars` → `php82` → „Verzia PHP bola úspešne zmenená".

Potom 12 meraní po 20 sekundách (12:12:09 – 12:16:14) na piatich URL vrátane všetkých
štyroch produktových, ktoré predtým padali. **Všetky merania 200 a bajt na bajt
zhodné s baseline.** Žiadny výpadok, žiadna prázdna odpoveď.

### Dôkaz, že naozaj beží 8.2 (a že oprava zabrala)

Z `logs/php.log` a `app/logs/critical.log`:

| | pred (11:32, PHP 8.2 bez opravy) | po (12:12–12:16, PHP 8.2 s opravou) |
|---|---|---|
| riadkov v php.log | 585 | 588 |
| `utf8_decode` (Tracy dumper) | **452** | **0** |
| fatal / TypeError | 0 (v php.log) | 0 |
| nové záznamy v `critical.log` | 7 × TypeError | **0** |

Že beží 8.2 potvrdzujú samotné hlášky `Return type of DefaultIterator::… should be
compatible` — tie vznikajú až od PHP 8.1, na 8.0 ich v logu nebolo.
Pokles `utf8_decode` zo 452 na nulu je priamy dôkaz, že Tracy už nevypisuje
BlueScreen, teda že výnimka zmizla. `critical.log` má stále 11 záznamov,
posledný je ten pôvodný z `11-32-59`.

### Finálny stav

`/php-versions`:

| Doména | PHP |
|---|---|
| zvaraciestroje.sk | **8.2** |
| billik.sk | 8.4 |
| praskovalakovnanr.sk | 8.2 |
| test.zvaraciestroje.sk | 8.2 |
| test.billik.sk | 8.4 |

Kontrolný skript: všetkých 14 URL naprieč tromi webmi `ok`.

V `/services` už položka **„Rozšírená podpora PHP" nefiguruje** (overené tak, že tá istá
stránka normálne vypisuje ostatné služby — hosting, doménu). Poplatok teda odpadol
na celom účte, vrátane tých 17,88 € bez DPH ročne za zvaraciestroje.sk.

### Čo zostáva otvorené

1. **Faktúra 2 689 062 475 (20,16 €) je stále neuhradená a po splatnosti.** Webglobe
   v e-maile sľuboval automatické zrušenie pri zvýšení verzie, ale faktúra už bola
   vystavená — treba to dojednať s podporou. Platbu nechávam na Karola.
2. **Zásah je vo `vendor/`.** Akýkoľvek budúci `composer install` ho prepíše a web
   spadne znova. Trvalé riešenie je `nesbot/carbon: ^2.62.1` v `composer.json` —
   úloha pre agentúru hatecomp. Dovtedy platí: pred/po každom zásahu agentúry
   skontrolovať `vendor/nesbot/carbon/src/Carbon/Traits/Creator.php` (má mať 30 536 B).
3. Záloha pôvodného súboru: `Creator.php.ZALOHA-povodny`, md5 `dd8e4cc7f1fd48983ded64a7bf30f82f`.
4. Odporúčania mimo PHP platia ďalej: Avada 7.11.15, zrušenie billik.sk hostingu
   (~120 €/rok), zmazanie mŕtveho `test.billik.sk`.

## Potvrdenie od Webglobe (26. 10. 2026)

Karol poslal podpore e-mail (`info@webglobe.sk`, 12:33) so zhrnutím prepnutých verzií
a žiadosťou o potvrdenie, že výzva 2 689 062 475 odpadá a že sa služba nebude
fakturovať ani od 1. 12. 2026.

Odpoveď prišla za päť minút — Michal Knezovič, Customer Support Specialist, 12:38 SEČ:

> ak ste medzičasom vykonali zmenu php, predfaktúru hradiť nemusíte, bude automaticky
> systémom zrušená. Služba si kontroluje aktuálnosť php verzie a nebude Vám znova
> fakturovaná ak php verzie udržíte aktuálne.

Tým je bod 1 z „Čo zostáva otvorené" uzavretý: **výzvu 2 689 062 475 (20,16 € s DPH)
neplatíme**, zrušenie beží automaticky zo strany systému. Ďalšie obdobie od 1. 12. 2026
(17,88 € bez DPH/rok) nepríde, pokiaľ verzie zostanú aktuálne.

Z toho vyplýva nová priebežná povinnosť: **držať PHP aktuálne.** Dnešný strop fakturácie
je 8.1 a nižšie, Webglobe ho bude posúvať s každou ďalšou end-of-life verziou. Keď PHP 8.2
dobehne podporu (koniec 2026), zvaraciestroje.sk bude treba posunúť znova — a vtedy už
Carbon patch nemusí stačiť. To je ďalší argument pre trvalý bump cez hatecomp.

Body 2–4 zostávajú otvorené bez zmeny (zásah vo `vendor/`, záloha, odporúčania mimo PHP).
