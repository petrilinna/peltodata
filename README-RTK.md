# Peltodata RTK-kartta – vaihe 2

Staattinen kartta osoitteeseen `/rtk/`, ilman Flaskia tai RTK2go-verkkokyselyitä.

## Julkaisu

Kopioi ZIP-paketin sisältö Peltodatan julkisen GitHub Pages -repositorion juureen. Säilytä `rtk/`-hakemisto. Nykyinen etusivu on mukana ja sen navigaatio on päivitetty. GitHub Pagesissa avaa `/rtk/`.

## Testaus paikallisesti

Suorita paketin juuressa `python -m http.server 8000` ja avaa `http://localhost:8000/rtk/`. Pelkkä file://-avaus ei välttämättä salli JSON-tiedoston lataamista.

## Tietolähde ja rajoitukset

`rtk/points.json` on kopioitu käsin julkisen tuni-agri/RTKmap-repositorion points.json-sisällöstä 9.11.2026. Alkuperäisen JSON-aineiston viimeistä todellista päivitysaikaa ei tunneta. Virheelliset sijainnit (0,0 tai Suomen ulkopuolella) jätettiin kartalta pois. Asemien tilaa tai ajantasaisuutta ei ole tarkistettu. RTK2go-palveluun ei tehdä kyselyitä. Leaflet ja OSM-karttatiilet ladataan julkisista palveluista käyttäjän selaimessa.

Lähdekoodi: https://github.com/tuni-agri/RTKmap (GPL-3.0). Säilytä alkuperäisen tekijän maininta ja noudata GPL-3.0-lisenssin ehtoja myös jatkokehityksessä.

Automaattinen viikkopäivitys ei sisälly tähän vaiheeseen.
