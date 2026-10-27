#!/usr/bin/env python3
"""Detect source changes; never change clinical rules or claim clinical approval.
Usage: python scripts/monitor-sources.py [--accept-baseline]
Review report and snapshot before committing an explicitly accepted baseline.
"""
import argparse, hashlib, json, re, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.skip=0; self.words=[]; self.pdfs=[]
    def handle_starttag(self,tag,attrs):
        if tag in ('script','style'): self.skip+=1
        if tag=='a':
            href=dict(attrs).get('href','')
            if urllib.parse.urlparse(href).path.lower().endswith('.pdf'):self.pdfs.append(href)
    def handle_endtag(self,tag):
        if tag in ('script','style'):self.skip=max(0,self.skip-1)
    def handle_data(self,data):
        if not self.skip:self.words.append(data)
def allowed(url):
    p=urllib.parse.urlparse(url); h=p.hostname or ''
    return p.scheme=='https' and any(h==d or h.endswith('.'+d) for d in ('gov.uk','nhs.uk'))
def fetch(url):
    if not allowed(url):raise ValueError('Source is outside the approved NHS/GOV.UK hosts')
    req=urllib.request.Request(url,headers={'User-Agent':'Vaccs-source-review/0.2 (+independent prototype)'})
    with urllib.request.urlopen(req,timeout=25) as r:
        if not allowed(r.url):raise ValueError('Source redirected outside approved hosts')
        data=r.read(15_000_001)
        if len(data)>15_000_000:raise ValueError('Source exceeds 15 MB limit')
        return data,r.headers.get('Content-Type','')
def check(source):
    item={'id':source['id'],'url':source['url']}
    try:
        raw,typ=fetch(source['url'])
        page=Page();page.feed(raw.decode('utf-8',errors='replace'))
        normal=re.sub(r'\s+',' ',' '.join(page.words)).strip()
        pdfs={}
        for link in sorted(set(page.pdfs)):
            url=urllib.parse.urljoin(source['url'],link)
            if allowed(url):pdfs[url]=hashlib.sha256(fetch(url)[0]).hexdigest()
        item.update(sha256=hashlib.sha256(normal.encode()).hexdigest(),pdfs=pdfs)
    except Exception as e:item['error']=str(e)
    return item
def main():
    ap=argparse.ArgumentParser();ap.add_argument('--accept-baseline',action='store_true');args=ap.parse_args()
    all_sources=json.loads((ROOT/'dist/sources.json').read_text())['sources']
    paused={s['id'] for s in all_sources if s.get('paused')}  # tracker sources paused while the tracker is hidden
    sources=[s for s in all_sources if not s.get('paused')]
    baseline_path=ROOT/'sources-baseline.json'
    baseline=json.loads(baseline_path.read_text()) if baseline_path.exists() else {}
    with ThreadPoolExecutor(max_workers=4) as pool: observations=list(pool.map(check,sources))
    current={s['id']:s for s in observations}
    changes=[]
    for s in observations:
        old=baseline.get(s['id'])
        if 'error' in s:changes.append((s['id'],'Could not check: '+s['error']))
        elif not old:changes.append((s['id'],'No reviewed baseline — review before accepting'))
        elif old.get('sha256')!=s['sha256'] or old.get('pdfs')!=s['pdfs']:changes.append((s['id'],'Source text or linked PDF changed'))
    for key in baseline.keys()-current.keys()-paused:changes.append((key,'Removed from source register'))
    report=['# Vaccs source review', '', 'Checked: '+datetime.now(timezone.utc).isoformat(), '', '**Human review required. This report does not update clinical rules.**','']
    report += [f'- **{key}**: {reason}' for key,reason in changes] or ['No changes detected against the stored baseline.']
    report += ['', 'Review the official sources, record the interpretation and effective dates, add regression tests, and obtain clinical sign-off before releasing a rule change.']
    (ROOT/'source-review.md').write_text('\n'.join(report)+'\n')
    (ROOT/'source-snapshot.json').write_text(json.dumps(current,indent=2)+'\n')
    summary={'changes':len(changes),'errors':sum('error'in s for s in observations),'baselineAccepted':False}
    if args.accept_baseline:
        if summary['errors']:raise SystemExit('Cannot accept a baseline with source errors. See source-review.md.')
        baseline_path.write_text(json.dumps(current,indent=2)+'\n');summary['baselineAccepted']=True
    (ROOT/'source-status.json').write_text(json.dumps(summary)+'\n')
    print(json.dumps(summary))
if __name__=='__main__':main()
