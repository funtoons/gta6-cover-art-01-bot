// Cover rendering for Vice Sunset Cover Studio.
// Pure drawing: given a state and a canvas context, paint the poster.
// No network, no fonts beyond the generic system sans-serif stack.

export const LAYOUTS = {
  hero: (w, h) => [{ x: 0, y: 0, w, h }],
  split: (w, h) => [
    { x: 0, y: 0, w: w / 2, h },
    { x: w / 2, y: 0, w: w / 2, h },
  ],
  trio: (w, h) => [
    { x: 0, y: 0, w, h: h * 0.62 },
    { x: 0, y: h * 0.62, w: w / 2, h: h * 0.38 },
    { x: w / 2, y: h * 0.62, w: w / 2, h: h * 0.38 },
  ],
  grid: (w, h) => [
    { x: 0, y: 0, w: w / 2, h: h / 2 },
    { x: w / 2, y: 0, w: w / 2, h: h / 2 },
    { x: 0, y: h / 2, w: w / 2, h: h / 2 },
    { x: w / 2, y: h / 2, w: w / 2, h: h / 2 },
  ],
};

export const GRADES = {
  sunset: { filter: 'saturate(1.35) contrast(1.08) brightness(1.02)', tint: ['rgba(255,94,58,0.16)', 'rgba(255,46,136,0.14)'] },
  neon: { filter: 'saturate(1.6) contrast(1.15) hue-rotate(-12deg)', tint: ['rgba(255,46,136,0.22)', 'rgba(46,230,255,0.18)'] },
  golden: { filter: 'saturate(1.25) contrast(1.05) sepia(0.28)', tint: ['rgba(255,190,60,0.18)', 'rgba(255,120,20,0.10)'] },
  mono: { filter: 'grayscale(1) contrast(1.18) brightness(1.05)', tint: ['rgba(0,0,0,0.05)', 'rgba(255,255,255,0.04)'] },
};

const TITLE_COLORS = {
  white: ['#ffffff', '#ffe9a8'],
  sunset: ['#ffd23f', '#ff8a00'],
  neon: ['#ff2e88', '#ff7ab8'],
  cyan: ['#2ee6ff', '#a5f3ff'],
};

function drawPhotoPanel(ctx, img, rect, panel, grade, gutter) {
  const x = rect.x + gutter / 2, y = rect.y + gutter / 2;
  const w = rect.w - gutter, h = rect.h - gutter;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (!img) {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, '#ff5e3a'); g.addColorStop(0.55, '#ff2e88'); g.addColorStop(1, '#5b2a86');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    drawSun(ctx, x + w * 0.5, y + h * 0.42, Math.min(w, h) * 0.22);
  } else {
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const scale = panel.fit === 'fit'
      ? Math.min(w / iw, h / ih)
      : Math.max(w / iw, h / ih);
    const z = scale * (panel.zoom || 1);
    const dw = iw * z, dh = ih * z;
    const cx = x + w / 2 + (panel.panX || 0), cy = y + h / 2 + (panel.panY || 0);
    ctx.filter = grade.filter;
    if (panel.flip) { ctx.translate(cx, cy); ctx.scale(-1, 1); ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh); }
    else ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
    ctx.filter = 'none';
  }
  const tint = ctx.createLinearGradient(x, y, x, y + h);
  tint.addColorStop(0, grade.tint[0]); tint.addColorStop(1, grade.tint[1]);
  ctx.fillStyle = tint; ctx.fillRect(x, y, w, h);
  const vig = ctx.createRadialGradient(x + w / 2, y + h / 2, Math.min(w, h) * 0.35, x + w / 2, y + h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(10,0,20,0.38)');
  ctx.fillStyle = vig; ctx.fillRect(x, y, w, h);
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(3, gutter * 0.55);
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
}

function drawSun(ctx, cx, cy, r) {
  ctx.save();
  const g = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
  g.addColorStop(0, '#fff3b0'); g.addColorStop(0.6, '#ffd23f'); g.addColorStop(1, '#ff5e3a');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,210,63,0.85)'; ctx.lineWidth = Math.max(3, r * 0.08);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r * 1.15, cy + Math.sin(a) * r * 1.15);
    ctx.lineTo(cx + Math.cos(a) * r * 1.5, cy + Math.sin(a) * r * 1.5);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPalm(ctx, x, baseY, s) {
  ctx.save();
  ctx.translate(x, baseY); ctx.scale(s, s);
  ctx.strokeStyle = '#14081f'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(14, -55, 4, -105); ctx.stroke();
  ctx.fillStyle = '#14081f';
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI * (0.08 + i * 0.16);
    ctx.beginPath();
    ctx.moveTo(4, -105);
    ctx.quadraticCurveTo(4 + Math.cos(a) * 62, -105 + Math.sin(a) * 42 - 18, 4 + Math.cos(a) * 88, -105 + Math.sin(a) * 62 + 26);
    ctx.quadraticCurveTo(4 + Math.cos(a) * 48, -105 + Math.sin(a) * 30 + 6, 4, -105);
    ctx.fill();
  }
  ctx.restore();
}

