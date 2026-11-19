// Screenshot staging: ?shot=editor | ?shot=cover with ?photo= & ?caption=.
// Genuine app states only — it loads real sample photos into the real editor
// and paints the real cover. Sets window.__shotReady once painted.
// Multi-photo staging: ?photos=boulevard,pier loads both samples in order,
// ?panels=0,1,1 picks each panel's photo by index, ?pans=350,-50,-50 sets
// each panel's vertical pan in canvas pixels (positive shows the photo's top).
export async function runShot(shot, query, apply) {
  const photo = query.get('photo') || 'pier';
  const caption = query.get('caption') || 'Sunset Heist';
  const layout = query.get('layout') || 'trio';
  const grade = query.get('grade') || 'sunset';
  const photos = (query.get('photos') || photo).split(',').map((s) => s.trim()).filter(Boolean);
  const panels = (query.get('panels') || '').split(',').map((s) => Number(s)).filter((n) => Number.isFinite(n));
  const pans = (query.get('pans') || '').split(',').map((s) => Number(s)).filter((n) => Number.isFinite(n));
  if (shot === 'cover') document.body.classList.add('shot-cover');
  await apply({ photo, photos, panels, pans, caption, layout, grade });
  // In cover mode the canvas bitmap must match the viewport, or the
  // screenshot would stretch the cover to the wrong aspect ratio.
  if (shot === 'cover') {
    const c = document.getElementById('cover');
    if (c) {
      c.width = window.innerWidth; c.height = window.innerHeight;
      if (window.__viceStudio) window.__viceStudio.renderPreview();
    }
  }
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
