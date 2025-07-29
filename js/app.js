import { setupPalette } from './palette.js';
import { setupCanvas, drawCanvas, responsiveCanvas } from './canvas.js';
import { setupTools, setTool, setPenSize } from './tools.js';

window.addEventListener('DOMContentLoaded', () => {
  setupPalette();
  setupTools();

  responsiveCanvas();

  setupCanvas();
  drawCanvas();

  window.addEventListener('resize', () => {
    responsiveCanvas();
    drawCanvas();
  });

  document.getElementById('palette').addEventListener('click', e => {
    if (e.target.classList.contains('palette-color')) {
      document.querySelectorAll('.palette-color').forEach(d => d.classList.remove('selected'));
      e.target.classList.add('selected');
    }
  });

  window.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      window.undo && window.undo();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      window.redo && window.redo();
    } else if (e.key.toLowerCase() === 'p') {
      setTool('pen');
    } else if (e.key.toLowerCase() === 'e') {
      setTool('eraser');
    } else if (e.key.toLowerCase() === 'f') {
      setTool('fill');
    } else if (e.key.toLowerCase() === 'i') {
      setTool('eyedropper');
    }
  });

  document.getElementById('undo').onclick = () => window.undo && window.undo();
  document.getElementById('redo').onclick = () => window.redo && window.redo();
  document.getElementById('tool-pen').onclick = () => setTool('pen');
  document.getElementById('tool-eraser').onclick = () => setTool('eraser');
  document.getElementById('tool-fill').onclick = () => setTool('fill');
  document.getElementById('tool-eyedrop').onclick = () => setTool('eyedropper');
  document.getElementById('pen-size').onchange = e => setPenSize(Number(e.target.value) || 1);
  document.getElementById('save-art').onclick = () => window.saveArt && window.saveArt();
  document.getElementById('load-art').onclick = () => window.loadArt && window.loadArt();
  document.getElementById('export-png').onclick = () => window.exportPNG && window.exportPNG();
  document.getElementById('toggle-grid').onclick = () => window.toggleGrid && window.toggleGrid();
  document.getElementById('zoom-in').onclick = () => window.zoomIn && window.zoomIn();
  document.getElementById('zoom-out').onclick = () => window.zoomOut && window.zoomOut();
});
