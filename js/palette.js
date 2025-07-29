export let palette = [
  '#e74c3c', '#f1c40f', '#27ae60', '#3498db', '#8e44ad', '#ecf0f1'
];

let currentColor = palette[0];

export function setupPalette() {
  const paletteDiv = document.getElementById('palette');
  paletteDiv.innerHTML = '';
  palette.forEach((color, idx) => {
    const el = document.createElement('div');
    el.className = 'palette-color';
    el.style.background = color;
    if (color === currentColor) el.classList.add('selected');
    el.addEventListener('click', () => {
      currentColor = color;
      
      document.querySelectorAll('.palette-color').forEach(e => e.classList.remove('selected'));
      el.classList.add('selected');
    });
    el.title = 'Right-click to remove';
    el.oncontextmenu = e => {
      e.preventDefault();
      if (palette.length > 2) palette.splice(idx, 1), setupPalette();
    };
    paletteDiv.appendChild(el);
  });

  let addBtn = document.createElement('div');
  addBtn.className = 'palette-add';
  addBtn.innerHTML = '<span class="material-icons" style="font-size:1.3em;vertical-align:middle;">add</span>';
  addBtn.title = 'Add color';
  addBtn.onclick = function () {
    let color = prompt('Enter hex color (e.g. #123abc):', '#ffffff');
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
      palette.push(color);
      setupPalette();
    }
  };
  paletteDiv.appendChild(addBtn);
}

export function getCurrentColor() {
  return currentColor;
}
export function setCurrentColor(color) {
  currentColor = color;
  document.querySelectorAll('.palette-color').forEach(el => {
    if (el.style.backgroundColor.replace(/ /g,'').toLowerCase() === color.toLowerCase()) {
      el.classList.add('selected');
    } else {
      el.classList.remove('selected');
    }
  });
}
