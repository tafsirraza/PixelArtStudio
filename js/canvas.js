import { getCurrentColor, setCurrentColor } from './palette.js';
import { getCurrentTool, getPenSize } from './tools.js';
import { saveArt, loadArt } from './storage.js';

let gridSize = 32;
let pixelSize = 16;
let zoom = 1;
let gridVisible = true;
let grid = [];
let history = [];
let histIdx = -1;
let isDrawing = false;

export function responsiveCanvas() {
  const canvas = document.getElementById('pixel-canvas');
  const wrapper = document.getElementById('canvas-wrapper');
  let w = window.innerWidth;
  let h = window.innerHeight;

  let isMobile = w < 900;
  let boardMax = isMobile ? Math.min(w * 0.96, h * 0.66, 420) : Math.min(w * 0.7, h * 0.74, 750);
  let gsize = isMobile ? 20 : 32;

  let pxsize = Math.floor(boardMax / gsize);

  gridSize = gsize;
  pixelSize = pxsize;
  canvas.width = canvas.height = gridSize * pixelSize;

  if (wrapper) {
    wrapper.style.width = wrapper.style.height = canvas.width + 'px';
    wrapper.style.maxWidth = wrapper.style.maxHeight = canvas.width + 'px';
    wrapper.style.display = 'flex';
    wrapper.style.justifyContent = 'center';
    wrapper.style.alignItems = 'center';
    wrapper.style.margin = '0 auto 16px auto';
  }

  if (!grid.length || grid.length !== gridSize) {
    grid = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => '#111')
    );
    pushHistory();
  }
}

export function setupCanvas() {
  const canvas = document.getElementById('pixel-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.onmousedown = (e) => startDraw(e, ctx, canvas);
  canvas.onmousemove = (e) => moveDraw(e, ctx, canvas);
  canvas.onmouseup = () => { isDrawing = false; };
  canvas.onmouseleave = () => { isDrawing = false; };
  canvas.ontouchstart = (e) => { e.preventDefault(); startDraw(e, ctx, canvas, true); };
  canvas.ontouchmove = (e) => { e.preventDefault(); if(isDrawing) moveDraw(e, ctx, canvas, true); };
  canvas.ontouchend = () => { isDrawing = false; };

  window.saveArt = () => {
    saveArt(grid);
    setStatus('Artwork saved!');
  };
  window.loadArt = () => {
    const saved = loadArt();
    if (saved) {
      grid = saved;
      drawCanvas();
      setStatus('Artwork loaded.');
    } else setStatus('Nothing to load.');
  };
  window.exportPNG = () => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'pixel-art.png';
    link.click();
  };
  window.zoomIn = () => { zoom = Math.min(zoom * 1.25, 4); drawCanvas(); };
  window.zoomOut = () => { zoom = Math.max(zoom / 1.25, 0.5); drawCanvas(); };
  window.toggleGrid = function () { gridVisible = !gridVisible; drawCanvas(); };
}

function setStatus(msg) {
  let s = document.getElementById('status');
  if (s) s.textContent = msg;
  setTimeout(() => { if (s) s.textContent = ''; }, 1500);
}

function bucketFill(x, y, targetColor, fillColor) {
  if (targetColor === fillColor) return;
  let stack = [[x, y]];
  while (stack.length) {
    let [cx, cy] = stack.pop();
    if (cx < 0 || cy < 0 || cx >= gridSize || cy >= gridSize) continue;
    if (grid[cy][cx] !== targetColor) continue;
    grid[cy][cx] = fillColor;
    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
  }
}

function drawPixels(x, y, size, color) {
  for (let dx = 0; dx < size; dx++)
    for (let dy = 0; dy < size; dy++)
      if (y + dy < gridSize && x + dx < gridSize)
        grid[y + dy][x + dx] = color;
}

function getPos(e, canvas, useTouch) {
  const rect = canvas.getBoundingClientRect();
  let clientX, clientY;
  if (useTouch) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }
  const x = Math.floor((clientX - rect.left) / (pixelSize * zoom));
  const y = Math.floor((clientY - rect.top) / (pixelSize * zoom));
  return { x, y };
}

function handleDraw(e, ctx, canvas, useTouch = false) {
  const { x, y } = getPos(e, canvas, useTouch);
  if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return;
  let tool = getCurrentTool();
  let size = getPenSize();
  if (tool === 'pen') {
    drawPixels(x, y, size, getCurrentColor());
    drawCanvas();
    return;
  } else if (tool === 'eraser') {
    drawPixels(x, y, size, '#111');
    drawCanvas();
    return;
  } else if (tool === 'fill') {
    let targetColor = grid[y][x];
    let fillColor = getCurrentColor();
    bucketFill(x, y, targetColor, fillColor);
    drawCanvas();
    return;
  } else if (tool === 'eyedropper') {
    setCurrentColor(grid[y][x]);
    setToolUISelected(grid[y][x]);
    drawCanvas();
    return;
  }
}

function setToolUISelected(color) {
  document.querySelectorAll('.palette-color').forEach(el => {
    if (el.style.backgroundColor.replace(/ /g,'').toLowerCase() === color.toLowerCase()) {
      el.classList.add('selected');
    } else {
      el.classList.remove('selected');
    }
  });
}

function startDraw(e, ctx, canvas, useTouch = false) {
  isDrawing = true;
  handleDraw(e, ctx, canvas, useTouch);
  pushHistory();
}
function moveDraw(e, ctx, canvas, useTouch = false) {
  if (!isDrawing) return;
  handleDraw(e, ctx, canvas, useTouch);
}

export function drawCanvas() {
  const canvas = document.getElementById('pixel-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.setTransform(zoom, 0, 0, zoom, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      ctx.fillStyle = grid[y][x];
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      if (gridVisible) {
        ctx.strokeStyle = "#232323";
        ctx.strokeRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
  }
  ctx.restore();
}

function pushHistory() {
  if (history.length > 70) history.shift();
  histIdx++;
  history = history.slice(0, histIdx);
  history.push(JSON.stringify(grid));
}

window.undo = function () {
  if (histIdx > 0) {
    histIdx--;
    grid = JSON.parse(history[histIdx]);
    drawCanvas();
    setStatus('Undo');
  }
};
window.redo = function () {
  if (histIdx < history.length - 1) {
    histIdx++;
    grid = JSON.parse(history[histIdx]);
    drawCanvas();
    setStatus('Redo');
  }
};
window.toggleGrid = function () {
  gridVisible = !gridVisible;
  drawCanvas();
};
