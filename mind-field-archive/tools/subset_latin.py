"""v6: subset the Latin fonts (Archivo, JetBrains Mono, Inter) to what this archive draws, as WOFF2. Run from archive/:  python3 tools/subset_latin.py
Archivo (numerals and the word-mark) keeps its width and weight axes but only over the range the CSS uses
(wdth 62–100, wght 400–900). JetBrains Mono keeps its whole weight axis (instancing it breaks its glyph names). Both keep every non-Hangul character found in
index.html and js/*.js, plus ASCII. Needs fontTools and brotli. Sources: the full TTFs, kept outside the served files
in tools/fonts-src/ (copied there on first run). Re-run after adding new symbols to the copy."""
import pathlib, shutil
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ARC = pathlib.Path(__file__).resolve().parent.parent
SRC = ARC / "tools/fonts-src"
SRC.mkdir(exist_ok=True)
text = "".join(p.read_text(encoding="utf-8") for p in [ARC / "index.html", *sorted((ARC / "js").glob("*.js"))])
chars = {c for c in text if not (0xAC00 <= ord(c) <= 0xD7A3 or 0x3130 <= ord(c) <= 0x318F)} | set(map(chr, range(0x20, 0x7F)))
unicodes = sorted(ord(c) for c in chars if ord(c) >= 0x20)
jobs = [("Archivo-Variable.ttf", "Archivo-subset.woff2", {"wdth": (62, 100), "wght": (400, 900)}),
        ("JetBrainsMono-Variable.ttf", "JetBrainsMono-subset.woff2", None),
        ("Inter-VariableFont_opsz,wght.ttf", "Inter-subset.woff2", None)]  # JetBrains and Inter: the instancer breaks their glyph names, so both keep their full axes
# v6 (t1193u): Inter 4.001 (OFL) replaces Instrument Serif: the Latin display face, a Helvetica-style grotesk. Upright only;
# it keeps its optical-size axis (14–32), so large titles get the tighter display cut automatically.
for src, dst, axes in jobs:
    s = SRC / src
    if not s.exists(): shutil.copy(ARC / "fonts" / src, s)  # Inter comes from the system copy (Inter 4.001), placed in fonts-src by hand
    font = TTFont(s)
    if axes: font = instancer.instantiateVariableFont(font, axes)
    opts = subset.Options(); opts.flavor = "woff2"; opts.layout_features = ["*"]; opts.name_IDs = ["*"]; opts.notdef_outline = True
    sub = subset.Subsetter(opts); sub.populate(unicodes=unicodes); sub.subset(font)
    subset.save_font(font, str(ARC / "fonts" / dst), opts)
    print(dst, (ARC / "fonts" / dst).stat().st_size, "bytes from", s.stat().st_size)
