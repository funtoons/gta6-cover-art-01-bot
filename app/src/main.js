// Vice Sunset Cover Studio — boot and wiring.
// Connects the controls in index.html to the editor state and the cover
// renderer, handles drag-pan / wheel-zoom on the preview, and exports PNGs.
import { drawCover } from './cover.js';
import { createState, setLayout, selectedPanel, assignPhoto, addPhoto, loadImageFile, loadImageUrl, resetCrop, clampPan, panelCountFor } from './editor.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('cover');
const ctx = canvas.getContext('2d');
const statusEl = $('status');
const state = createState();

export function renderPreview() {
  const w = canvas.width, h = canvas.height;
  drawCover(ctx, state, w, h);
  const sizeEl = $('preview-size');
  if (sizeEl) sizeEl.textContent = `${w} × ${h}`;
}

function setStatus(text) { statusEl.textContent = text; }

function refreshPanelControls() {
  const panel = selectedPanel(state);
  const zoom = $('zoom');
  zoom.value = String(Math.round(panel.zoom * 100));
  $('zoom-val').textContent = `${Math.round(panel.zoom * 100)}%`;
  $('fit-toggle').textContent = `Fit: ${panel.fit === 'fit' ? 'Fit' : 'Fill'}`;
  $('flip-toggle').textContent = `Flip: ${panel.flip ? 'On' : 'Off'}`;
  const photoSel = $('panel-photo');
  photoSel.innerHTML = '';
  state.photos.forEach((img, i) => {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = state.photoNames[i] || `Photo ${i + 1}`;
    if (i === panel.photoIndex) opt.selected = true;
    photoSel.appendChild(opt);
  });
  if (!state.photos.length) {
    const opt = document.createElement('option');
    opt.value = '0'; opt.textContent = 'No photo yet';
    photoSel.appendChild(opt);
  }
  $('panel-select').value = String(state.selectedPanel);
  document.querySelectorAll('.layout-btn').forEach((b) => b.classList.toggle('active', b.dataset.layout === state.layout));
  document.querySelectorAll('.grade-btn').forEach((b) => b.classList.toggle('active', b.dataset.grade === state.grade));
  document.querySelectorAll('.swatch').forEach((b) => b.classList.toggle('active', b.dataset.color === state.titleColor));
  document.querySelectorAll('.pos-btn').forEach((b) => b.classList.toggle('active', b.dataset.pos === state.titlePos));
}

function refreshThumbs() {
  const box = $('thumbs');
  box.innerHTML = '';
  $('photo-count').textContent = state.photos.length
    ? `${state.photos.length} photo${state.photos.length > 1 ? 's' : ''} loaded — pick a panel, then choose its photo.`
    : 'No photos yet — try a sample below, or upload your own.';
  state.photos.forEach((img, i) => {
    const t = document.createElement('img');
    t.src = img.src; t.alt = state.photoNames[i] || `Photo ${i + 1}`;
    t.title = state.photoNames[i] || `Photo ${i + 1}`;
    t.classList.toggle('sel', selectedPanel(state).photoIndex === i);
    t.addEventListener('click', () => {
      assignPhoto(state, state.selectedPanel, i);
      refreshPanelControls(); refreshThumbs(); renderPreview();
    });
    box.appendChild(t);
  });
}

function refreshAll() { refreshPanelControls(); refreshThumbs(); renderPreview(); }

async function addSample(name, label) {
  try {
    const img = await loadImageUrl(`./samples/${name}.jpg`);
    if (!addPhoto(state, img, label)) { setStatus('Already 4 photos — the studio holds at most 4.'); return; }
    setStatus(`${label} loaded. Pick a layout, then export.`);
    refreshAll();
  } catch { setStatus('Could not load the sample photo.'); }
}

$('sample-boulevard').addEventListener('click', () => addSample('boulevard', 'Boulevard sample'));
$('sample-pier').addEventListener('click', () => addSample('pier', 'Pier sample'));

$('upload').addEventListener('change', async (e) => {
  const files = Array.from(e.target.files || []);
  let added = 0;
  for (const file of files) {
    if (state.photos.length >= 4) break;
    try { const img = await loadImageFile(file); if (addPhoto(state, img, file.name)) added++; } catch { /* skip unreadable file */ }
  }
  setStatus(added ? `${added} photo${added > 1 ? 's' : ''} loaded from your machine.` : 'No photos added (max 4, images only).');
  refreshAll();
  e.target.value = '';
});

document.querySelectorAll('.layout-btn').forEach((b) => b.addEventListener('click', () => {
  setLayout(state, b.dataset.layout);
  setStatus(`Layout: ${b.textContent}.`);
  refreshAll();
}));

