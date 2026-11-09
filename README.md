# Peltoraportti – GitHub Pages -sivusto

Staattinen esittelysivusto Peltoraportti-QGIS-lisäosalle. Ei sisällä itse lisäosan lähdekoodia tai asennuspakettia.

## Julkaisu

1. Luo GitHubiin julkinen repositorio, esimerkiksi `peltoraportti-site`.
2. Lisää repositorion juureen `index.html`, `style.css` ja `.nojekyll`.
3. Avaa **Settings → Pages → Build and deployment**, valitse **Deploy from a branch**, `main` ja `/(root)`.
4. GitHub antaa sivustolle osoitteen muodossa `https://KAYTTAJA.github.io/peltoraportti-site/`.
5. Kun oma domain on valmis, lisää Pages-asetusten **Custom domain** -kohtaan `www.peltodata.fi` ja tee DNS-palvelussa `www`-nimen CNAME GitHubin ilmoittamaan `KAYTTAJA.github.io`-osoitteeseen (ilman repositorion polkua). Tarkista DNS ennen HTTPS-pakotusta.
6. Juuridomainin `peltodata.fi` ohjaus `www`-osoitteeseen tehdään DNS-palveluntarjoajan tuella tai GitHubin dokumentaation mukaisilla apex-tietueilla.

## Ennen julkaisua

- Lisää oikea pluginin latauslinkki tai QGIS-repositorion osoite ja testatut asennusohjeet.
- Vahvista QGIS-yhteensopivuus, lisäosan versio ja lisenssi.
- Lisää omat kuvakaappaukset ja yhteystiedot haluttaessa.
- Sivusto käyttää Google Fonts -fontteja; haluttaessa poista ulkoinen fonttilataus `style.css`-tiedostosta.
