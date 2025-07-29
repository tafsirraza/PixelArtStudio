let currentTool = 'pen';
let penSize = 1;

export function setupTools() {
  const penSizeInput = document.getElementById('pen-size');
  if (penSizeInput) penSizeInput.value = penSize;
}

export function getCurrentTool() {
  return currentTool;
}
export function setTool(tool) {
  currentTool = tool;
}
export function setPenSize(size) {
  penSize = Math.max(1, Math.min(8, size));
}
export function getPenSize() {
  return penSize;
}
