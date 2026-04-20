import json, os, re
USED_PATH='/root/.openclaw/workspace/state/whitepaper/repliz-used-media-may.json'
MEDIA_DIR='/var/www/ocindonesia/media/whitepaper'
HOST='http://43.156.181.204'

used=set(json.load(open(USED_PATH))['usedMedia'])
files=[f for f in os.listdir(MEDIA_DIR) if re.search(r'\.(jpg|jpeg|png)$', f, re.I)]
urls=[f"{HOST}/media/whitepaper/{f}" for f in sorted(files)]
unused=[u for u in urls if u not in used]
print('total_files', len(files))
print('unused', len(unused))
for u in unused[:60]:
    print(u)
