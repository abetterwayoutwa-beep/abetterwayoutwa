#!/usr/bin/env python3
"""Responsive image pipeline. Runs in CI before Jekyll (see .github/workflows/deploy.yml).

For every JPG/PNG under images/ (except images/favicon/), it writes resized WebP
copies to assets/img/ and records each image's size in _data/images.json, so the
templates can fill in width/height and srcset automatically. Neither output is
committed to git: only the original images live in the repo.

It also checks that every image referenced from _events/ exists, so a typo in an
image path fails the build instead of shipping a broken picture.

Usage:  python3 _tools/images.py          (from the repo root)
"""
import json
import os
import re
import sys
from urllib.parse import quote

from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = "images"
SKIP_DIRS = {"images/favicon"}
OUT_DIR = "assets/img"
DATA_FILE = "_data/images.json"
WIDTHS = [480, 720, 960, 1600]   # generated widths (never upscaled)
DEFAULT_WIDTH = 960         # the plain src= fallback
QUALITY = 80


def url_path(rel):
    """Repo path -> the URL path used in templates, e.g. /images/Q%26A.jpg"""
    return "/" + quote(rel.replace(os.sep, "/"))


def safe_stem(rel):
    stem = os.path.splitext(rel.replace(os.sep, "/"))[0][len(SRC_DIR) + 1:]
    return re.sub(r"[^A-Za-z0-9._/-]+", "-", stem)


def process(rel):
    src = os.path.join(ROOT, rel)
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)
        w, h = im.size
        if im.mode not in ("RGB", "RGBA"):
            im = im.convert("RGBA" if "transparency" in im.info or im.mode in ("LA", "P") else "RGB")
        widths = sorted({min(x, w) for x in WIDTHS})
        variants = []
        for vw in widths:
            vh = round(h * vw / w)
            out_rel = f"{OUT_DIR}/{safe_stem(rel)}-{vw}.webp"
            out = os.path.join(ROOT, out_rel)
            # The CI cache key is a hash of images/, so an existing file is up to date.
            # Locally, delete assets/img/ to force a full rebuild.
            if not os.path.exists(out):
                os.makedirs(os.path.dirname(out), exist_ok=True)
                im.resize((vw, vh), Image.LANCZOS).save(out, "WEBP", quality=QUALITY, method=4)
            variants.append({"w": vw, "src": "/" + out_rel})
    default = max((v for v in variants if v["w"] <= DEFAULT_WIDTH), key=lambda v: v["w"], default=variants[0])
    return {"width": w, "height": h, "variants": variants,
            "default": default["src"], "largest": variants[-1]["src"]}


def referenced_images():
    """Every /images/... path used in _events/*.html front matter."""
    refs = {}
    for f in sorted(os.listdir(os.path.join(ROOT, "_events"))):
        if f.startswith("_"):
            continue
        text = open(os.path.join(ROOT, "_events", f), encoding="utf-8").read()
        for m in re.finditer(r'^\s*-?\s*src:\s*"?([^"\n]+)"?', text, re.M):
            refs.setdefault(m.group(1).strip(), []).append(f"_events/{f}")
    return refs


def main():
    data = {}
    for dirpath, dirnames, files in os.walk(os.path.join(ROOT, SRC_DIR)):
        rel_dir = os.path.relpath(dirpath, ROOT).replace(os.sep, "/")
        dirnames[:] = [d for d in dirnames if f"{rel_dir}/{d}" not in SKIP_DIRS]
        for f in sorted(files):
            if f.lower().endswith((".jpg", ".jpeg", ".png")):
                rel = f"{rel_dir}/{f}"
                data[url_path(rel)] = process(rel)
    os.makedirs(os.path.join(ROOT, "_data"), exist_ok=True)
    with open(os.path.join(ROOT, DATA_FILE), "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=1, sort_keys=True)
    print(f"{len(data)} images -> {OUT_DIR}/ and {DATA_FILE}")

    missing = {p: where for p, where in referenced_images().items() if p not in data}
    for p, where in missing.items():
        print(f"::error file={where[0]}::Image not found: {p} (used in {', '.join(where)})")
    return 1 if missing else 0


if __name__ == "__main__":
    sys.exit(main())
