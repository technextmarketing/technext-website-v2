"""Generate favicons, a lighter Odoo badge, and the OG image from the brand PNGs.

    python _src/make_assets.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "assets" / "img"
BLUE = (49, 103, 202)
INK = (31, 31, 61)
BODY = (76, 76, 99)


def fit(im: Image.Image, w: int) -> Image.Image:
    r = w / im.width
    return im.resize((w, round(im.height * r)), Image.LANCZOS)


def trim(im: Image.Image) -> Image.Image:
    bbox = im.getchannel("A").getbbox()
    return im.crop(bbox) if bbox else im


def favicons():
    # the plane cut from the horizontal logo (see split_logo) is the favicon source
    icon = trim(Image.open(IMG / "logo-plane.png").convert("RGBA"))
    side = max(icon.size)
    pad = int(side * 0.08)
    canvas = Image.new("RGBA", (side + 2 * pad, side + 2 * pad), (0, 0, 0, 0))
    canvas.paste(icon, ((canvas.width - icon.width) // 2, (canvas.height - icon.height) // 2), icon)
    for name, size in (("favicon-32.png", 32), ("favicon-192.png", 192), ("apple-touch-icon.png", 180)):
        out = canvas.resize((size, size), Image.LANCZOS)
        if name == "apple-touch-icon.png":  # iOS wants an opaque square
            bg = Image.new("RGBA", out.size, (255, 255, 255, 255))
            bg.paste(out, (0, 0), out)
            out = bg
        out.save(IMG / name, optimize=True)


def badge():
    b = Image.open(IMG / "odoo-ready-partner.png").convert("RGBA")
    b = trim(b)
    if b.width > 900:
        fit(b, 900).save(IMG / "odoo-ready-partner.png", optimize=True)


def split_logo():
    """Cut the horizontal logo into plane + wordmark for the one-time intro animation."""
    src = Image.open(IMG / "logo-horizontal.png").convert("RGBA")
    a = src.getchannel("A")
    w = src.width
    # first fully transparent column after the plane starts the gap
    cols = [max(a.getpixel((x, y)) for y in range(src.height)) for x in range(w)]
    start = next(x for x in range(w) if cols[x] > 8)
    gap = next(x for x in range(start + 40, w) if cols[x] <= 8)
    text_start = next(x for x in range(gap, w) if cols[x] > 8)
    plane = trim(src.crop((0, 0, gap, src.height)))
    text = trim(src.crop((text_start, 0, w, src.height)))
    plane.save(IMG / "logo-plane.png", optimize=True)
    text.save(IMG / "logo-text.png", optimize=True)
    return plane.size, text.size


def split_letters():
    """Cut the wordmark into glyph groups (alpha-gap detection) for the letter-by-letter intro.
    Writes assets/img/letters/l<i>.png (full height, so vertical alignment is trivial) and
    _src/letters.json with each slice's x / width as fractions of the wordmark."""
    import json
    im = Image.open(IMG / "logo-text.png").convert("RGBA")
    a = im.getchannel("A")
    W, H = im.size
    px = a.load()
    cols = [any(px[x, y] > 8 for y in range(H)) for x in range(W)]
    groups, x = [], 0
    while x < W:
        if cols[x]:
            s = x
            while x < W and cols[x]:
                x += 1
            groups.append([s, x])
        else:
            x += 1
    # merge slivers (e.g. a detached dot) into the nearest neighbour
    merged = []
    for g in groups:
        if merged and (g[1] - g[0] < 12 or g[0] - merged[-1][1] < 3):
            merged[-1][1] = g[1]
        else:
            merged.append(g)
    out = IMG / "letters"
    out.mkdir(exist_ok=True)
    for old in out.glob("*.png"):
        old.unlink()
    meta = {"w": W, "h": H, "letters": []}
    for i, (s, e) in enumerate(merged):
        im.crop((s, 0, e, H)).save(out / f"l{i}.png", optimize=True)
        meta["letters"].append({"x": round(s / W, 4), "w": round((e - s) / W, 4)})
    (Path(__file__).resolve().parent / "letters.json").write_text(json.dumps(meta), encoding="utf-8")
    return len(merged), [(e - s) for s, e in merged]


def font(size: int, bold=False):
    for name in (("segoeuib.ttf" if bold else "segoeui.ttf"), ("arialbd.ttf" if bold else "arial.ttf")):
        p = Path(r"C:\Windows\Fonts") / name
        if p.exists():
            return ImageFont.truetype(str(p), size)
    return ImageFont.load_default()


def og():
    W, H = 1200, 630
    im = Image.new("RGB", (W, H), (255, 255, 255))
    d = ImageDraw.Draw(im)
    # soft blue wash, bottom-right
    wash = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    wd = ImageDraw.Draw(wash)
    wd.ellipse((700, 250, 1500, 1000), fill=(234, 240, 251, 255))
    im.paste(wash, (0, 0), wash)
    d = ImageDraw.Draw(im)
    logo = fit(Image.open(IMG / "logo-horizontal.png").convert("RGBA"), 360)
    im.paste(logo, (80, 80), logo)
    d.text((80, 220), "Odoo ERP for growing companies.", font=font(58, True), fill=INK)
    d.text((80, 300), "Accounting · Sales · Inventory", font=font(40), fill=BLUE)
    d.text((80, 380), "Implemented by an Odoo Ready Partner in Singapore.", font=font(30), fill=BODY)
    bdg = fit(Image.open(IMG / "odoo-ready-partner.png").convert("RGBA"), 300)
    im.paste(bdg, (W - bdg.width - 80, H - bdg.height - 70), bdg)
    d.rectangle((0, H - 8, W, H), fill=BLUE)
    im.save(IMG / "og-image.png", optimize=True)


if __name__ == "__main__":
    import sys
    if "--intro-only" in sys.argv:
        print("plane, text =", split_logo())
        print("letters =", split_letters())
        sys.exit()
    print("plane, text =", split_logo())
    print("letters =", split_letters())
    favicons()
    badge()
    og()
    for p in sorted(IMG.glob("*.png")):
        print(f"{p.name:28} {p.stat().st_size // 1024:5d} KB")
