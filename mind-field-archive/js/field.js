/* v6: the ambient field behind the floor. A slow contour field (iso-lines of a drifting noise surface) drawn in WebGL,
   tinted by the zone under the camera and pinned to the world, so it pans and zooms with the floor like paper under the
   pieces. It replaces the old film-grain overlay; a 1/255 dither keeps the dark gradients from banding.
   Cost: one full-screen triangle at 60% resolution, at most 30 frames a second, only while the floor is visible.
   Motion: with reduced motion (the OS setting or the M toggle) time stops and a frame is drawn only when the camera
   moves. Every dialog pauses it. No WebGL → the CSS floor colour shows and nothing else changes. */
(function () {
  const floor = document.getElementById("floor"), A = window.AR;
  if (!floor || !A) return;
  const cv = document.createElement("canvas");
  cv.className = "field"; cv.setAttribute("aria-hidden", "true");
  const gl = cv.getContext("webgl", { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: "low-power", preserveDrawingBuffer: false });
  if (!gl) return;
  floor.prepend(cv);
  const VS = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
  const FS = `precision highp float;
uniform vec2 uRes;uniform vec2 uCam;uniform float uZ;uniform float uT;uniform vec3 uTint;uniform float uK;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<4;i++){v+=a*n(p);p=m*p;a*=.5;}return v;}
void main(){
  vec2 fc=gl_FragCoord.xy;fc.y=uRes.y-fc.y;
  vec2 w=uCam+(fc-uRes*.5)/uZ;                 /* world px under this pixel */
  vec2 q=w/1400.;
  vec2 warp=vec2(fbm(q+vec2(0.,uT*.020)),fbm(q+vec2(5.2,1.3)-vec2(uT*.016,0.)));
  float f=fbm(q*1.15+warp*1.7);
  float k=f*uK;                                /* contour spacing, finer when zoomed in */
  float e=.5-abs(fract(k)-.5);                 /* 0 on a contour */
  float line=1.-smoothstep(0.,.05,e);
  float glow=1.-smoothstep(0.,.5,abs(f-.55));
  vec3 base=vec3(.043,.043,.047);
  vec3 col=base+uTint*(.012+.05*glow)+uTint*line*.075;
  vec2 v=fc/uRes-.5;col*=1.-dot(v,v)*.55;     /* vignette */
  col+=(h(fc+uT)-.5)/255.;                    /* dither, instead of grain */
  gl_FragColor=vec4(col,1.);
}`;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; };
  const vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) { cv.remove(); return; }
  const pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { cv.remove(); return; }
  gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {}; ["uRes", "uCam", "uZ", "uT", "uTint", "uK"].forEach((k) => (U[k] = gl.getUniformLocation(pr, k)));
  document.body.classList.add("has-field");

  /* zone tints: red for Part 1, ember on the bridge, acid in Part 2, bone in the gallery, acid at the exit */
  const Z = A.zones, col = (r, g, b) => [r / 255, g / 255, b / 255];
  const stops = [[0, col(212, 38, 28)], [Z.br.x, col(212, 38, 28)], [Z.br.x + Z.br.w * 0.5, col(232, 84, 30)], [Z.p2.x, col(182, 242, 58)],
    [Z.gal.x, col(182, 242, 58)], [Z.gal.x + 600, col(232, 228, 220)], [Z.exit.x, col(232, 228, 220)], [Z.exit.x + 700, col(182, 242, 58)], [A.world.w, col(182, 242, 58)]];
  const tint = (x) => { for (let i = 1; i < stops.length; i++) if (x <= stops[i][0]) { const [x0, c0] = stops[i - 1], [x1, c1] = stops[i], t = x1 > x0 ? (x - x0) / (x1 - x0) : 0; return c0.map((v, j) => v + (c1[j] - v) * t); } return stops[stops.length - 1][1]; };

  const S = 0.6;
  let cam = { x: 0, y: 0, z: 0.2 }, t0 = performance.now(), raf = 0, last = 0, dirty = true, frozenT = 0;
  const root = document.documentElement, os = matchMedia("(prefers-reduced-motion: reduce)");
  const reduced = () => (root.dataset.motion ? root.dataset.motion === "reduced" : os.matches);
  const covered = () => [...document.querySelectorAll("dialog")].some((d) => d.open && d.id !== "keys");
  function size() {
    const w = Math.max(1, Math.round(floor.clientWidth * S)), h = Math.max(1, Math.round(floor.clientHeight * S));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); dirty = true; }
  }
  function draw(now) {
    size();
    const z = cam.z * S, vw = floor.clientWidth, vh = floor.clientHeight;
    const cx = (vw / 2 - cam.x) / cam.z, cy = (vh / 2 - cam.y) / cam.z;
    const time = reduced() ? frozenT : (now - t0) / 1000;
    if (!reduced()) frozenT = time;
    gl.uniform2f(U.uRes, cv.width, cv.height);
    gl.uniform2f(U.uCam, cx, cy);
    gl.uniform1f(U.uZ, z);
    gl.uniform1f(U.uT, time);
    gl.uniform3fv(U.uTint, tint(cx));
    gl.uniform1f(U.uK, 9 + Math.min(10, cam.z * 14));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    dirty = false;
  }
  function loop(now) {
    raf = 0;
    if (document.hidden || covered()) return;
    if (reduced()) { if (dirty) draw(now); return; }
    if (now - last >= 33) { last = now; draw(now); }
    raf = requestAnimationFrame(loop);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  window.ARF = {
    camera(c) { cam = { x: c.x, y: c.y, z: c.z }; dirty = true; kick(); },
    motion() { dirty = true; kick(); },
    kick,
  };
  addEventListener("resize", () => { dirty = true; kick(); });
  document.addEventListener("visibilitychange", kick);
  document.querySelectorAll("dialog").forEach((d) => d.addEventListener("close", () => { dirty = true; kick(); }));
  if (window.ARchive) { cam = { ...window.ARchive.cam }; }
  kick();
})();
