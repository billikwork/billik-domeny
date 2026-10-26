# Patche

## carbon-setLastErrors-php82.patch

**Čo rieši:** zvaraciestroje.sk padá na PHP 8.2 na všetkých detailových stránkach produktov.

**Príčina:** `nesbot/carbon` 2.62.0 má v `Creator.php` metódu
`setLastErrors(array $lastErrors)`. V PHP 8.2 sa zmenilo správanie
`DateTime::getLastErrors()` — namiesto prázdneho poľa vracia `false`.
Carbon to pošle do metódy s typom `array` → `TypeError` → Tracy zaloguje
kritickú chybu a odpoveď ostane prázdna (HTTP 200, 0 bajtov).

**Oprava:** je to doslovne upstream commit z Carbon **2.62.1**
(overené diffom medzi tagmi 2.62.0 a 2.62.1 — tento patch je s ním zhodný).

### Ako ho nasadiť

Správne riešenie, ak je k dispozícii SSH:

```
composer update nesbot/carbon
```

Bez SSH (Webglobe WebFTP alebo Správa súborov) — nahradiť jediný súbor:

```
vendor/nesbot/carbon/src/Carbon/Traits/Creator.php
```

Pôvodný súbor má 30 277 bajtov, md5 `dd8e4cc7f1fd48983ded64a7bf30f82f`.
Opravený má 30 536 bajtov. Pred nahratím odložiť pôvodný ako `Creator.php.bak`.

**Pozor:** ide o zásah do `vendor/`. Akýkoľvek budúci `composer install`
ho prepíše. Trvalé riešenie je dať do `composer.json` `nesbot/carbon: ^2.62.1`
— to je úloha pre pôvodnú agentúru (hatecomp).

Po nasadení prepnúť PHP na 8.2 v admin.webglobe.sk → `/13687/phpvars`
a overiť `./scripts/php-switch-check.sh after zvaraciestroje && ... diff zvaraciestroje`.
