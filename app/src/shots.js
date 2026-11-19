// Screenshot staging: ?shot=editor | ?shot=cover with ?photo= & ?caption=.
// Genuine app states only — it loads a real sample photo into the real editor
// and paints the real cover. Sets window.__shotReady once painted.
export async function runShot(shot, query, apply) {
  const photo = query.get('photo') || 'pier';
  const caption = query.get('caption') || 'Sunset Heist';
  const layout = query.get('layout') || 'trio';
  const grade = query.get('grade') || 'sunset';
  if (shot === 'cover') document.body.classList.add('shot-cover');
  await apply({ photo, caption, layout, grade });
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
