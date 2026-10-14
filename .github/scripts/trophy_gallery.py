"""Build the Trophy Room banners and photo galleries.

Per team (10U, 14U), from images uploaded to GitHub:
- images/trophyroom-<team>/*          -> championship banners, shown in one
  horizontal line in upload order (a new banner is added at the end). The
  file name is the caption: "RINX 2025 LIAHL Champions Banner.png" reads
  "RINX 2025 LIAHL Champions".
- images/trophyroom-<team>/gallery/*  -> gallery photos, newest first.
  Each photo is tagged for the gallery's filters: by event when it sits in a
  sub-folder named after it ("gallery/2026 Mid-Atlantic Fall Showcase/x.jpg"),
  otherwise by the month and year it was taken (from the photo's EXIF date;
  photos saved from Instagram or texts often have none, and stay untagged).

Each image gets WebP web copies under images/trophy-room/<team>/ (banners:
600px wide; photos: 400px and 800px grid thumbnails + 1600px full view), listed in
data/trophy-room.json for the trophy-room block. Copies whose original was
deleted are removed. Images uploaded into images/trophy-room/<team>/ by
mistake (it's the generated folder) are moved to the matching upload folder
first. Run by .github/workflows/trophy-gallery.yml.
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
    'gallery': ('gallery', {'small': 400, 'thumb': 800, 'full': 1600}, True),
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


def taken_at(src):
    """'2026-10-11T14:06:32' from the photo's EXIF capture date, or ''."""
    raw = ''
    if Image:
        try:
            with Image.open(src) as im:
                exif = im.getexif()
                sub = exif.get_ifd(0x8769)  # Exif IFD: DateTimeOriginal / DateTimeDigitized
                raw = sub.get(36867) or sub.get(36868) or exif.get(306) or ''
        except Exception:
            raw = ''
    else:
        raw = subprocess.run(['identify', '-format', '%[EXIF:DateTimeOriginal]|%[EXIF:DateTime]', f'{src}[0]'],
                             capture_output=True, text=True, check=False).stdout
        raw = next((part for part in raw.split('|') if part.strip()), '')
    m = re.match(r'\s*(\d{4})[:-](\d{2})[:-](\d{2})[ T](\d{2}):(\d{2}):(\d{2})', str(raw))
    if not m or not 1990 <= int(m[1]) <= 2100 or not 1 <= int(m[2]) <= 12:
        return ''
    return f'{m[1]}-{m[2]}-{m[3]}T{m[4]}:{m[5]}:{m[6]}'


def event_of(src, src_dir):
    """Event name from the gallery sub-folder a photo sits in, or ''."""
    parts = src.relative_to(src_dir).parts
    if len(parts) < 2:
        return ''
    name = parts[0].strip()
    name = name.replace('_', ' ') if ' ' in name else re.sub(r'[-_]+', ' ', name)
    return re.sub(r'\s+', ' ', name).strip()


MONTH_NAMES = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august',
               'september', 'october', 'november', 'december']


# When events happened, for photos that carry no EXIF date (saved from texts or
# social apps). Keyed by event folder name; a folder named with its month
# ("March 2026 States") needs no entry.
EVENT_MONTHS = {
    '2026 Mid-Atlantic Fall Classic': '2026-10',  # GameSheet games Oct 9-11, 2026
    '2026 NYSAHA Championship': '2026-03',         # per the club
}


def event_date(event):
    """When an event happened: 'YYYY-MM' from EVENT_MONTHS or a month named in
    the folder ('March 2026 States'), 'YYYY' from a year alone ('2026 Cup'),
    '' otherwise. Dates photos with no EXIF date and orders the filters."""
    if not event:
        return ''
    known = next((v for k, v in EVENT_MONTHS.items() if k.lower() == event.lower()), '')
    if known:
        return known
    year = re.search(r'\b(19|20)\d{2}\b', event)
    if not year:
        return ''
    # Whole month names or their usual short forms ("Mar", "Sept"), not words
    # that merely start with them ("Marlins Classic").
    month = next((i + 1 for i, m in enumerate(MONTH_NAMES)
                  if re.search(rf'\b(?:{m}|{m[:3]}|sept)\b' if m == 'september'
                               else rf'\b(?:{m}|{m[:3]})\b', event, re.I)), 0)
    return f'{year[0]}-{month:02d}' if month else year[0]


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


# Web copies this script writes: "<slug>-<10-char hash>-<width>.webp".
GENERATED = re.compile(r'-[0-9a-f]{10}-\d+\.webp$')


def rescue_misplaced():
    """Move uploads that landed in a generated folder into the upload folder."""
    for team in TEAMS:
        for kind, (folder, _, _) in KINDS.items():
            out_dir = OUTPUT / team / kind
            if not out_dir.is_dir():
                continue
            dest = ROOT / 'images' / f'trophyroom-{team}' / folder
            for f in sorted(out_dir.iterdir()):
                if not f.is_file() or f.suffix.lower() not in EXTENSIONS or GENERATED.search(f.name):
                    continue
                dest.mkdir(parents=True, exist_ok=True)
                target = dest / f.name
                n = 2
                while target.exists():
                    target = dest / f'{f.stem}-{n}{f.suffix}'
                    n += 1
                # git mv keeps the upload's history, so its date still sorts it.
                moved = subprocess.run(['git', 'mv', str(f), str(target)], cwd=ROOT,
                                       capture_output=True, check=False).returncode == 0
                if not moved:
                    f.rename(target)
                print(f'moved {f.relative_to(ROOT)} to {target.relative_to(ROOT)}')


def build(team, label, kind, previous):
    folder, sizes, newest_first = KINDS[kind]
    src_dir = ROOT / 'images' / f'trophyroom-{team}' / folder
    out_dir = OUTPUT / team / kind
    out_dir.mkdir(parents=True, exist_ok=True)
    known = {p['source']: p for p in previous}
    items, keep = [], set()
    # Gallery photos may sit in event sub-folders; banners are top level only.
    pattern = '**/*' if kind == 'gallery' else '*'
    sources = sorted(p for p in src_dir.glob(pattern) if p.is_file() and p.suffix.lower() in EXTENSIONS)
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
            item['event'] = event_of(src, src_dir)
            item['taken'] = taken_at(src)
            item['eventDate'] = event_date(item['event'])
        item['added'] = added_at(src)
        items.append(item)
    for stale in out_dir.glob('*.webp'):
        if stale.name not in keep:
            stale.unlink()
            print(f'removed {stale.relative_to(ROOT)}')
    items.sort(key=lambda p: (p.get('added') or '9999', p['source']), reverse=newest_first)
    return items


def main():
    rescue_misplaced()
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
