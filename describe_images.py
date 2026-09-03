import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def search(q):
    req = urllib.request.Request(
        f"https://unsplash.com/napi/search/photos?query={urllib.parse.quote(q)}&per_page=10",
        headers={'User-Agent': 'Mozilla/5.0'}
    )
    try:
        html = urllib.request.urlopen(req, context=ctx).read()
        data = json.loads(html)
        print(f"--- {q} ---")
        for res in data['results']:
            print(f"ID: {res['id']}, ALT: {res.get('alt_description')}")
    except Exception as e:
        print(f"Error: {e}")

search('interior concrete shadows architecture')
search('apartment concrete shadows')
