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

pattern = re.compile(r'(?<="page_pv":)\d+')


def getClicks(url):
    # 不蒜子偶尔会返回 400 或者半截响应，重试几次；始终失败则返回 None，
    # 交给调用方回退到上一次的数值，避免整个 workflow 挂掉。
    for _ in range(3):
        try:
            res = s.get("https://busuanzi.ibruce.info/busuanzi?jsonpCallback=callback", timeout=10, headers={
                "Referer": url,
                "Cookie": "busuanziId=ranking"
            })
            match = pattern.search(res.text)
            if match:
                return int(match.group())
        except requests.RequestException:
            pass
    return None


# 上一次的结果，用作单个 URL 抓取失败时的回退值
previous = {}
try:
    with open("data/clicks.yml", "r") as old:
        for page in (yaml.safe_load(old) or {}).get("pages", []):
            previous[page["url"]] = page["clicks"]
except IOError:
    pass

failed = 0

with open("public/sitemap.xml", "r") as sitemap:
    urls = re.compile(r'(?<=<loc>).+?(?=</loc>)').findall(sitemap.read())
    for url in urls:
        clicks = getClicks(url)
        if clicks is None:
            failed += 1
            if url not in previous:
                print("skip (抓取失败且无历史值)", url)
                continue
            clicks = previous[url]
            print(clicks, url, "(回退到上一次的数值)")
        else:
            print(clicks, url)
        data["pages"].append({"url": url, "clicks": clicks})

print("共 %d 个 URL，其中 %d 个抓取失败" % (len(urls), failed))

data["pages"].sort(key=lambda k: k["clicks"], reverse=True)

with open("data/clicks.yml", "w") as clicks:
    yaml.dump(data, clicks)
