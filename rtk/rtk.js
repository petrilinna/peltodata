"use strict";
const statusEl=document.getElementById('status');
const countEl=document.getElementById('count');
const nearestEl=document.getElementById('nearest');
const selectedEl=document.getElementById('selected');
const hintEl=document.getElementById('hint');
const searchEl=document.getElementById('search');
const sourceDateEl=document.getElementById('source-date');
const clearEl=document.getElementById('clear');
if(typeof L==='undefined') { statusEl.textContent='Karttakirjaston lataus epäonnistui. Tarkista verkkoyhteys.'; }
else init();
async function init(){
 const map=L.map('map').setView([63.2,25.6],6);
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMapin tekijät'}).addTo(map);
 const markers=L.layerGroup().addTo(map);let stations=[];let chosen=null;let chosenMarker=null;
 const fmtKm=(n)=>new Intl.NumberFormat('fi-FI',{maximumFractionDigits:1}).format(n)+' km';
 function distance(a,b){const R=6371;const rad=x=>x*Math.PI/180;const dLat=rad(b.lat-a.lat),dLon=rad(b.lon-a.lon);const q=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2;return 2*R*Math.atan2(Math.sqrt(q),Math.sqrt(1-q));}
 function choose(lat,lon,label){chosen={lat,lon};if(chosenMarker)map.removeLayer(chosenMarker);chosenMarker=L.circleMarker([lat,lon],{radius:9,color:'#c15c21',weight:3,fillColor:'#f4b465',fillOpacity:1}).addTo(map).bindPopup('Valittu sijainti');selectedEl.textContent=label||`Valittu sijainti: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;hintEl.textContent='Viisi lähintä asemaa valittuun sijaintiin:';renderNearest();}
 function renderNearest(){nearestEl.replaceChildren();if(!chosen)return;const nearest=[...stations].map(s=>({...s,km:distance(chosen,s)})).sort((a,b)=>a.km-b.km).slice(0,5);for(const s of nearest){const li=document.createElement('li');const btn=document.createElement('button');btn.type='button';btn.textContent=s.stationName;btn.addEventListener('click',()=>map.setView([s.lat,s.lon],12));li.append(btn,document.createTextNode(` — ${fmtKm(s.km)}${s.municipality?' · '+s.municipality:''}`));nearestEl.append(li);}}
 function draw(){markers.clearLayers();const q=searchEl.value.trim().toLocaleLowerCase('fi');let shown=0;for(const s of stations){if(q&&!`${s.stationName} ${s.municipality}`.toLocaleLowerCase('fi').includes(q))continue;shown++;const m=L.circleMarker([s.lat,s.lon],{radius:6,color:'#fff',weight:1.5,fillColor:'#1b735a',fillOpacity:.95}).addTo(markers);const wrap=document.createElement('div');const strong=document.createElement('strong');strong.textContent=s.stationName;wrap.append(strong);if(s.municipality){const p=document.createElement('p');p.textContent=s.municipality;wrap.append(p);}const p=document.createElement('p');p.textContent=`${s.lat.toFixed(4)}, ${s.lon.toFixed(4)}`;wrap.append(p);const b=document.createElement('button');b.type='button';b.textContent='Valitse aseman sijainti';b.addEventListener('click',()=>choose(s.lat,s.lon,`Valittu asema: ${s.stationName}`));wrap.append(b);m.bindPopup(wrap);}
 countEl.textContent=`${shown} / ${stations.length} asemaa`;}
 map.on('click',e=>choose(e.latlng.lat,e.latlng.lng));searchEl.addEventListener('input',draw);clearEl.addEventListener('click',()=>{chosen=null;selectedEl.textContent='';nearestEl.replaceChildren();hintEl.textContent='Valitse sijainti klikkaamalla karttaa.';if(chosenMarker){map.removeLayer(chosenMarker);chosenMarker=null;}});
 try{const [response,metaResponse]=await Promise.all([fetch('./points.json'),fetch('./metadata.json')]);if(!response.ok)throw new Error('Asematiedostoa ei voitu ladata');const data=await response.json();if(!Array.isArray(data))throw new Error('Asematiedoston muoto on virheellinen');stations=data.map(s=>({...s,lat:Number(s.lat),lon:Number(s.lon)})).filter(s=>Number.isFinite(s.lat)&&Number.isFinite(s.lon)&&s.lat>=59&&s.lat<=71&&s.lon>=19&&s.lon<=32&&typeof s.stationName==='string'&&s.stationName.trim());draw();if(metaResponse.ok){const meta=await metaResponse.json();sourceDateEl.textContent='Tallennetun aineiston päivitysaika: '+(meta.snapshot_date||'tuntematon')+'.';}statusEl.textContent=stations.length?'':'Asemia ei löytynyt.';}
 catch(e){statusEl.textContent='Asematietojen lataus epäonnistui: '+e.message;countEl.textContent='Aineisto ei saatavilla';}
}
