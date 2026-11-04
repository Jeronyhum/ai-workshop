"""Mark delivered design assets as ready. Run from archive/ after dropping files into assets/:  python3 tools/assets.py
Scans assets/ for the slot files named in js/assets.js (dots-*.jpg, muse-*.jpg, and v4's dots2-*.jpg, muse2-*.jpg) and rewrites the READY list there.
Slots without a file keep using their generated fallback. Prints what is ready and what still falls back."""
import pathlib, re
ARC = pathlib.Path(__file__).resolve().parent.parent
js = (ARC / "js/assets.js").read_text(encoding="utf-8")
slots = dict(re.findall(r'"((?:dots|muse)2?-[a-z-]+)":\s*\{\s*file:\s*"([^"]+)"', js))
ready = [k for k, f in slots.items() if (ARC / f).exists()]
js = re.sub(r"(/\* READY:start[^\n]*\n).*?(\n\s*/\* READY:end \*/)", lambda m: m.group(1) + f"  AR.assetsReady = {ready!r};".replace("'", '"') + m.group(2), js, flags=re.S)
(ARC / "js/assets.js").write_text(js, encoding="utf-8")
for k, f in slots.items(): print(("ready    " if k in ready else "fallback ") + k + "  " + f)
