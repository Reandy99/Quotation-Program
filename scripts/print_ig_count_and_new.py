import json
import sys
p = sys.argv[1]
with open(p) as f:
    d = json.load(f)
print('count', d.get('count'))
for it in d.get('items', []):
    if str(it.get('wib','')).endswith('10:30'):
        hero = it.get('hero')
        if isinstance(hero, dict):
            hero = hero.get('url')
        print(it.get('wib'), it.get('id'), hero)
