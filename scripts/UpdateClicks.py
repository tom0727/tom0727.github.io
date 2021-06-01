import requests
import yaml
import re
from datetime import datetime
from requests.adapters import HTTPAdapter

data = {
    "date": str(datetime.now()),
    "pages": []
}

s = requests.Session()
s.mount('https://', HTTPAdapter(max_retries=5))


def getClicks(url):
    res = s.get("https://busuanzi.ibruce.info/busuanzi?jsonpCallback=callback", timeout=5, headers={
        "Referer": url,
        "Cookie": "busuanziId=ranking"
    })
    return int(re.compile(r'(?<="page_pv":)\d+').search(res.text).group())


with open("public/sitemap.xml", "r") as sitemap:
    urls = re.compile(r'(?<=<loc>).+?(?=</loc>)').findall(sitemap.read())
    for url in urls:
        clicks = getClicks(url) + getClicks(url.replace("https://tom0727.github.io", "https://tom0727.gitee.io"))
        print(clicks, url)
        data["pages"].append({"url": url, "clicks": clicks})

data["pages"].sort(key=lambda k: k["clicks"], reverse=True)

with open("data/clicks.yml", "w") as clicks:
    yaml.dump(data, clicks)
