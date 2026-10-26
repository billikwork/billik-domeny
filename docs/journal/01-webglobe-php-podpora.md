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
