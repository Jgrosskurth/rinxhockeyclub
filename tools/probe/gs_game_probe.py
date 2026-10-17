"""Temporary probe: dump a GameSheet game page (DOM text, role tables, JSON calls)."""
import json, sys, time
from playwright.sync_api import sync_playwright

url = sys.argv[1]
calls = []
with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    ctx = b.new_context(user_agent=("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                                    "(KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36"),
                        viewport={"width": 1366, "height": 900}, locale="en-US")
    page = ctx.new_page()
    def on_resp(r):
        ct = r.headers.get("content-type", "")
        if "json" in ct:
            try:
                body = r.text()
            except Exception:
                body = ""
            calls.append({"url": r.url, "status": r.status, "body": body[:6000]})
    page.on("response", on_resp)
    def settle(u):
        page.goto(u, wait_until="domcontentloaded", timeout=90000)
        for _ in range(60):
            page.wait_for_timeout(2000)
            if "Just a moment" not in page.title():
                return True
        return False
    first = settle("https://gamesheetstats.com/seasons/16150/teams/573565/schedule")
    print("schedule cleared:", first, page.title(), file=sys.stderr)
    links = page.evaluate("() => [...document.querySelectorAll('a[href*=\"/games/\"]')].map((a) => a.href).slice(0, 10)")
    print("game links:", links, file=sys.stderr)
    sched_calls = list(calls)
    sched_html = page.content()
    calls.clear()
    gid = url.rstrip("/").split("/")[-1]
    page.click(f'a[href*="/games/{gid}"]')
    for _ in range(20):
        page.wait_for_timeout(1500)
        if f"/games/{gid}" in page.url and "Just a moment" not in page.title():
            break
    page.wait_for_timeout(8000)
    print("after click:", page.url, page.title(), file=sys.stderr)
    out = {
        "title": page.title(),
        "text": page.evaluate("() => document.body.innerText")[:12000],
        "tables": page.evaluate("""() => [...document.querySelectorAll('[role=table], table')].map((t) => ({
            heads: [...t.querySelectorAll('[role=columnheader], th')].map((h) => h.innerText.trim()),
            rows: [...t.querySelectorAll('[role=row], tr')].slice(0, 40).map((r) => [...r.querySelectorAll('[role=cell], td')].map((c) => c.innerText.trim()))
        }))"""),
        "headings": page.evaluate("() => [...document.querySelectorAll('h1,h2,h3,h4,h5')].map((h) => h.tagName + ': ' + h.innerText.trim()).slice(0, 60)"),
        "calls": calls,
        "sched_calls": sched_calls,
        "sched_scripts": [m for m in __import__("re").findall(r'(?:src|href)="([^"]+)"', sched_html) if "_next" in m or "api" in m][:60],
        "sched_html_head": sched_html[:4000],
        "sched_next_data": (sched_html.split('id="__NEXT_DATA__"')[1][:6000] if '__NEXT_DATA__' in sched_html else ''),
    }
    b.close()
print(json.dumps(out, indent=1))
