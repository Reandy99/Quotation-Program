#!/usr/bin/env python3
import os, sys, json, base64
from datetime import datetime, timezone
import urllib.request
import urllib.parse

BASE='https://api.repliz.com'

def iso(dt:datetime)->str:
    return dt.astimezone(timezone.utc).isoformat().replace('+00:00','Z')

def parse_iso(s:str)->datetime:
    # Example: 2026-05-31T06:05:00.000Z
    if s.endswith('Z'):
        s=s[:-1]+'+00:00'
    return datetime.fromisoformat(s)

def wib_date(iso_str:str)->str:
    d=parse_iso(iso_str)
    # WIB UTC+7
    w=d.astimezone(timezone.utc)
    w=datetime.fromtimestamp(w.timestamp()+7*3600, tz=timezone.utc)
    return w.strftime('%Y-%m-%d')

def req(path, params=None):
    ak=os.environ.get('REPLIZ_ACCESS_KEY')
    sk=os.environ.get('REPLIZ_SECRET_KEY')
    if not ak or not sk:
        raise SystemExit('Missing REPLIZ_ACCESS_KEY/REPLIZ_SECRET_KEY')
    url=BASE+path
    if params:
        url += '?' + urllib.parse.urlencode(params, doseq=True)
    auth=base64.b64encode(f'{ak}:{sk}'.encode()).decode()
    r=urllib.request.Request(url, headers={'Authorization': 'Basic '+auth})
    with urllib.request.urlopen(r, timeout=30) as resp:
        data=resp.read().decode('utf-8')
        return json.loads(data)

def get_schedules_for_account(account_id:str, start_utc:datetime, end_utc:datetime):
    out=[]
    page=1
    limit=100
    while True:
        j=req('/public/schedule', params={'page':page,'limit':limit,'accountIds[]':account_id})
        docs=j.get('docs') or []
        if not docs:
            break
        for s in docs:
            sa=s.get('scheduleAt')
            if not sa:
                continue
            d=parse_iso(sa)
            if start_utc <= d <= end_utc:
                out.append(s)
        # early stop if last is older than start (assumes desc order)
        last=docs[-1]
        if last.get('scheduleAt'):
            ld=parse_iso(last['scheduleAt'])
            if ld < start_utc:
                break
        if len(docs) < limit:
            break
        page += 1
    return out


def summarize(s):
    desc=(s.get('description') or '').replace('\r\n','\n').strip()
    medias=s.get('medias') or []
    hashtags=sum(1 for token in desc.split() if token.startswith('#'))
    return {
        'scheduleId': s.get('_id') or s.get('id'),
        'scheduleAt': s.get('scheduleAt'),
        'dateWIB': wib_date(s.get('scheduleAt')) if s.get('scheduleAt') else None,
        'status': s.get('status'),
        'type': s.get('type'),
        'mediaCount': len(medias),
        'mediaUrls': [m.get('url') or m.get('thumbnail') for m in medias if isinstance(m,dict)],
        'caption': desc,
        'captionLen': len(desc),
        'hashtags': hashtags,
        'repliesCount': len(s.get('replies') or [])
    }


def main():
    if len(sys.argv) < 5:
        print('usage: repliz_export_schedules.py <accountId> <startUtcIso> <endUtcIso> <out.json>')
        sys.exit(1)
    acc=sys.argv[1]
    start=parse_iso(sys.argv[2])
    end=parse_iso(sys.argv[3])
    out_path=sys.argv[4]
    items=get_schedules_for_account(acc,start,end)
    items_sorted=sorted(items, key=lambda x: x.get('scheduleAt') or '')
    summary=[summarize(s) for s in items_sorted]
    json.dump({'accountId':acc,'rangeUTC':{'start':iso(start),'end':iso(end)},'count':len(summary),'items':summary}, open(out_path,'w'), ensure_ascii=False, indent=2)
    print('wrote',out_path,'count',len(summary))

if __name__=='__main__':
    main()
