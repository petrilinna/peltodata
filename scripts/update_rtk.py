#!/usr/bin/env python3
"""RTK2go weekly fetch. Two-step protocol: reserve -> fetch.
Never run fetch unless reserve was committed and pushed successfully.
No third-party dependencies, no retries, no redirects.
"""
import argparse
import datetime as dt
import json
import os
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
STATE = ROOT / 'rtk' / 'fetch-state.json'
POINTS = ROOT / 'rtk' / 'points.json'
META = ROOT / 'rtk' / 'metadata.json'
INTERVAL = dt.timedelta(days=7)
URL = 'http://rtk2go.com:2101/'
UTC = dt.timezone.utc

def now():
    return dt.datetime.now(UTC)

def stamp(value):
    return value.isoformat(timespec='seconds').replace('+00:00','Z')

def read_state():
    return json.loads(STATE.read_text(encoding='utf-8'))

def parse_stamp(value):
    if not value:
        return None
    parsed = dt.datetime.fromisoformat(value.replace('Z', '+00:00'))
    if parsed.tzinfo is None:
        raise ValueError('Aikaleimasta puuttuu aikavyohyke')
    return parsed.astimezone(UTC)

def reserve():
    state = read_state()
    previous = parse_stamp(state.get('last_attempt_utc'))
    current = now()
    if previous and current - previous < INTERVAL:
        print('SKIP: 7 vuorokautta ei ole kulunut edellisesta yrityksesta')
        return False
    state['last_attempt_utc'] = stamp(current)
    STATE.write_text(json.dumps(state, ensure_ascii=False, indent=2)+'\n',encoding='utf-8')
    print('RESERVED:', state['last_attempt_utc'])
    return True

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise RuntimeError('Uudelleenohjaus estetty')

def fetch():
    state = read_state()
    reserved = parse_stamp(state.get('last_attempt_utc'))
    if not reserved or not (dt.timedelta(0) <= now()-reserved < dt.timedelta(minutes=15)):
        raise RuntimeError('Tuoretta varausta ei ole: haku estetty')
    # The workflow MUST push the reservation to main before invoking fetch.
    opener = urllib.request.build_opener(NoRedirect())
    req = urllib.request.Request(URL, headers={'User-Agent':'Peltodata-RTKmap/1.0 (weekly snapshot)', 'Accept':'text/plain'})
    with opener.open(req, timeout=15) as response:
        if response.status != 200:
            raise RuntimeError('RTK2go HTTP '+str(response.status))
        raw = response.read(2_000_001)
    if len(raw)>2_000_000:
        raise RuntimeError('Vastaus liian suuri')
    text=raw.decode('latin-1',errors='replace')
    stations=[]
    for line in text.splitlines():
        if not line.startswith('STR;'):
            continue
        fields=line.split(';')
        if len(fields)<11 or fields[8].upper().strip()!='FIN':
            continue
        try:
            lat=float(fields[9]); lon=float(fields[10])
        except ValueError:
            continue
        name=fields[1].strip(); municipality=fields[2].strip()
        if not (59<=lat<=71 and 19<=lon<=32 and name):
            continue
        stations.append({'lat':lat,'lon':lon,'stationName':name,'municipality':municipality})
    stations=sorted({(s['stationName'],s['lat'],s['lon']):s for s in stations}.values(),key=lambda s:s['stationName'].casefold())
    if len(stations)<10:
        raise RuntimeError(f'Vain {len(stations)} kelvollista asemaa; vanha aineisto sailytetaan')
    # Only update files after all checks passed.
    meta=json.loads(META.read_text(encoding='utf-8'))
    meta['snapshot_date']=stamp(now())
    meta['last_success_utc']=meta['snapshot_date']
    meta['station_count']=len(stations)
    meta['live']=False
    meta['source']='RTK2go NTRIP sourcetable (FIN), weekly cached snapshot'
    meta['source_url']=URL
    meta.pop('excluded_invalid_locations',None)
    POINTS.write_text(json.dumps(stations,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    META.write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('UPDATED:',len(stations),'stations at',meta['snapshot_date'])

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('command',choices=['reserve','fetch'])
    args=parser.parse_args()
    if args.command=='reserve':
        if not reserve():
            raise SystemExit(10)
    else:
        fetch()
