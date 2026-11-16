# 02 — Ukončenie lakovne: stiahnutie webov o práškovom lakovaní (2026-11-16)

## Zadanie
Billik Trade už neponúka práškové lakovanie. Treba stiahnuť všetky weby o lakovaní:
`billik.sk/lakovna/` (Shoptet), `lakovanie.eu`, `praskovalakovnanr.sk` (WordPress).
Rozhodnutia používateľa (2026-11-16):
- domény majú ukazovať **oznam, že lakovanie už nerobíme, s odkazom na billik.sk**
- Shoptet: zrušiť **len stránku `/lakovna/`** (e-shop billik.sk zostáva)
- praskovalakovnanr.sk: **záloha, potom zrušiť hosting aj doménu**
- `praskovanie.eu` (ďalší lakovací web z tohto repa, v zadaní nebol): **rovnako ako lakovanie.eu**

## Zistenia
| web | kde beží | DNS |
|---|---|---|
| billik.sk/lakovna/ | stránka v Shoptet e-shope billik.sk | NS syphon.sk, A → myshoptet |
| lakovanie.eu | tento monorepo, apps/sites na Verceli | NS webglobe, A 216.198.79.1 (Vercel) |
| praskovanie.eu | tento monorepo, apps/sites na Verceli | — |
| praskovalakovnanr.sk | WordPress 6.8 + Avada, Webglobe Webhosting Plus 9,99 €/mes. | NS nameserver.sk, A 212.57.32.72 |

Hosting praskovalakovnanr.sk je pod Webglobe účtom **BIL0007 (BILLIK TRADE s.r.o.)**, nie pod osobným
účtom (ten má len zlavozrut.sk, nowo.sk, kralsperky.sk).

## Postavené
- `apps/sites`: nový voliteľný `closed` blok v konfigurácii webu → minimalistická stránka s oznamom
  (`packages/ui/src/closed-page.tsx`), `noindex, nofollow`, prázdny sitemap, všetky ostatné cesty
  308 → `/`. Zapnuté pre `lakovanie-eu` a `praskovanie-eu`. `scripts/rotate-heroes.mjs` zatvorené weby preskakuje.
- Overené lokálne (next dev s `Host:` hlavičkami): oznam, noindex, redirect `/x/y → /`, ostatné weby nezmenené.
- Pozn.: lokálny build padá na arm64 node (lightningcss), ide len s `/usr/local/bin/node` (x64) — staršia vec, Vercel to netrápi.

## Otvorené
- Shoptet `/lakovna/` — čaká na prihlásenie do Shoptet adminu.
- praskovalakovnanr.sk záloha + zrušenie hostingu a domény — čaká na prihlásenie do Webglobe účtu BIL0007.
- Overiť nasadenie oznamu na lakovanie.eu a praskovanie.eu po pushi.
