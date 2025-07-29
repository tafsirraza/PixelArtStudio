export function saveArt(grid) {
  localStorage.setItem('pixelArtGrid', JSON.stringify(grid));
}

export function loadArt() {
  const str = localStorage.getItem('pixelArtGrid');
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}
