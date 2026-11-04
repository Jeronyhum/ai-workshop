"""Measure the delivered design assets against their anchors in archive/asset-prompts-v2.md. Run from archive/:  python3 tools/anchors.py
Reads assets/muse2-*.jpg and assets/dots2-*.jpg (never writes there), finds the geometry each prompt fixed (a centre,
a radius, a vanishing point, posts, nodes ...) and writes js/anchors.js. The explainers in js/explain.js register their SVG
to these measured points, so a re-delivered image lines up after one run of this tool (tools/assets.py runs it too).
Prints spec vs measured for every anchor and flags anything further off than the tolerance. Flags are reported, not fixed:
an off-anchor image is placed by its measured anchor, and the difference is listed in README "에셋 기준점".
Positions are fractions of the image's width (x) and height (y); radii and lengths are fractions of the width."""
import hashlib, json, pathlib, sys
import numpy as np
from PIL import Image

ARC = pathlib.Path(__file__).resolve().parent.parent
TOL = 0.02  # 2% of the width or height

def load(slot):
    f = ARC / "assets" / f"{slot}.jpg"
    if not f.exists(): return None
    im = Image.open(f).convert("RGB")
    a = np.asarray(im).astype(np.float32)
    return {"a": a, "W": im.width, "H": im.height, "sha": hashlib.sha256(f.read_bytes()).hexdigest(), "file": f"assets/{slot}.jpg"}

def chans(a):
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(2), a.min(2)
    lum = 0.2126 * R + 0.7152 * G + 0.0722 * B
    sat = (mx - mn) / (mx + 1e-6)
    return R, G, B, lum, sat, mn

def green(a):  # the acid accent (Dots' mask)
    R, G, B, *_ = chans(a)
    return (G > 150) & (G > 1.15 * R) & (G > 1.5 * B)

def white(a, lo=170):
    *_, lum, sat, mn = chans(a)
    return (mn > lo) & (sat < 0.2)

def cyan(a):
    R, G, B, *_ = chans(a)
    return (B > 140) & (G > 110) & (R < 140) & (B > R + 50)

def centroid(m):
    ys, xs = np.nonzero(m)
    return (float(xs.mean()), float(ys.mean()), int(len(xs))) if len(xs) else None

def components(m):
    """4-connected components of a boolean mask: list of dicts with n, cx, cy, x0, x1, y0, y1 (pixels)."""
    H, W = m.shape
    lab = np.zeros(m.shape, np.int32)
    out, cur = [], 0
    ys, xs = np.nonzero(m)
    for y, x in zip(ys, xs):
        if lab[y, x]: continue
        cur += 1; stack = [(y, x)]; lab[y, x] = cur; pts = []
        while stack:
            cy, cx = stack.pop(); pts.append((cy, cx))
            for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                if 0 <= ny < H and 0 <= nx < W and m[ny, nx] and not lab[ny, nx]:
                    lab[ny, nx] = cur; stack.append((ny, nx))
        p = np.array(pts)
        out.append({"n": len(p), "cx": float(p[:, 1].mean()), "cy": float(p[:, 0].mean()), "x0": int(p[:, 1].min()), "x1": int(p[:, 1].max()), "y0": int(p[:, 0].min()), "y1": int(p[:, 0].max())})
    return out

