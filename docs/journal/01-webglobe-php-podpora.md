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
