"""Subset Gothic A1 to the characters this archive uses (copied from site/tools/subset_ko.py).

usage: python3 tools/subset_ko.py /path/to/GothicA1-Black.ttf fonts/GothicA1-Black-subset.woff [more src dst pairs]
       a .ttc source takes "#index", e.g. NotoSerifCJK-Bold.ttc#1 for the Korean face
Run from archive/. Re-run after editing Korean copy; missing glyphs fall back to the system font.
"""
import pathlib, sys
from fontTools import subset

site = pathlib.Path(__file__).resolve().parent.parent
text = "".join(p.read_text(encoding="utf-8") for p in [site / "index.html", *sorted((site / "js").glob("*.js"))])
chars = set(text) | set(map(chr, range(0x20, 0x7F))) | set("‘’“”·…–—×→←↔≠⊂●◐○⊘⟋✓◌")
unicodes = sorted(ord(c) for c in chars if ord(c) >= 0x20)
args = sys.argv[1:]
for src, dst in zip(args[0::2], args[1::2]):
    opts = subset.Options(); opts.flavor = "woff"; opts.layout_features = ["*"]; opts.name_IDs = ["*"]; opts.notdef_outline = True
    if "#" in src: src, idx = src.split("#"); opts.font_number = int(idx)  # "collection.ttc#1" picks one face
    font = subset.load_font(src, opts)
    sub = subset.Subsetter(opts); sub.populate(unicodes=unicodes); sub.subset(font)
    subset.save_font(font, str(site / dst), opts)
    print(dst, (site / dst).stat().st_size, "bytes,", len([u for u in unicodes if 0xAC00 <= u <= 0xD7A3]), "Hangul syllables")
