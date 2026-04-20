import json, sys
p=sys.argv[1]
d=json.load(open(p))
any_dups=d['duplicates']['anyMedia']
hero_dups=d['duplicates']['heroMedia']
print('any_dup_urls', len(any_dups))
print('hero_dup_urls', len(hero_dups))
print('any_replace_needed', sum(x['count']-1 for x in any_dups))
print('hero_replace_needed', sum(x['count']-1 for x in hero_dups))
