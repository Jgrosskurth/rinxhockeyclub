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
    page.goto(url, wait_until="domcontentloaded", timeout=60000)
    for _ in range(30):
        page.wait_for_timeout(2000)
        if "Just a moment" not in page.title():
            break
    page.wait_for_timeout(8000)
    out = {
        "title": page.title(),
        "text": page.evaluate("() => document.body.innerText")[:12000],
        "tables": page.evaluate("""() => [...document.querySelectorAll('[role=table], table')].map((t) => ({
            heads: [...t.querySelectorAll('[role=columnheader], th')].map((h) => h.innerText.trim()),
            rows: [...t.querySelectorAll('[role=row], tr')].slice(0, 40).map((r) => [...r.querySelectorAll('[role=cell], td')].map((c) => c.innerText.trim()))
        }))"""),
        "headings": page.evaluate("() => [...document.querySelectorAll('h1,h2,h3,h4,h5')].map((h) => h.tagName + ': ' + h.innerText.trim()).slice(0, 60)"),
        "calls": calls,
    }
    b.close()
print(json.dumps(out, indent=1))
