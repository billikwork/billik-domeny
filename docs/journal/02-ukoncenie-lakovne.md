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

## Vykonané 2026-11-16
- **lakovanie.eu, praskovanie.eu**: oznam nasadený (commit 7ca2985, Vercel auto-deploy z `main`). Overené curlom:
  titulok „Práškové lakovanie sme ukončili“, tlačidlo na billik.sk, `noindex, nofollow`, staré cesty 308 → `/`.
- **billik.sk/lakovna/** (Shoptet): stránka „PRÁŠKOVÁ LAKOVŇA“ skrytá (Vzhľad a obsah → Stránky, nie zmazaná)
  + 301 `/lakovna/` → `/` (Marketing → Základné SEO → Presmerovanie URL, admin URL `/admin/presmerovanie-url/`).
  Overené: `curl -I https://www.billik.sk/lakovna/` → 301 na `https://www.billik.sk/`.
- **praskovalakovnanr.sk** (Webglobe BIL0007, doménové ID 167439):
  - záloha: FTP záloha zo 15. 11. 2026 stiahnutá do `~/Downloads/praskovalakovnanr.sk-2026-11-15-6e1eba7975.tgz`
    (473 MB, 21 655 súborov, `public_html` + `DB_BACKUP/` s dumpmi DB `praskovalakovnanr_sk_wp` 10.–14. 11.). Archív otestovaný `tar -tzf`.
  - odoslané požiadavky na zrušenie (Služby → Prehľad služieb → kôš → „Požiadať o zrušenie“):
    **Webhosting Plus** (89,88 €/rok) a **Reg. poplatok za doménu .sk** (doména platí do 13. 1. 2027).

## Otvorené
- Webglobe zrušenie spracúva ručne — skontrolovať potvrdzujúci e-mail na billik@billik.sk a že služby zmizli z prehľadu.
- Záloha leží len v `~/Downloads` — presunúť na trvalé miesto (Google Drive / NAS).
- **praskovalakovna.sk** (bez „nr“, Webglobe, registrovaná 16. 3. 2023, autofakturácia zapnutá) — ďalšia lakovacia
  doména, v zadaní nebola. A 212.57.34.249, HTTPS neodpovedá. Čaká na rozhodnutie, či ju zrušiť.
- lakovanie.eu a praskovanie.eu domény zostávajú (nesú oznam); rozhodnúť neskôr, či ich nechať expirovať.

## 2026-11-16 (pokračovanie) — všetko pozastavené, otázky pre šéfa
Používateľ: „Make everything on hold, and I'm gonna ask my boss“. Ďalšie zrušenia nerobím.
Už odoslané požiadavky na praskovalakovnanr.sk (hosting + doména) bežia do konca obdobia
(hosting do 11. 1. 2027, doména do 13. 1. 2027) — dá sa ich ešte stiahnuť cez podporu Webglobe.

Inventúra Webglobe BIL0007 (ceny obnovy bez DPH / rok) a čo doména reálne ukazuje (curl 16. 11. 2026):
| služba | cena/rok | stav |
|---|---|---|
| billik.sk Webhosting Plus | 89,88 € | nič na ňom nebeží (web Shoptet, mail Google) |
| praskovalakovnanr.sk hosting + doména | 89,88 + 17,99 € | zrušenie požiadané |
| praskovalakovna.sk doména | 17,99 € | web neodpovedá |
| lakovanie.eu, praskovanie.eu | 2 × 11,99 € | len oznam o ukončení |
| zvaraciestroje.sk Firemný Webhosting + doména | 30,38 + 17,99 € | beží starý web „BILLIK - zváracia technika“ |
| 9 SEO microwebov na Verceli (billik.cz, billiktrade.eu, billikwelding.sk/.eu, invertory.eu, zvaraciatechnika.eu, servoglas.sk, servore.eu, zamocnickvyroba.sk/.eu, zvaracky.eu) | 12–18 € každá | bežia |
| billik.sk doména | 17,99 € | hlavný e-shop, ponechať |

Mimo účtu: `ochrannepracovneprostriedky.sk` je v repe ako web, ale DNS ukazuje na 212.57.34.249 (nie Vercel) a neodpovedá —
doména je registrovaná inde alebo zle nastavená.
