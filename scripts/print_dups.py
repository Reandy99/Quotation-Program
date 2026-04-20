import json, sys
p=sys.argv[1]
d=json.load(open(p))
print('dupAny', d['totals']['duplicateAnyMediaCount'], 'dupHero', d['totals']['duplicateHeroMediaCount'])
print('\nHERO DUPLICATES:')
for x in d['duplicates']['heroMedia'][:20]:
    print(x['count'], x['media'])
    for occ in x['occurrences']:
        print(' ', occ['account'], occ['wib'], occ['scheduleId'], 'idx', occ['mediaIndex'])
    print('')
print('\nTOP ANY DUPLICATES:')
for x in d['duplicates']['anyMedia'][:10]:
    print(x['count'], x['media'])
PY