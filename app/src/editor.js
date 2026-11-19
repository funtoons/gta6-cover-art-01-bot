// Editor state for Vice Sunset Cover Studio.
// Holds photos, layout, per-panel crop settings and caption text.
// The renderer in cover.js reads this state; main.js wires the DOM to it.

export function freshPanel(photoIndex) {
  return { photoIndex, zoom: 1, panX: 0, panY: 0, fit: 'fill', flip: false };
}

export function createState() {
  return {
    photos: [],          // HTMLImageElement[]
    photoNames: [],      // display names, same index as photos
    layout: 'trio',
    panels: [freshPanel(0), freshPanel(0), freshPanel(0), freshPanel(0)],
    selectedPanel: 0,
    title: 'VICE SUNSET',
    subtitle: 'One city. One last score.',
    footer: 'A poster made with Vice Sunset Cover Studio',
    titleSize: 92,
    titlePos: 'bottom',
    titleColor: 'sunset',
    grade: 'sunset',
    tilt: false,
    decorSun: true,
    decorPalms: true,
    decorSkyline: true,
  };
}

export function panelCountFor(layout) {
  return { hero: 1, split: 2, trio: 3, grid: 4 }[layout] || 1;
}

export function setLayout(state, layout) {
  state.layout = layout;
  const n = panelCountFor(layout);
  if (state.selectedPanel >= n) state.selectedPanel = 0;
  // Panels beyond the layout keep their settings; new panels default to photo 0.
  for (let i = 0; i < 4; i++) {
    if (!state.panels[i]) state.panels[i] = freshPanel(0);
  }
}

export function selectedPanel(state) {
  return state.panels[state.selectedPanel] || state.panels[0];
}

export function assignPhoto(state, panelIndex, photoIndex) {
  const p = state.panels[panelIndex];
  if (!p) return;
  p.photoIndex = Math.max(0, Math.min(photoIndex, Math.max(0, state.photos.length - 1)));
}

export function addPhoto(state, img, name) {
  if (state.photos.length >= 4) return false;
  state.photos.push(img);
  state.photoNames.push(name || `Photo ${state.photos.length}`);
  return true;
}

export function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Could not read that image file.'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.readAsDataURL(file);
  });
}

export function loadImageUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load ' + url));
    img.src = url;
  });
}

export function resetCrop(state, panelIndex) {
  const p = state.panels[panelIndex];
  if (!p) return;
  p.zoom = 1; p.panX = 0; p.panY = 0; p.fit = 'fill'; p.flip = false;
}

export function clampPan(state, panelIndex, maxShift) {
  const p = state.panels[panelIndex];
  if (!p) return;
  p.panX = Math.max(-maxShift, Math.min(maxShift, p.panX));
  p.panY = Math.max(-maxShift, Math.min(maxShift, p.panY));
}

// Human-readable label for a photo slot, used by the panel selector.
export function photoLabel(state, index) {
  return state.photoNames[index] || `Photo ${index + 1}`;
}
