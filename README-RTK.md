# Peltodata RTK-kartta – vaihe 3

Staattinen kartta käyttää `rtk/points.json`-tiedostoa. Sivun avaaminen **ei koskaan** kysy RTK2go-palvelua. `rtk/metadata.json` sisältää viimeisimmän onnistuneen aineistohaun UTC-aikaleiman, joka näytetään Suomen ajassa kartalla.

## Automaattinen päivitys

GitHub Actions: `.github/workflows/update-rtk.yml`, maanantaisin klo 04.17 UTC. Työnkulku voidaan käynnistää käsin, mutta seitsemän vuorokauden lukitus estää ennenaikaisen kyselyn.

1. `reserve` tarkistaa edellisen **hakuyrityksen** aikaleiman.
2. Työnkulku **committaa ja pushaa** uuden yritysaikaleiman `main`-haaraan **ennen verkkoyhteyttä**.
3. Vasta onnistuneen pushin jälkeen `fetch` tekee yhden NTRIP-asemaluettelopyynnön, ilman uudelleenyrityksiä tai HTTP-uudelleenohjauksia.
4. Kelvollinen uusi JSON ja päivityspäiväys pusketaan `main`-haaraan. Virhetilanteessa edellinen asemaluettelo ja sen päivämäärä säilyvät.

**Tärkeää:** Älä käynnistä `python3 scripts/update_rtk.py fetch` suoraan, ellei varauksen tallennusta GitHubiin ole varmistettu. Älä käytä muita RTK2go-hakijoita samanaikaisesti. GitHubin haarasuojaukset tai puuttuva Actions-kirjoitusoikeus voivat estää pushaamisen; silloin haku ei käynnisty. Aseta repositoryn Actions-permissions -> Workflow permissions -> Read and write permissions tarvittaessa.

GitHub Actionsin samanaikaisuusrajoitus toimii saman repositorion sisällä. Jos useita riippumattomia repositorioita hakee samaa tietoa, niiden aikarajoitukset eivät ole yhteisiä.

## Ensimmäinen päivitys

Julkaisun jälkeen ajastettu ajo tai käsin käynnistetty workflow hakee uuden aineiston. **Tässä toimitetussa ZIP-paketissa on edelleen vanha asemaluettelo ja sen päivitysaika tuntematon.** Paketin valmistelussa ei otettu yhteyttä RTK2go-palveluun.

## Testaus

`python3 -m http.server 8000`, avaa `http://localhost:8000/rtk/`. Tarkista GitHub Actions -ajon lokista varaus- ja päivityscommitit.

Lähdekoodi perustuu projektiin https://github.com/tuni-agri/RTKmap (GPL-3.0). Säilytä tekijä- ja lisenssitiedot.
