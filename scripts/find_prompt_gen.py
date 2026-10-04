import json
import re
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

import urllib.request
import json
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

import glob
import os
import re

pattern = os.path.expandvars(r'%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Local Storage\leveldb\*.ldb')
files = glob.glob(pattern)
print('Total ldb files:', len(files))

found = []
for f in files:
    try:
        with open(f, 'rb') as fp:
            content = fp.read()
        if b'genraton' in content or b'aiero' in content:
            print('Found domain in:', os.path.basename(f))
            for m in re.finditer(rb'Bearer\s+([a-zA-Z0-9_\-\.]{20,})', content):
                found.append(m.group(1).decode('ascii'))
            for m in re.finditer(rb'token[\'":\s]+([a-zA-Z0-9_\-\.]{30,})', content):
                found.append(m.group(1).decode('ascii'))
    except Exception:
        pass

jwt_tokens = [t for t in set(found) if t.startswith('eyJ')]
print('JWT tokens found:', len(jwt_tokens))

with open('scripts/card_c7c45e4d-6362-4b5b-b8ba-1f7dae288861.json', 'r', encoding='utf-8') as f:
    text = f.read()

import re
tags = set(re.findall(r'【([^】]{2,15})】', text))
print('Total bracket tags in JSON:', len(tags))
for t in sorted(tags):
    print(' ', t)







