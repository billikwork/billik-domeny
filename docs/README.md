# docs — billik-domeny

Hub pre zápisky a rozhodnutia v tomto repe.

## Stav
- **2026-10-26** — Webglobe spustil poplatok "Rozšírená podpora PHP". **Vyriešené.**
  Všetkých päť položiek je na ≥ 8.2 (zvaraciestroje.sk 8.2, praskovalakovnanr.sk 8.2,
  test.zvaraciestroje.sk 8.2, billik.sk + test.billik.sk 8.4) a poplatok z `/services` zmizol.
  Zvaraciestroje.sk padalo na 8.2 kvôli `nesbot/carbon` 2.62.0 — nasadený upstream patch
  z Carbon 2.62.1 (`docs/patches/`). Pozor: je to zásah do `vendor/`, `composer install`
  ho prepíše. Webglobe 26. 10. 2026 písomne potvrdil, že výzvu 20,16 € neplatíme a že
  služba sa nebude znova fakturovať, pokiaľ držíme PHP aktuálne. Otvorené: trvalý bump
  Carbonu cez hatecomp a ďalší EOL (PHP 8.2 dobehne koniec 2026).
  Viď `journal/01`.

## Index
- [01 — Webglobe: poplatok "Rozšírená podpora PHP"](journal/01-webglobe-php-podpora.md) — analýza, cieľové verzie, runbook, vykonanie a rollback