$('panel-select').addEventListener('change', (e) => {
  state.selectedPanel = Number(e.target.value);
  refreshPanelControls(); refreshThumbs(); renderPreview();
});
$('panel-photo').addEventListener('change', (e) => {
  assignPhoto(state, state.selectedPanel, Number(e.target.value));
  refreshThumbs(); renderPreview();
});
$('zoom').addEventListener('input', (e) => {
  selectedPanel(state).zoom = Number(e.target.value) / 100;
  $('zoom-val').textContent = `${e.target.value}%`;
  renderPreview();
});
$('fit-toggle').addEventListener('click', () => {
  const p = selectedPanel(state);
  p.fit = p.fit === 'fit' ? 'fill' : 'fit';
  refreshPanelControls(); renderPreview();
});
$('flip-toggle').addEventListener('click', () => {
  const p = selectedPanel(state);
  p.flip = !p.flip;
  refreshPanelControls(); renderPreview();
});
$('reset-crop').addEventListener('click', () => {
  resetCrop(state, state.selectedPanel);
  refreshPanelControls(); renderPreview();
});
$('tilt').addEventListener('change', (e) => { state.tilt = e.target.checked; renderPreview(); });

$('title').addEventListener('input', (e) => { state.title = e.target.value; renderPreview(); });
$('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; renderPreview(); });
$('footer').addEventListener('input', (e) => { state.footer = e.target.value; renderPreview(); });
$('title-size').addEventListener('input', (e) => {
  state.titleSize = Number(e.target.value);
  $('title-size-val').textContent = e.target.value;
  renderPreview();
});
document.querySelectorAll('.pos-btn').forEach((b) => b.addEventListener('click', () => {
  state.titlePos = b.dataset.pos;
  refreshPanelControls(); renderPreview();
}));
document.querySelectorAll('.swatch').forEach((b) => b.addEventListener('click', () => {
  state.titleColor = b.dataset.color;
  refreshPanelControls(); renderPreview();
}));
document.querySelectorAll('.grade-btn').forEach((b) => b.addEventListener('click', () => {
  state.grade = b.dataset.grade;
  refreshPanelControls(); renderPreview();
  setStatus(`Grade: ${b.textContent}.`);
}));
$('decor-sun').addEventListener('change', (e) => { state.decorSun = e.target.checked; renderPreview(); });
$('decor-palms').addEventListener('change', (e) => { state.decorPalms = e.target.checked; renderPreview(); });
$('decor-skyline').addEventListener('change', (e) => { state.decorSkyline = e.target.checked; renderPreview(); });

// Drag to pan the selected panel; wheel to zoom it.
let dragging = false, lastX = 0, lastY = 0;
canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const rect = canvas.getBoundingClientRect();
  const scale = canvas.width / rect.width;
  const p = selectedPanel(state);
  p.panX += (e.clientX - lastX) * scale;
  p.panY += (e.clientY - lastY) * scale;
  lastX = e.clientX; lastY = e.clientY;
  clampPan(state, state.selectedPanel, canvas.width);
  renderPreview();
});
canvas.addEventListener('pointerup', () => { dragging = false; });
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const p = selectedPanel(state);
  p.zoom = Math.max(0.5, Math.min(3, p.zoom * (e.deltaY < 0 ? 1.08 : 0.93)));
  refreshPanelControls(); renderPreview();
}, { passive: false });

function exportPng(w, h, filename) {
  const off = document.createElement('canvas');
  off.width = w; off.height = h;
  drawCover(off.getContext('2d'), state, w, h);
  off.toBlob((blob) => {
    if (!blob) { setStatus('Export failed — try again.'); return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    setStatus(`Exported ${filename} (${w} × ${h}).`);
  }, 'image/png');
}

$('export-square').addEventListener('click', () => exportPng(1080, 1080, 'vice-sunset-cover-1080x1080.png'));
$('export-tall').addEventListener('click', () => exportPng(1080, 1350, 'vice-sunset-cover-1080x1350.png'));
$('export-wide').addEventListener('click', () => exportPng(1920, 1080, 'vice-sunset-cover-1920x1080.png'));

// Expose the real export for automated checks / screenshots.
window.__viceStudio = { state, exportPng, renderPreview, panelCountFor };

// Screenshot staging.
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  runShot(shot, params, async ({ photo, caption, layout, grade }) => {
    const img = await loadImageUrl(`./samples/${photo}.jpg`);
    addPhoto(state, img, photo === 'boulevard' ? 'Boulevard sample' : 'Pier sample');
    state.title = caption;
    const titleEl = $('title'); if (titleEl) titleEl.value = caption;
    setLayout(state, layout);
    state.grade = grade;
    // In trio, give the hero the sample and reuse it in the small panels too.
    state.panels.forEach((p) => { p.photoIndex = 0; });
    // Cover shots paint at the viewport's own aspect ratio (see shots.js).
    if (shot === 'cover') { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    refreshAll();
  });
} else {
  refreshAll();
  // Load the boulevard sample by default so the studio is never empty.
  addSample('boulevard', 'Boulevard sample');
}
