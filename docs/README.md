# docs — billik-domeny

Hub pre zápisky a rozhodnutia v tomto repe.

## Stav
- **2026-10-26** — Webglobe spustil poplatok "Rozšírená podpora PHP" na všetky tri hostingy.
  PHP verzie prepnuté: billik.sk + test.billik.sk na 8.4, praskovalakovnanr.sk na 8.2,
  test.zvaraciestroje.sk na 8.2 — tam poplatok zmizol. **zvaraciestroje.sk ostáva na 8.0**:
  PHP 8.2 rozbilo detailové stránky produktov, vrátené späť — poplatok tam trvá
  (17,88 € bez DPH / rok). Príčina je **nájdená a overená**: `nesbot/carbon` 2.62.0
  padá na PHP 8.2 (`setLastErrors()` dostane `false` namiesto poľa). Opravu stačí
  nasadiť ako jeden súbor — `docs/patches/carbon-setLastErrors-php82.patch`.
  Viď `journal/01`.

## Index
- [01 — Webglobe: poplatok "Rozšírená podpora PHP"](journal/01-webglobe-php-podpora.md) — analýza, cieľové verzie, runbook, vykonanie a rollback
