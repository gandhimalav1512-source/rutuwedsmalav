/* Opening screen: a rose window of stained glass, painted in code so it is sharp at any
   resolution (4K included), with light shimmering through it. Calls window.introDone()
   when it has faded away. */
(function () {
  var INTRO_MS = 8000, FADE_MS = 1600;
  var root = document.getElementById("intro");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!root) return;
  var cv = root.querySelector("canvas"), ctx = cv.getContext("2d");
  var W, H, dpr, R, cx, cy, base, glow, motes = [], glints = [], beams = [];
  var GLASS = {
    blue: "#1d43b0", deep: "#132a7a", ruby: "#b8162f", rose: "#cf4f78", emerald: "#1f8050",
    amber: "#e3a21f", gold: "#f2c64a", violet: "#6c2f94", teal: "#2499ad"
  };
  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var TAU = Math.PI * 2;

  // seeded random so every visit paints the same window
  var seed = 7;
  function srand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  function shade(hex, k) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    var f = function (c) { return Math.max(0, Math.min(255, Math.round(k > 0 ? c + (255 - c) * k : c * (1 + k)))); };
    return "rgb(" + f(r) + "," + f(g) + "," + f(b) + ")";
  }
  // one pane of glass: lit from its middle, darker toward the lead, with a little unevenness
  function pane(g, path, color, px, py, size) {
    var gr = g.createRadialGradient(px - size * 0.2, py - size * 0.25, size * 0.05, px, py, size * 1.1);
    var j = (srand() - 0.5) * 0.45;
    gr.addColorStop(0, shade(color, 0.42 + j));
    gr.addColorStop(0.5, shade(color, 0.08 + j));
    gr.addColorStop(1, shade(color, -0.42 + j * 0.5));
    g.fillStyle = gr; g.fill(path);
    // streaks and seeds in hand-made glass
    g.save(); g.clip(path); g.globalAlpha = 0.12; g.strokeStyle = srand() < 0.5 ? "#ffffff" : "#000000"; g.lineWidth = size * 0.05;
    for (var q = 0; q < 3; q++) { var o = (srand() - 0.5) * size * 1.6; g.beginPath(); g.moveTo(px - size + o, py - size); g.bezierCurveTo(px + o * 0.3, py - size * 0.2, px - o * 0.4, py + size * 0.3, px + size + o, py + size); g.stroke(); }
    g.restore();
    lead(g, path);
  }
  // lead came: dark core with a faint sheen along one edge
  function lead(g, path) {
    g.save(); g.lineWidth = LW; g.strokeStyle = "#0d0907"; g.stroke(path);
    g.lineWidth = LW * 0.3; g.strokeStyle = "rgba(160,140,120,0.35)"; g.translate(-LW * 0.15, -LW * 0.15); g.stroke(path); g.restore();
  }
  var LW = 2;
  // a blue ground cut into small irregular quarries, the way real glass is leaded
  function quarries(g, r0, r1, a0, a1, cols, rows) {
    for (var u = 0; u < cols; u++) for (var v = 0; v < rows; v++) {
      var ja = (a1 - a0) / cols, jr = (r1 - r0) / rows;
      var aa0 = a0 + ja * u + (u ? (srand() - 0.5) * ja * 0.25 : 0), aa1 = a0 + ja * (u + 1) + (u < cols - 1 ? (srand() - 0.5) * ja * 0.25 : 0);
      var rr0 = r0 + jr * v, rr1 = r0 + jr * (v + 1);
      var c = polar((rr0 + rr1) / 2, (aa0 + aa1) / 2);
      var col = srand() < 0.12 ? GLASS.ruby : srand() < 0.5 ? GLASS.blue : GLASS.deep;
      pane(g, sector(rr0, rr1, aa0, aa1), col, c[0], c[1], Math.max(jr, ja * rr1) * 0.7);
    }
  }
  function sector(r0, r1, a0, a1) {
    var p = new Path2D();
    p.arc(0, 0, r1, a0, a1); p.arc(0, 0, r0, a1, a0, true); p.closePath(); return p;
  }
  function circle(x, y, r) { var p = new Path2D(); p.arc(x, y, r, 0, TAU); return p; }
  function polar(r, a) { return [Math.cos(a) * r, Math.sin(a) * r]; }

  function paintWindow(g, R) {
    seed = 7;
    g.lineJoin = "round";
    g.strokeStyle = "#140f0b";
    LW = Math.max(1.2, R * 0.0075); g.lineWidth = LW;
    var i, a, s, c, k, p;

    // ring 3 (outer): 24 cells, alternating deep blue / ruby, each holding a small round jewel
    for (i = 0; i < 24; i++) {
      a = i / 24 * TAU - Math.PI / 2; s = TAU / 24;
      quarries(g, 0.78 * R, 0.975 * R, a, a + s, 2, 2);
    }
    for (i = 0; i < 24; i++) {
      a = (i + 0.5) / 24 * TAU - Math.PI / 2; c = polar(0.878 * R, a);
      pane(g, circle(c[0], c[1], 0.062 * R), i % 2 ? GLASS.ruby : GLASS.amber, c[0], c[1], 0.062 * R);
      pane(g, circle(c[0], c[1], 0.026 * R), i % 2 ? GLASS.gold : GLASS.teal, c[0], c[1], 0.026 * R);
    }
    // ring 2: blue ground with 12 great roundels, each a four-part flower
    for (i = 0; i < 12; i++) {
      a = i / 12 * TAU - Math.PI / 2; s = TAU / 12;
      quarries(g, 0.52 * R, 0.78 * R, a, a + s, 3, 3);
    }
    for (i = 0; i < 12; i++) {
      a = (i + 0.5) / 12 * TAU - Math.PI / 2; c = polar(0.65 * R, a);
      var rr = 0.118 * R, cols = i % 3 === 0 ? [GLASS.ruby, GLASS.gold] : i % 3 === 1 ? [GLASS.emerald, GLASS.amber] : [GLASS.violet, GLASS.rose];
      for (k = 0; k < 4; k++) {
        var b0 = a + k * TAU / 4 + Math.PI / 4;
        p = new Path2D(); p.moveTo(c[0], c[1]); p.arc(c[0], c[1], rr, b0, b0 + TAU / 4); p.closePath();
        var m = [c[0] + Math.cos(b0 + TAU / 8) * rr * 0.55, c[1] + Math.sin(b0 + TAU / 8) * rr * 0.55];
        pane(g, p, cols[k % 2], m[0], m[1], rr * 0.6);
      }
      pane(g, circle(c[0], c[1], rr * 0.3), GLASS.gold, c[0], c[1], rr * 0.3);
    }
    // ring 1: twelve pointed lancets radiating from the centre
    for (i = 0; i < 12; i++) {
      a = i / 12 * TAU - Math.PI / 2; s = TAU / 12;
      quarries(g, 0.17 * R, 0.52 * R, a, a + s, 2, 3);
      // the lancet: a gothic pointed arch shape inside the sector
      var mid = a + s / 2, hw = s * 0.32;
      var q0 = polar(0.2 * R, mid - hw * 0.9), q1 = polar(0.2 * R, mid + hw * 0.9);
      var q2 = polar(0.42 * R, mid + hw), q3 = polar(0.5 * R, mid), q4 = polar(0.42 * R, mid - hw);
      p = new Path2D(); p.moveTo(q0[0], q0[1]); p.lineTo(q4[0], q4[1]);
      p.quadraticCurveTo(polar(0.49 * R, mid - hw * 0.6)[0], polar(0.49 * R, mid - hw * 0.6)[1], q3[0], q3[1]);
      p.quadraticCurveTo(polar(0.49 * R, mid + hw * 0.6)[0], polar(0.49 * R, mid + hw * 0.6)[1], q2[0], q2[1]);
      p.lineTo(q1[0], q1[1]); p.closePath();
      var lc = [GLASS.ruby, GLASS.emerald, GLASS.amber, GLASS.violet, GLASS.teal, GLASS.rose][i % 6];
      c = polar(0.36 * R, mid);
      pane(g, p, lc, c[0], c[1], 0.1 * R);
      c = polar(0.27 * R, mid);
      pane(g, circle(c[0], c[1], 0.028 * R), GLASS.gold, c[0], c[1], 0.028 * R);
    }
    // centre: a six-petal flower
    pane(g, circle(0, 0, 0.17 * R), GLASS.deep, 0, 0, 0.17 * R);
    for (i = 0; i < 6; i++) {
      a = i / 6 * TAU; c = polar(0.085 * R, a);
      pane(g, circle(c[0], c[1], 0.075 * R), i % 2 ? GLASS.ruby : GLASS.rose, c[0], c[1], 0.075 * R);
    }
    pane(g, circle(0, 0, 0.055 * R), GLASS.gold, 0, 0, 0.055 * R);

    // painted-glass grain
    var n = document.createElement("canvas"); n.width = n.height = 256;
    var nx = n.getContext("2d"), id = nx.createImageData(256, 256);
    for (i = 0; i < id.data.length; i += 4) { var v = 110 + Math.random() * 60; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    nx.putImageData(id, 0, 0);
    g.save(); g.globalCompositeOperation = "overlay"; g.globalAlpha = 0.35;
    g.fillStyle = g.createPattern(n, "repeat"); g.beginPath(); g.arc(0, 0, 0.975 * R, 0, TAU); g.fill(); g.restore();

    // heavier stone tracery between the rings
    g.save(); g.strokeStyle = "#1c1611";
    [[0.17, 0.02], [0.52, 0.026], [0.78, 0.026]].forEach(function (r) { g.lineWidth = r[1] * R; g.beginPath(); g.arc(0, 0, r[0] * R, 0, TAU); g.stroke(); });
    g.restore();
    // carved stone frame
    var st = g.createRadialGradient(-0.2 * R, -0.3 * R, 0.9 * R, 0, 0, 1.12 * R);
    st.addColorStop(0, "#8d8170"); st.addColorStop(0.5, "#5d5447"); st.addColorStop(1, "#2a251f");
    g.fillStyle = st; g.beginPath(); g.arc(0, 0, 1.1 * R, 0, TAU); g.arc(0, 0, 0.975 * R, 0, TAU, true); g.fill();
    g.strokeStyle = "rgba(255,240,215,0.25)"; g.lineWidth = R * 0.006;
    [1.0, 1.06].forEach(function (r) { g.beginPath(); g.arc(0, 0, r * R, 0, TAU); g.stroke(); });
    g.strokeStyle = "rgba(0,0,0,0.5)"; g.lineWidth = R * 0.01; g.beginPath(); g.arc(0, 0, 1.1 * R, 0, TAU); g.stroke();
  }

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.width = Math.round(innerWidth * dpr); H = cv.height = Math.round(innerHeight * dpr);
    var portrait = H > W;
    R = Math.min(W, H) * (portrait ? 0.43 : 0.36);
    cx = W / 2; cy = portrait ? H * 0.4 : H * 0.44;
    var S = Math.ceil(R * 2.3);
    base = document.createElement("canvas"); base.width = base.height = S;
    var g = base.getContext("2d"); g.translate(S / 2, S / 2); paintWindow(g, R);
    // soft bloom: the window, shrunk and stretched back up, glowing onto the wall around it
    var src = base, w = S;
    while (w > 48) {                                   // halve repeatedly: a smooth, cheap blur
      w = Math.round(w / 2); var c2 = document.createElement("canvas"); c2.width = c2.height = w;
      var x2 = c2.getContext("2d"); x2.imageSmoothingQuality = "high"; x2.drawImage(src, 0, 0, w, w); src = c2;
    }
    glow = src;
    // shafts of coloured light falling from the window
    var cols = ["#3d64ff", "#ff4d6a", "#ffcc55", "#5fe0a0", "#b06cff"];
    beams = cols.map(function (c, i) { return { c: c, a: -0.35 + i * 0.16 + rand(-0.04, 0.04), w: rand(0.1, 0.18), ph: rand(0, 6) }; });
    motes = []; for (var i = 0; i < 70; i++) motes.push({ x: rand(0, W), y: rand(cy, H), r: rand(0.6, 2) * dpr, v: rand(0.05, 0.25) * dpr, ph: rand(0, 6) });
  }

  var t0 = performance.now(), raf;
  function frame(now) {
    var t = (now - t0) / 1000;
    var inA = Math.min(1, t / 1.8);                         // window glows up out of the dark
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // stone wall in near darkness, warmer near the window
    var bg = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, Math.max(W, H) * 0.8);
    bg.addColorStop(0, "#2a2018"); bg.addColorStop(0.5, "#120d0a"); bg.addColorStop(1, "#060405");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    ctx.globalAlpha = inA;
    // light beams to the floor
    ctx.globalCompositeOperation = "screen";
    beams.forEach(function (b) {
      var al = (0.07 + 0.05 * Math.sin(t * 0.7 + b.ph)) * inA;
      var dir = Math.PI / 2 + b.a, len = Math.hypot(W, H);
      var x0 = cx + Math.cos(dir) * R * 0.2, y0 = cy + Math.sin(dir) * R * 0.2;
      var x1 = x0 + Math.cos(dir - b.w) * len, y1 = y0 + Math.sin(dir - b.w) * len;
      var x2 = x0 + Math.cos(dir + b.w) * len, y2 = y0 + Math.sin(dir + b.w) * len;
      var gr = ctx.createLinearGradient(x0, y0, x0 + Math.cos(dir) * len * 0.7, y0 + Math.sin(dir) * len * 0.7);
      gr.addColorStop(0, b.c); gr.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = al; ctx.fillStyle = gr;
      ctx.beginPath(); ctx.moveTo(x0 - R * 0.5 * Math.sin(dir), y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x0 + R * 0.5 * Math.sin(dir), y0); ctx.fill();
    });
    // glow on the wall
    ctx.globalAlpha = 0.42 * inA * (0.88 + 0.12 * Math.sin(t * 1.3));
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(glow, cx - base.width * 0.62, cy - base.height * 0.62, base.width * 1.24, base.height * 1.24);
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = inA;
    ctx.drawImage(base, cx - base.width / 2, cy - base.height / 2);

    // light passing through: a slow sheen sweeping across the glass
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, 0.975 * R, 0, TAU); ctx.clip();
    ctx.globalCompositeOperation = "screen";
    var sx = cx + Math.cos(t * 0.35) * R * 0.6, sy = cy + Math.sin(t * 0.27) * R * 0.5;
    var sh = ctx.createRadialGradient(sx, sy, 0, sx, sy, R * 0.9);
    sh.addColorStop(0, "rgba(255,240,210,0.32)"); sh.addColorStop(1, "rgba(255,240,210,0)");
    ctx.globalAlpha = inA; ctx.fillStyle = sh; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    // scintillation: tiny glints winking on and off across the panes
    ctx.globalCompositeOperation = "lighter";
    if (!reduce && Math.random() < 0.55) {
      var ga = rand(0, TAU), gd = Math.sqrt(Math.random()) * 0.95 * R;
      glints.push({ x: cx + Math.cos(ga) * gd, y: cy + Math.sin(ga) * gd, s: rand(0.008, 0.022) * R, t: t, life: rand(0.6, 1.4) });
    }
    glints = glints.filter(function (g) {
      var k = (t - g.t) / g.life; if (k > 1) return false;
      var a = Math.sin(k * Math.PI);
      var gg = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.s);
      gg.addColorStop(0, "rgba(255,250,235," + (0.9 * a) + ")"); gg.addColorStop(1, "rgba(255,240,210,0)");
      ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(g.x, g.y, g.s, 0, TAU); ctx.fill();
      return true;
    });
    ctx.restore();

    // dust drifting through the light
    ctx.globalCompositeOperation = "lighter";
    motes.forEach(function (m) {
      m.y -= m.v; m.x += Math.sin(t * 0.6 + m.ph) * 0.2 * dpr;
      if (m.y < cy) { m.y = H; m.x = rand(0, W); }
      ctx.globalAlpha = inA * (0.25 + 0.25 * Math.sin(t * 2 + m.ph));
      ctx.fillStyle = "#ffe9c4"; ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, TAU); ctx.fill();
    });
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }

  function finish() {
    if (root.classList.contains("out")) return;
    root.classList.add("out");
    if (window.introDone) window.introDone();
    setTimeout(function () { cancelAnimationFrame(raf); root.remove(); }, FADE_MS + 100);
  }
  size(); addEventListener("resize", size);
  raf = requestAnimationFrame(frame);
  setTimeout(finish, reduce ? 2500 : INTRO_MS);
  root.addEventListener("click", finish);                 // a tap skips ahead
})();
