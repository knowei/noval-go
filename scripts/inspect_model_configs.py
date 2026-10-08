import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
opener = urllib.request.build_opener(urllib.request.HTTPSHandler(context=ctx))
headers = {'User-Agent': 'Mozilla/5.0', 'Referer': 'https://genraton.xyz/', 'Origin': 'https://genraton.xyz'}

aids = [
    '972540eb-b794-48ba-b70c-f02c3c2e6a15',
    '77dfcc94-a3d6-4bbc-b15a-f79cc13b9b3a',
    'cd3b5fb0-3359-4f6b-bcf3-29736893fbd7',
    '1a1938d1-1b23-4df6-b7c4-f7feab1490dc',
    '22af6df6-f7a8-42fa-be59-33a5025ccbb2',
    'f2afa934-3f01-48f7-b7ee-fb7f4bcc5f15',
    '33c6daa7-b789-4f21-b655-391041021b44'
]

for aid in aids:
    url = f'https://genraton.xyz/go/api/apps/{aid}'
    try:
        req = urllib.request.Request(url, headers=headers)
        with opener.open(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            app = data.get('data', {}).get('apps', {})
            mc = app.get('model_config') or {}
            print(f"=== {aid} : {app.get('name')} ===")
            print("  mc keys:", list(mc.keys()))
            if 'pre_prompt' in mc:
                print("  pre_prompt len:", len(mc['pre_prompt']))
                print("  pre_prompt preview:", mc['pre_prompt'][:100].replace('\n', ' '))
            if 'opening_statement' in mc:
                print("  opening_statement:", mc['opening_statement'][:80].replace('\n', ' '))
            print()
    except Exception as e:
        print(f"Error {aid}: {e}")