def shrink(m, k):
    """any-pixel downsample of a mask by k (keeps thin lines)"""
    H, W = m.shape[0] // k * k, m.shape[1] // k * k
    return m[:H, :W].reshape(H // k, k, W // k, k).any(axis=(1, 3))

def dilate(m, r):
    """OR of shifted copies: grows a mask by r pixels (a square neighbourhood)"""
    out = np.zeros_like(m)
    H, W = m.shape
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            out[max(0, dy):H + min(0, dy), max(0, dx):W + min(0, dx)] |= m[max(0, -dy):H + min(0, -dy), max(0, -dx):W + min(0, -dx)]
    return out

def fit_circle(xs, ys):
    """least-squares circle through points (Kasa): centre x, centre y, radius"""
    A = np.c_[2 * xs, 2 * ys, np.ones(len(xs))]
    b = xs ** 2 + ys ** 2
    (cx, cy, c), *_ = np.linalg.lstsq(A, b, rcond=None)
    return float(cx), float(cy), float(np.sqrt(c + cx ** 2 + cy ** 2))

def radial_peaks(lum, cx, cy, rmax, min_gap=6):
    """mean brightness by radius around (cx, cy); returns radii (px) of the ring peaks, inner to outer"""
    H, W = lum.shape
    yy, xx = np.mgrid[0:H, 0:W]
    r = np.hypot(xx - cx, yy - cy).astype(np.int32)
    keep = r < rmax
    prof = np.bincount(r[keep], weights=lum[keep]) / np.maximum(np.bincount(r[keep]), 1)
    base = np.median(prof)
    peaks = [i for i in range(2, len(prof) - 2) if prof[i] == prof[i - 2:i + 3].max() and prof[i] > base + 12]
    merged = []
    for p in peaks:
        if merged and p - merged[-1] < min_gap:
            if prof[p] > prof[merged[-1]]: merged[-1] = p
        else: merged.append(p)
    return merged

f2 = lambda v: round(float(v), 4)

# ── one measurement per slot ───────────────────────────────────────────

def m_core_seed(d):
    a, W, H = d["a"], d["W"], d["H"]
    g = centroid(green(a))
    if not g: return {"error": "no acid point"}
    *_, lum, _, _ = chans(a)
    rings = radial_peaks(lum, g[0], g[1], min(W, H) * 0.52, min_gap=int(W * 0.04))
    rings = [r for r in rings if r > W * 0.05]
    pts = {"c": [f2(g[0] / W), f2(g[1] / H)]}
    out = {"pts": pts, "rings": [f2(r / W) for r in rings]}
    if len(rings) >= 4: pts["r4"] = [f2((g[0] + rings[3]) / W), f2(g[1] / H)]
    return out

def m_loop_orbit(d):
    a, W, H = d["a"], d["W"], d["H"]
    gm = green(a)
    gy, gx = np.nonzero(gm)
    if not len(gx): return {"error": "no acid ring"}
    wy, wx = np.nonzero(white(a, 150))
    rr = np.hypot(wx - W / 2, wy - H / 2)
    sel = rr > W * 0.33  # the outermost loop and its four nodes
    cx, cy, outer = fit_circle(wx[sel].astype(float), wy[sel].astype(float))
    ax, ay, ar = fit_circle(gx.astype(float), gy.astype(float))
    return {"pts": {"c": [f2(cx / W), f2(cy / H)], "e": [f2((cx + outer) / W), f2(cy / H)]},
            "r_outer": f2(outer / W), "acid_ring": {"c": [f2(ax / W), f2(ay / H)], "r": f2(ar / W)}}

def m_context(d):
    a, W, H = d["a"], d["W"], d["H"]
    *_, lum, _, _ = chans(a)
    k = 24
    hh, ww = H // k, W // k
    cells = lum[:hh * k, :ww * k].reshape(hh, k, ww, k).mean(axis=(1, 3))
    thr = np.percentile(cells, 85)
    ys, xs = np.nonzero(cells >= thr)
    wts = cells[ys, xs]
    cx, cy = ((xs + .5) * k * wts).sum() / wts.sum(), ((ys + .5) * k * wts).sum() / wts.sum()
    col = cells.mean(axis=0)
    lo = col.min()
    left = next(i for i, v in enumerate(col) if v - lo > (col.max() - lo) * 0.10) * k / W
    return {"pts": {"c": [f2(cx / W), f2(cy / H)], "e": [f2(cx / W + 0.17), f2(cy / H)]}, "empty_left": f2(left),
            "note": "no drawn window: c is the centre of the densest particles, the width is the prompt's 34%"}

def m_swarm(d):
    a, W, H = d["a"], d["W"], d["H"]
    gm = green(a)
    g = centroid(gm)
    *_, lum, _, _ = chans(a)
    k = 32
    hh, ww = H // k, W // k
    cells = (lum * ~gm)[:hh * k, :ww * k].reshape(hh, k, ww, k).mean(axis=(1, 3))
    picks = []
    c = cells.copy()
    for _ in range(2):
        y, x = np.unravel_index(np.argmax(c), c.shape)
        picks.append([f2((x + .5) * k / W), f2((y + .5) * k / H)])
        c[max(0, y - 6):y + 7, max(0, x - 8):x + 9] = 0
    picks.sort()
    rows = lum.mean(axis=1)
    bottom = next((i for i in range(H - 1, -1, -1) if rows[i] > np.percentile(rows, 60) * 0.6), H)
    return {"pts": {"g": [f2(g[0] / W), f2(g[1] / H)], "w1": picks[0], "w2": picks[1]}, "empty_bottom": f2(1 - bottom / H)}

def m_manifold(d):
    a, W, H = d["a"], d["W"], d["H"]
    R, G, B, lum, sat, mn = chans(a)
    blue = (B > 120) & (B > R + 50) & (lum > 70)  # the innermost rings are math blue
    by, bx = np.nonzero(blue)
    cx, cy, _ = fit_circle(bx.astype(float), by.astype(float))
    for _ in range(2):  # re-fit on the inner ring only
        rr = np.hypot(bx - cx, by - cy)
        r0 = np.percentile(rr, 5)
        sel = rr < r0 * 1.15
        cx, cy, r = fit_circle(bx[sel].astype(float), by[sel].astype(float))
    linefrac = (lum > 90).mean(axis=1)
    top = next(i for i, v in enumerate(linefrac) if v > 0.02) / H
    ground = lum[int(H * .02):int(H * .12)].mean(), lum[int(H * .22):int(H * .30)][lum[int(H * .22):int(H * .30)] < 60].mean()
    return {"pts": {"c": [f2(cx / W), f2(cy / H)], "e": [f2((cx + r) / W), f2(cy / H)]}, "r_disk": f2(r / W), "empty_top": f2(top),
            "ground_above_below_seam": [round(float(ground[0]), 1), round(float(ground[1]), 1)]}

def m_horizon(d):
    a, W, H = d["a"], d["W"], d["H"]
    gm = green(a)
    ys, xs = np.nonzero(gm)
    cx, cy = (xs.min() + xs.max()) / 2, float(np.median(ys))
    *_, lum, _, _ = chans(a)
    ul = lum[:H // 2, :int(W * .45)]
    return {"pts": {"c": [f2(cx / W), f2(cy / H)]}, "upper_left_max": round(float(np.percentile(ul, 99.9)), 1)}

def m_harness(d):
    a, W, H = d["a"], d["W"], d["H"]
    gm = green(a)
    big = max(components(shrink(gm, 4)), key=lambda c: c["n"])
    ys, xs = np.nonzero(gm[big["y0"] * 4:(big["y1"] + 1) * 4, big["x0"] * 4:(big["x1"] + 1) * 4])
    cx, cy = xs.mean() + big["x0"] * 4, ys.mean() + big["y0"] * 4
    r = (len(xs) / np.pi) ** .5
    wm = white(a, 150)
    runs = []  # long horizontal chalk runs: the cube's top and bottom edges
    for y in range(H):
        row = wm[y]
        if row.sum() < W * .12: continue
        idx = np.nonzero(row)[0]
        splits = np.split(idx, np.nonzero(np.diff(idx) > 6)[0] + 1)
        best = max(splits, key=len)
        if best[-1] - best[0] > W * .15: runs.append((y, int(best[0]), int(best[-1])))
    groups = []
    for y, x0, x1 in runs:
        if groups and y - groups[-1][-1][0] <= 3: groups[-1].append((y, x0, x1))
        else: groups.append([(y, x0, x1)])
    edges = [(np.mean([g[0] for g in G]), np.median([g[1] for g in G]), np.median([g[2] for g in G])) for G in groups]
    front_x0 = min(e[1] for e in edges)
    front = [e for e in edges if abs(e[1] - front_x0) < W * .02]
    fx0, fx1 = np.median([e[1] for e in front]), np.median([e[2] for e in front])
    fy0, fy1 = min(e[0] for e in front), max(e[0] for e in front)
    return {"pts": {"c": [f2(cx / W), f2(cy / H)], "e": [f2((cx + r) / W), f2(cy / H)], "f0": [f2(fx0 / W), f2(fy0 / H)], "f1": [f2(fx1 / W), f2(fy1 / H)]},
            "r_sphere": f2(r / W), "front_w": f2((fx1 - fx0) / W), "front_h": f2((fy1 - fy0) / H),
            "empty_left": f2(next(i for i in range(W) if (chans(a)[3][:, i] > 60).any()) / W)}

def m_arches(d):
    a, W, H = d["a"], d["W"], d["H"]
    g = centroid(green(a))
    *_, lum, _, _ = chans(a)
    return {"pts": {"v": [f2(g[0] / W), f2(g[1] / H)]}, "bottom40_max": round(float(lum[int(H * .6):].max()), 1)}

def m_prism(d):
    a, W, H = d["a"], d["W"], d["H"]
    cm = cyan(a)
    ys, xs = np.nonzero(cm)
    top = ys.min(); apx = xs[ys <= top + 4].mean()
    base = np.percentile(ys, 99.5)
    bx = xs[ys >= base - 4]
    *_, lum, sat, mn = chans(a)
    beam = np.nonzero(white(a, 150)[:, :int(W * .05)].any(axis=1))[0]
    gm = green(a)
    gy = np.median(np.nonzero(gm)[0]); gx0 = np.nonzero(gm)[1].min()
    grey = (lum > 45) & (lum < 200) & (sat < 0.25)
    right = grey[:, int(W * .75):]
    colsum = right.sum(axis=0)
    wx = int(np.argmax(colsum)) + int(W * .75)
    wy = np.nonzero(grey[:, wx - 2:wx + 3].any(axis=1))[0]
    wy = wy[(wy > H * .4)]
    return {"pts": {"apex": [f2(apx / W), f2(top / H)], "bl": [f2(bx.min() / W), f2(base / H)], "br": [f2(bx.max() / W), f2(base / H)],
                    "beam": [0.0, f2(beam.mean() / H)], "pass": [f2(gx0 / W), f2(gy / H)], "wall0": [f2(wx / W), f2(wy.min() / H)], "wall1": [f2(wx / W), f2(wy.max() / H)]},
            "side": f2((bx.max() - bx.min()) / H), "centroid": [f2((apx + bx.min() + bx.max()) / 3 / W), f2((top + 2 * base) / 3 / H)]}

def m_gate(d):
    a, W, H = d["a"], d["W"], d["H"]
    cm = cyan(a)
    col = cm.sum(axis=0)
    p1 = int(np.argmax(col)); c2 = col.copy(); c2[max(0, p1 - 40):p1 + 41] = 0; p2 = int(np.argmax(c2))
    xl, xr = sorted([p1, p2])
    ys = np.nonzero(cm[:, xl - 3:xl + 4].any(axis=1))[0]
    g = centroid(green(a))
    wm = white(a, 160)
    path = []
    for x in range(0, xr, max(1, W // 64)):
        yy = np.nonzero(wm[:, x])[0]
        yy = yy[yy > H * .45]
        if len(yy): path.append([f2(x / W), f2(yy.mean() / H)])
    ex = max(np.nonzero(wm[int(H * .45):, :xr].any(axis=0))[0])
    ey = np.nonzero(wm[:, ex])[0]; ey = ey[ey > H * .45].mean()
    *_, lum, _, _ = chans(a)
    dots = components(shrink((lum > 55) & (np.arange(W)[None, :] > xr + 6) & ~cm, 2))
    dots = sorted([[f2(c["cx"] * 2 / W), f2(c["cy"] * 2 / H)] for c in dots if c["n"] < 40], key=lambda p: p[0])
    return {"pts": {"l": [f2(xl / W), f2(ys.min() / H)], "r": [f2(xr / W), f2(ys.max() / H)], "sig": [f2(g[0] / W), f2(g[1] / H)], "end": [f2(ex / W), f2(ey / H)]},
            "path": path, "dots": dots[::max(1, len(dots) // 24)], "spacing": f2((xr - xl) / W), "post_mid_y": f2((ys.min() + ys.max()) / 2 / H)}

GRAPH_NODES = {"n1": [0.39, 0.205], "n2": [0.845, 0.2], "n3": [0.638, 0.313], "n4": [0.31, 0.473], "n5": [0.538, 0.549],
               "n6": [0.739, 0.549], "n7": [0.87, 0.738], "n8": [0.506, 0.79]}
GRAPH_EDGES = [["n1", "n2"], ["n1", "n4"], ["n2", "n7"], ["n4", "n5"], ["n4", "n8"], ["n5", "n3"], ["n3", "n6"], ["n6", "n5"], ["n6", "n7"], ["n8", "n7"]]

def m_graph(d):
    a, W, H = d["a"], d["W"], d["H"]
    rings = [c for c in components(shrink(white(a, 175), 2)) if 20 < (c["x1"] - c["x0"]) * 2 < 140 and 20 < (c["y1"] - c["y0"]) * 2 < 140 and c["n"] > 60]
    found = [[((c["x0"] + c["x1"]) / 2 * 2 + 1) / W, ((c["y0"] + c["y1"]) / 2 * 2 + 1) / H, (c["x1"] - c["x0"]) * 2 / 2] for c in rings]
    nodes, used = {}, set()
    for k, (ex_, ey_) in GRAPH_NODES.items():
        best = min(((i, (f[0] - ex_) ** 2 + (f[1] - ey_) ** 2) for i, f in enumerate(found) if i not in used), key=lambda t: t[1], default=None)
        if best and best[1] < 0.004: used.add(best[0]); nodes[k] = [f2(found[best[0]][0]), f2(found[best[0]][1])]
    ring_r = float(np.median([f[2] for f in found])) if found else 0
    lines = dilate(cyan(a) | green(a), 3)
    gm = dilate(green(a), 3)
    edges = {}
    for s, e in GRAPH_EDGES:  # the control point of a quadratic that runs along the drawn edge
        if s not in nodes or e not in nodes: continue
        P, Q = np.array(nodes[s]) * [W, H], np.array(nodes[e]) * [W, H]
        L = np.linalg.norm(Q - P); u = (Q - P) / L; nrm = np.array([-u[1], u[0]]); M = (P + Q) / 2
        t = np.linspace(0.12, 0.88, 80)[None, :, None]
        al, si = np.meshgrid(np.linspace(-.25, .25, 21), np.linspace(-.75, .75, 61))
        C = M[None, :] + (al.ravel()[:, None] * u + si.ravel()[:, None] * nrm) * L          # candidates × 2
        Bz = (1 - t) ** 2 * P + 2 * (1 - t) * t * C[:, None, :] + t ** 2 * Q                 # candidates × 80 × 2
        xi, yi = np.clip(Bz[..., 0].astype(int), 0, W - 1), np.clip(Bz[..., 1].astype(int), 0, H - 1)
        hits = lines[yi, xi].mean(axis=1)
        b = int(np.argmax(hits)); hit, C = hits[b], C[b]
        acid = gm[yi[b], xi[b]].mean()
        edges[f"{s}-{e}"] = {"c": [f2(C[0] / W), f2(C[1] / H)], "fit": round(float(hit), 2), "acid": bool(acid > .5)}
    cyc = [nodes[k] for k in ("n3", "n5", "n6") if k in nodes]
    return {"pts": nodes, "edges": edges, "ring_r": f2(ring_r / W), "rings_found": len(found),
            "cycle_c": [f2(np.mean([p[0] for p in cyc])), f2(np.mean([p[1] for p in cyc]))] if len(cyc) == 3 else None}

def m_seam(d):
    a, W, H = d["a"], d["W"], d["H"]
    R, G, B, lum, sat, mn = chans(a)
    paper = (lum > 120) & (R >= B)
    xs = []
    for y in range(0, H, 4):
        idx = np.nonzero(paper[y])[0]
        if len(idx): xs.append(np.percentile(idx, 98))
    xs = np.array(xs) / W
    return {"pts": {"t": [f2(np.median(xs)), 0.5]}, "edge_min": f2(xs.min()), "edge_max": f2(xs.max()), "edge_sd": f2(xs.std())}

MEASURE = {
    "muse2-core-seed": m_core_seed, "muse2-loop-orbit": m_loop_orbit, "muse2-context-aperture": m_context, "muse2-swarm-streams": m_swarm,
    "muse2-field-manifold": m_manifold, "muse2-horizon-rings": m_horizon, "dots2-harness-frame": m_harness, "dots2-gap-arches": m_arches,
    "dots2-verify-prism": m_prism, "dots2-approval-threshold": m_gate, "dots2-graph-constellation": m_graph, "dots2-seam-ember-to-lattice": m_seam,
}

# what asset-prompts-v2.md asked for: [label, path into the measurement, spec value]
SPEC = {
    "muse2-core-seed": [["acid point at the centre", "pts.c", [0.5, 0.5]], ["4th circle radius", "rings.3", 0.4]],
    "muse2-loop-orbit": [["orbit centre", "pts.c", [0.5, 0.5]], ["outer orbit radius", "r_outer", 0.36]],
    "muse2-context-aperture": [["window centre", "pts.c", [0.58, 0.5]], ["empty left band", "empty_left", 0.3]],
    "muse2-swarm-streams": [["acid gathering point", "pts.g", [0.55, 0.62]], ["chalk gathering point 1", "pts.w1", [0.28, 0.40]], ["chalk gathering point 2", "pts.w2", [0.78, 0.35]], ["empty bottom band", "empty_bottom", 0.22]],
    "muse2-field-manifold": [["well centre", "pts.c", [0.5, 0.52]], ["empty centre radius", "r_disk", 0.12], ["empty top band", "empty_top", 0.10]],
    "muse2-horizon-rings": [["ellipse centre", "pts.c", [0.62, 0.70]]],
    "dots2-harness-frame": [["sphere centre", "pts.c", [0.64, 0.52]], ["sphere radius", "r_sphere", 0.07], ["cube face edge (one face's top edge)", "front_w", 0.34], ["empty left band", "empty_left", 0.38]],
    "dots2-gap-arches": [["vanishing point (farthest acid arch)", "pts.v", [0.5, 0.34]]],
    "dots2-verify-prism": [["prism centre", "centroid", [0.52, 0.5]], ["prism side / height", "side", 0.30], ["beam enters at", "pts.beam", [0.0, 0.5]]],
    "dots2-approval-threshold": [["posts centre x", "pts.sig", [0.5, None]], ["posts centre y", "post_mid_y", 0.54], ["post spacing", "spacing", 0.14]],
    "dots2-graph-constellation": [["cycle centre", "cycle_c", [0.60, 0.46]], ["nodes", "rings_found", 7]],
    "dots2-seam-ember-to-lattice": [["paper-to-lattice edge", "pts.t", [0.5, None]]],
}

def get(m, path):
    for k in path.split("."):
        if m is None: return None
        m = m[int(k)] if isinstance(m, list) else m.get(k)
    return m

def compare(slot, m):
    rows = []
    for label, path, want in SPEC.get(slot, []):
        got = get(m, path)
        if got is None: rows.append([label, want, None, None, True]); continue
        if isinstance(want, list):
            dl = [None if w is None else round(g - w, 3) for g, w in zip(got, want)]
            off = any(x is not None and abs(x) > TOL for x in dl)
        elif path == "rings_found":
            dl = got - want; off = dl != 0
        elif path.startswith("empty"):
            dl = round(got - want, 3); off = dl < -TOL  # a wider empty band than asked is not a problem
        else:
            dl = round(got - want, 3); off = abs(dl) > TOL
        rows.append([label, want, got, dl, off])
    return rows

def main():
    out, report = {}, []
    for slot, fn in MEASURE.items():
        d = load(slot)
        if not d:
            report.append(f"missing  {slot}  (no file in assets/, the slot keeps its fallback)"); continue
        m = fn(d)
        m.update({"file": d["file"], "size": [d["W"], d["H"]], "sha256": d["sha"]})
        m["spec"] = compare(slot, m)
        out[slot] = m
        report.append(f"measured {slot}  {d['W']}x{d['H']}")
        for label, want, got, dl, off in m["spec"]:
            report.append(f"    {'OFF ' if off else 'ok  '} {label}: spec {want}, measured {got}, delta {dl}")
    js = ("/* Generated by tools/anchors.py from the files in assets/. Do not edit: re-run the tool after a delivery.\n"
          "   Measured anchors of the second-batch design assets, as fractions of each image (x of the width, y of the height).\n"
          "   js/explain.js registers its drawings to these points. spec rows: [label, asked for, measured, delta, off]. */\n"
          "(function () {\n  const AR = (window.AR = window.AR || {});\n  AR.assetAnchors = " + json.dumps(out, ensure_ascii=False, indent=1) + ";\n})();\n")
    (ARC / "js/anchors.js").write_text(js, encoding="utf-8")
    print("\n".join(report))
    print(f"\nwrote js/anchors.js ({len(out)} images measured)")

if __name__ == "__main__":
    main()