function drawSkyline(ctx, w, h) {
  ctx.save();
  ctx.fillStyle = 'rgba(16,6,28,0.92)';
  const base = h * 0.985;
  let x = 0;
  const heights = [0.05, 0.08, 0.035, 0.10, 0.06, 0.09, 0.045, 0.07, 0.11, 0.055];
  let i = 0;
  while (x < w) {
    const bw = w * 0.075, bh = h * heights[i % heights.length];
    ctx.fillRect(x, base - bh, bw, bh);
    if (i % 3 === 0) ctx.fillRect(x + bw * 0.3, base - bh - h * 0.03, bw * 0.14, h * 0.03);
    x += bw + w * 0.012; i++;
  }
  ctx.restore();
}

function fitTitleSize(ctx, text, maxWidth, start) {
  let size = start;
  ctx.font = `900 ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  while (size > 28 && ctx.measureText(text).width > maxWidth) {
    size -= 4;
    ctx.font = `900 ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  }
  return size;
}

export function drawCover(ctx, state, W, H) {
  const gutter = Math.max(8, Math.round(W * 0.014));
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#12081f';
  ctx.fillRect(0, 0, W, H);
  const grade = GRADES[state.grade] || GRADES.sunset;
  const rects = LAYOUTS[state.layout](W, H);
  const tilt = state.tilt ? 0.012 : 0;
  rects.forEach((rect, i) => {
    const panel = state.panels[i] || { photoIndex: 0, zoom: 1, panX: 0, panY: 0, fit: 'fill', flip: false };
    const img = state.photos[panel.photoIndex] || null;
    ctx.save();
    if (tilt) {
      const cx = rect.x + rect.w / 2, cy = rect.y + rect.h / 2;
      ctx.translate(cx, cy); ctx.rotate(i % 2 === 0 ? tilt : -tilt); ctx.translate(-cx, -cy);
    }
    drawPhotoPanel(ctx, img, rect, panel, grade, gutter);
    ctx.restore();
  });
  if (state.decorSkyline) drawSkyline(ctx, W, H);
  if (state.decorPalms) {
    drawPalm(ctx, W * 0.04, H * 0.99, W / 1080 * 1.15);
    drawPalm(ctx, W * 0.95, H * 0.99, W / 1080 * 0.95);
  }
  const top = state.titlePos === 'top';
  const bandH = H * 0.30;
  const bandY = top ? H * 0.03 : H - bandH - H * 0.03;
  // A soft dark band behind the lettering keeps the title readable over any photo.
  const band = ctx.createLinearGradient(0, bandY, 0, bandY + bandH);
  band.addColorStop(0, 'rgba(12,4,24,0)');
  band.addColorStop(0.5, 'rgba(12,4,24,0.42)');
  band.addColorStop(1, 'rgba(12,4,24,0)');
  ctx.fillStyle = band;
  ctx.fillRect(0, bandY, W, bandH);
  if (state.decorSun) drawSun(ctx, W * 0.5, bandY + bandH * 0.5, Math.min(W, H) * 0.16);
  const title = (state.title || 'VICE SUNSET').toUpperCase();
  const maxW = W * 0.92;
  const size = fitTitleSize(ctx, title, maxW, Math.round(state.titleSize * (W / 1080)));
  const colors = TITLE_COLORS[state.titleColor] || TITLE_COLORS.white;
  const cy = bandY + bandH * 0.52;
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  try { ctx.letterSpacing = '2px'; } catch { /* older canvas: ignore */ }
  ctx.font = `900 ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#14081f'; ctx.lineWidth = Math.max(6, size * 0.14);
  ctx.strokeText(title, W / 2, cy);
  const fill = ctx.createLinearGradient(0, cy - size * 0.5, 0, cy + size * 0.5);
  fill.addColorStop(0, colors[0]); fill.addColorStop(1, colors[1]);
  ctx.fillStyle = fill;
  ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = size * 0.18; ctx.shadowOffsetY = size * 0.07;
  ctx.fillText(title, W / 2, cy);
  ctx.restore();
  const subSize = Math.max(18, Math.round(size * 0.24));
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `700 ${subSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = 'rgba(20,8,31,0.9)'; ctx.lineWidth = Math.max(3, subSize * 0.16); ctx.lineJoin = 'round';
  const subY = top ? cy + size * 0.62 : cy - size * 0.62;
  if (state.subtitle) { ctx.strokeText(state.subtitle, W / 2, subY); ctx.fillText(state.subtitle, W / 2, subY); }
  ctx.restore();
  if (state.footer) {
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.font = `700 ${Math.max(14, Math.round(W * 0.016))}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.strokeStyle = 'rgba(20,8,31,0.85)'; ctx.lineWidth = 4; ctx.lineJoin = 'round';
    ctx.strokeText(state.footer.toUpperCase(), W / 2, H - H * 0.018);
    ctx.fillText(state.footer.toUpperCase(), W / 2, H - H * 0.018);
    ctx.restore();
  }
}
