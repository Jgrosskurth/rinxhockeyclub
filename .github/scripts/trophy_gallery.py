"""Build the Trophy Room banners and photo galleries.

Per team (10U, 14U), from images uploaded to GitHub:
- images/trophyroom-<team>/*          -> championship banners, shown in one
  horizontal line in upload order (a new banner is added at the end). The
  file name is the caption: "RINX 2025 LIAHL Champions Banner.png" reads
  "RINX 2025 LIAHL Champions".
- images/trophyroom-<team>/gallery/*  -> gallery photos, newest first.

Each image gets WebP web copies under images/trophy-room/<team>/ (banners:
600px wide; photos: 800px grid thumbnail + 1600px full view), listed in
data/trophy-room.json for the trophy-room block. Copies whose original was
deleted are removed. Run by .github/workflows/trophy-gallery.yml.
"""

import hashlib
import json
import re
import subprocess
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:  # local runs without Pillow fall back to ImageMagick
    Image = None
else:
    try:  # iPhone photos
        from pillow_heif import register_heif_opener
        register_heif_opener()
    except ImportError:
        pass

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / 'images' / 'trophy-room'
MANIFEST = ROOT / 'data' / 'trophy-room.json'
TEAMS = {'10u': '10U Squirts', '14u': '14U Bantam'}
KINDS = {
    # kind: (folder under images/trophyroom-<team>/, sizes, newest first?)
    'banners': ('', {'full': 600}, False),
    'gallery': ('gallery', {'thumb': 800, 'full': 1600}, True),
}
EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'}
# Names that say nothing: camera files ("IMG_1234 2"), numbers ("10"),
# uploads from DA ("media_1b11bc66...").
MEANINGLESS = re.compile(
    r'^((img|pxl|dsc|dscn|dcim|photo|image|screenshot)[\W_]*)?[\d\W_]*$|^media_[0-9a-f]+$', re.I)


def slug(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-') or 'image'


def words(stem):
    """'RINX 2025 LIAHL Champions Banner' -> 'RINX 2025 LIAHL Champions'; '' if meaningless."""
    if MEANINGLESS.match(stem):
        return ''
    # "trophy-lift" -> "trophy lift", but names with spaces keep their
    # hyphens ("Mid-Atlantic").
    text = stem.replace('_', ' ') if ' ' in stem else re.sub(r'[-_]+', ' ', stem)
    text = re.sub(r'\s+banner$', '', text, flags=re.I).strip()
    # A single short code-like word ("midatl2") isn't a description either.
    if len(re.findall(r'[A-Za-z]{3,}', text)) < 2:
        return ''
    return text[0].upper() + text[1:]


def added_at(path):
    """ISO date the image was first committed (follows renames)."""
    out = subprocess.run(
        ['git', 'log', '--diff-filter=A', '--follow', '--format=%cI', '--', str(path)],
        cwd=ROOT, capture_output=True, text=True, check=False,
    ).stdout.split()
    return out[-1] if out else ''


def make_copies(src, files, sizes):
    """Write a WebP per size (never upscaled); returns {key: (width, height)}."""
    dims = {}
    if Image:
        with Image.open(src) as im:
            im = ImageOps.exif_transpose(im)
            im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB')
            for key, width in sizes.items():
                copy = im.copy()
                if copy.width > width:
                    copy = copy.resize((width, round(copy.height * width / copy.width)), Image.LANCZOS)
                copy.save(files[key], 'WEBP', quality=80, method=6)
                dims[key] = copy.size
        return dims
    for key, width in sizes.items():
        subprocess.run(['convert', str(src), '-auto-orient', '-resize', f'{width}x>', '-strip',
                        '-quality', '80', str(files[key])], check=True)
        w, h = subprocess.run(['identify', '-format', '%w %h', str(files[key])],
                              capture_output=True, text=True, check=True).stdout.split()
        dims[key] = (int(w), int(h))
    return dims


def build(team, label, kind, previous):
    folder, sizes, newest_first = KINDS[kind]
    src_dir = ROOT / 'images' / f'trophyroom-{team}' / folder
    out_dir = OUTPUT / team / kind
    out_dir.mkdir(parents=True, exist_ok=True)
    known = {p['source']: p for p in previous}
    items, keep = [], set()
    sources = sorted(p for p in src_dir.glob('*') if p.is_file() and p.suffix.lower() in EXTENSIONS)
    for src in sources:
        rel = src.relative_to(ROOT).as_posix()
        digest = hashlib.sha1(src.read_bytes()).hexdigest()[:10]
        name = f'{slug(src.stem)}-{digest}'
        files = {k: out_dir / f'{name}-{w}.webp' for k, w in sizes.items()}
        keep.update(f.name for f in files.values())
        old = known.get(rel)
        if old and old.get('hash') == digest and all(f.exists() for f in files.values()):
            item = dict(old)  # same image: reuse its copies, refresh the text
        else:
            dims = make_copies(src, files, sizes)
            item = {'source': rel, 'hash': digest}
            for key, f in files.items():
                item[key] = '/' + f.relative_to(ROOT).as_posix()
            item['width'], item['height'] = dims['full']
            if 'thumb' in dims:
                item['thumbWidth'], item['thumbHeight'] = dims['thumb']
            print(f'built {rel}')
        title = words(src.stem)
        if kind == 'banners':
            item['title'] = title
            item['alt'] = f'{title} banner' if title else f'Rinx {label} championship banner'
        else:
            item['alt'] = title or f'Rinx {label} photo'
        item['added'] = added_at(src)
        items.append(item)
    for stale in out_dir.glob('*.webp'):
        if stale.name not in keep:
            stale.unlink()
            print(f'removed {stale.relative_to(ROOT)}')
    items.sort(key=lambda p: (p.get('added') or '9999', p['source']), reverse=newest_first)
    return items


def main():
    previous = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
    manifest = {}
    for team, label in TEAMS.items():
        prev = previous.get(team)
        prev = prev if isinstance(prev, dict) else {}
        manifest[team] = {kind: build(team, label, kind, prev.get(kind, [])) for kind in KINDS}
    MANIFEST.write_text(json.dumps(manifest, indent=2) + '\n')
    print(', '.join(f'{t}: {len(m["banners"])} banners, {len(m["gallery"])} photos'
                    for t, m in manifest.items()))


if __name__ == '__main__':
    main()
