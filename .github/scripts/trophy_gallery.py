"""Build the Trophy Room photo galleries.

Photos dropped into trophy-room/10u/ or trophy-room/14u/ (jpg, png, webp,
heic) get two web copies under images/trophy-room/<team>/ -- an 800px-wide
grid thumbnail and a 1600px-wide full view, both WebP -- and are listed,
newest first, in data/trophy-room.json for the trophy-room block. Copies whose
original was deleted are removed. Run by .github/workflows/trophy-gallery.yml.
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
SOURCE = ROOT / 'trophy-room'
OUTPUT = ROOT / 'images' / 'trophy-room'
MANIFEST = ROOT / 'data' / 'trophy-room.json'
TEAMS = {'10u': '10U Squirts', '14u': '14U Bantam'}
SIZES = {'thumb': 800, 'full': 1600}
EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'}
# Camera-style names ("IMG_1234", "PXL_2026...", "DSC0042") say nothing useful.
CAMERA_NAME = re.compile(r'^(img|pxl|dsc|dscn|dcim|photo|image|screenshot)?[\W_]*[\d\W_]*$', re.I)


def slug(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-') or 'photo'


def alt_text(stem, label):
    words = re.sub(r'[-_]+', ' ', stem).strip()
    if CAMERA_NAME.match(stem) or not re.search(r'[a-zA-Z]{3}', words):
        return f'Rinx {label} photo'
    return words[0].upper() + words[1:]


def added_at(path):
    """ISO date the photo was first committed (falls back to file time)."""
    out = subprocess.run(
        ['git', 'log', '--diff-filter=A', '--follow', '--format=%cI', '--', str(path)],
        cwd=ROOT, capture_output=True, text=True, check=False,
    ).stdout.split()
    return out[-1] if out else ''


def make_copies(src, files):
    """Write a WebP per size (never upscaled); returns {key: (width, height)}."""
    dims = {}
    if Image:
        with Image.open(src) as im:
            im = ImageOps.exif_transpose(im).convert('RGB')
            for key, width in SIZES.items():
                copy = im.copy()
                if copy.width > width:
                    copy = copy.resize((width, round(copy.height * width / copy.width)), Image.LANCZOS)
                copy.save(files[key], 'WEBP', quality=80, method=6)
                dims[key] = copy.size
        return dims
    for key, width in SIZES.items():
        subprocess.run(['convert', str(src), '-auto-orient', '-resize', f'{width}x>', '-strip',
                        '-quality', '80', str(files[key])], check=True)
        w, h = subprocess.run(['identify', '-format', '%w %h', str(files[key])],
                              capture_output=True, text=True, check=True).stdout.split()
        dims[key] = (int(w), int(h))
    return dims


def build_team(team, label, previous):
    src_dir = SOURCE / team
    out_dir = OUTPUT / team
    out_dir.mkdir(parents=True, exist_ok=True)
    known = {p['source']: p for p in previous}
    photos, keep = [], set()
    for src in sorted(p for p in src_dir.glob('*') if p.suffix.lower() in EXTENSIONS):
        rel = src.relative_to(ROOT).as_posix()
        digest = hashlib.sha1(src.read_bytes()).hexdigest()[:10]
        name = f'{slug(src.stem)}-{digest}'
        files = {k: out_dir / f'{name}-{w}.webp' for k, w in SIZES.items()}
        keep.update(f.name for f in files.values())
        old = known.get(rel)
        if old and old.get('hash') == digest and all(f.exists() for f in files.values()):
            photos.append(old)
            continue
        dims = make_copies(src, files)
        photos.append({
            'source': rel,
            'hash': digest,
            'thumb': '/' + files['thumb'].relative_to(ROOT).as_posix(),
            'full': '/' + files['full'].relative_to(ROOT).as_posix(),
            'thumbWidth': dims['thumb'][0],
            'thumbHeight': dims['thumb'][1],
            'width': dims['full'][0],
            'height': dims['full'][1],
            'alt': alt_text(src.stem, label),
            'added': added_at(src),
        })
        print(f'built {rel}')
    for stale in out_dir.glob('*.webp'):
        if stale.name not in keep:
            stale.unlink()
            print(f'removed {stale.relative_to(ROOT)}')
    photos.sort(key=lambda p: (p.get('added') or '', p['source']), reverse=True)
    return photos


def main():
    previous = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
    manifest = {team: build_team(team, label, previous.get(team, [])) for team, label in TEAMS.items()}
    MANIFEST.write_text(json.dumps(manifest, indent=2) + '\n')
    print(', '.join(f'{t}: {len(p)} photos' for t, p in manifest.items()))


if __name__ == '__main__':
    main()
