const partNames = {
  pants: 'Editar calca',
  waist: 'Editar cintura',
  feet: 'Editar pes',
  arms: 'Editar manga curta',
  shirt: 'Editar camiseta',
  face: 'Editar rosto',
};

const labelNames = {
  pants: 'Calca selecionada',
  waist: 'Cintura selecionada',
  feet: 'Pes selecionados',
  arms: 'Manga curta selecionada',
  shirt: 'Camiseta selecionada',
  face: 'Rosto selecionado',
};

const swatchColors = [
  '#0b59d1',
  '#121212',
  '#f4d20a',
  '#2f9e44',
  '#d72d16',
  '#f08c00',
  '#7950f2',
  '#ffffff',
  '#868e96',
  '#5c4033',
  '#15aabf',
  '#e64980',
];

const panelTitle = document.querySelector('#panelTitle');
const editorPopover = document.querySelector('#editorPopover');
const closePopover = document.querySelector('#closePopover');
const pantsControls = document.querySelector('#pantsControls');
const waistControls = document.querySelector('#waistControls');
const feetControls = document.querySelector('#feetControls');
const armsControls = document.querySelector('#armsControls');
const shirtControls = document.querySelector('#shirtControls');
const faceControls = document.querySelector('#faceControls');
const swatches = document.querySelector('#swatches');
const waistSwatches = document.querySelector('#waistSwatches');
const feetSwatches = document.querySelector('#feetSwatches');
const armSwatches = document.querySelector('#armSwatches');
const pantsPicker = document.querySelector('#pantsPicker');
const waistPicker = document.querySelector('#waistPicker');
const feetPicker = document.querySelector('#feetPicker');
const armsPicker = document.querySelector('#armsPicker');
const pantsModeButton = document.querySelector('#pantsModeButton');
const shortsModeButton = document.querySelector('#shortsModeButton');
const shortSleeveButton = document.querySelector('#shortSleeveButton');
const longSleeveButton = document.querySelector('#longSleeveButton');
const pantsColor = document.querySelector('#pantsColor');
const shirtImageSvg = document.querySelector('#shirtImageSvg');
const faceImageSvg = document.querySelector('#faceImageSvg');
const shirtUpload = document.querySelector('#shirtUpload');
const faceUpload = document.querySelector('#faceUpload');
const clearShirt = document.querySelector('#clearShirt');
const clearFace = document.querySelector('#clearFace');
const resetShirtImage = document.querySelector('#resetShirtImage');
const resetFaceImage = document.querySelector('#resetFaceImage');
const savePdfButton = document.querySelector('#savePdfButton');
const resetButton = document.querySelector('#resetButton');
const figureSvg = document.querySelector('.figure-svg');
const transformControls = document.querySelector('#imageTransformControls');
const transformBox = document.querySelector('#transformBox');
const controlMoveArea = document.querySelector('#controlMoveArea');
const controlOutline = document.querySelector('#controlOutline');
const rotateLine = document.querySelector('#rotateLine');
const rotateHandle = document.querySelector('#rotateHandle');
const removeImageHandle = document.querySelector('#removeImageHandle');
const resizeHandles = document.querySelectorAll('.resize-handle');

const imageBoxes = {
  shirt: {
    image: shirtImageSvg,
    x: 150,
    y: 300,
    width: 340,
    height: 275,
    centerX: 320,
    centerY: 437.5,
  },
  face: {
    image: faceImageSvg,
    x: 230,
    y: 112,
    width: 180,
    height: 132,
    centerX: 320,
    centerY: 178,
  },
};

let selectedPart = 'pants';
let activeColor = swatchColors[0];
let activeWaistColor = swatchColors[0];
let activeFeetColor = '#0745a8';
let activeArmsColor = '#d72d16';
let sleeveMode = 'short';
let pantsMode = 'pants';
let imageState = {
  shirt: { x: 0, y: 0, scale: 1, rotate: 0 },
  face: { x: 0, y: 0, scale: 1, rotate: 0 },
};
let activeImagePart = null;
let activeDrag = null;
let activePointers = new Map();
let activeGesture = null;

const printSizes = {
  shirt: {
    topWidthMm: 11.6,
    bottomWidthMm: 15.1,
    heightMm: 12.21,
  },
};

function isMobileLayout() {
  return window.matchMedia('(max-width: 780px)').matches;
}

function closeEditorOnMobileChoice() {
  if (!isMobileLayout()) return;
  window.setTimeout(() => editorPopover.classList.add('hidden'), 80);
}

function selectPart(part) {
  selectedPart = part;
  panelTitle.textContent = partNames[part];

  pantsControls.classList.toggle('hidden', part !== 'pants');
  waistControls.classList.toggle('hidden', part !== 'waist');
  feetControls.classList.toggle('hidden', part !== 'feet');
  armsControls.classList.toggle('hidden', part !== 'arms');
  shirtControls.classList.toggle('hidden', part !== 'shirt');
  faceControls.classList.toggle('hidden', part !== 'face');
}

function openEditor(part, event) {
  selectPart(part);

  if (part === 'shirt' || part === 'face') {
    selectImageForTransform(part);
    if (hasImage(part)) {
      editorPopover.classList.add('hidden');
      return;
    }

    editorPopover.classList.add('hidden');
    if (part === 'shirt') {
      shirtUpload.click();
    } else {
      faceUpload.click();
    }
    return;
  } else {
    hideTransformControls();
  }

  editorPopover.classList.remove('hidden');

  if (!event || isMobileLayout()) return;

  const stageRect = document.querySelector('#stage').getBoundingClientRect();
  const clickX = event.clientX - stageRect.left;
  const clickY = event.clientY - stageRect.top;
  const left = Math.min(Math.max(clickX, 150), stageRect.width - 150);
  const top = Math.min(Math.max(clickY - 150, 12), stageRect.height - 190);

  editorPopover.style.left = `${left}px`;
  editorPopover.style.top = `${top}px`;
}

function setPantsColor(color) {
  activeColor = color;
  document.documentElement.style.setProperty('--pants', color);
  pantsPicker.value = color;

  document.querySelectorAll('#swatches .swatch').forEach((button) => {
    button.classList.toggle('active', button.dataset.color.toLowerCase() === color.toLowerCase());
  });
}

function setWaistColor(color) {
  activeWaistColor = color;
  document.documentElement.style.setProperty('--waist', color);
  waistPicker.value = color;

  document.querySelectorAll('#waistSwatches .swatch').forEach((button) => {
    button.classList.toggle('active', button.dataset.color.toLowerCase() === color.toLowerCase());
  });
}

function setFeetColor(color) {
  activeFeetColor = color;
  document.documentElement.style.setProperty('--feet', color);
  feetPicker.value = color;

  document.querySelectorAll('#feetSwatches .swatch').forEach((button) => {
    button.classList.toggle('active', button.dataset.color.toLowerCase() === color.toLowerCase());
  });
}

function setPantsMode(mode) {
  pantsMode = mode;
  figureSvg.classList.toggle('shorts-mode', mode === 'shorts');
  pantsModeButton.classList.toggle('active', mode === 'pants');
  shortsModeButton.classList.toggle('active', mode === 'shorts');
}

function setArmsColor(color) {
  activeArmsColor = color;
  document.documentElement.style.setProperty('--arms', color);
  document.documentElement.style.setProperty('--shirt', color);
  armsPicker.value = color;

  document.querySelectorAll('#armSwatches .swatch').forEach((button) => {
    button.classList.toggle('active', button.dataset.color.toLowerCase() === color.toLowerCase());
  });
}

function setSleeveMode(mode) {
  sleeveMode = mode;
  figureSvg.classList.toggle('long-sleeve', mode === 'long');
  shortSleeveButton.classList.toggle('active', mode === 'short');
  longSleeveButton.classList.toggle('active', mode === 'long');
}

function applyImageTransform(part) {
  const box = imageBoxes[part];
  const state = imageState[part];
  const scale = state.scale;
  const transform = [
    `translate(${state.x} ${state.y})`,
    `translate(${box.centerX} ${box.centerY})`,
    `rotate(${state.rotate})`,
    `scale(${scale})`,
    `translate(${-box.centerX} ${-box.centerY})`,
  ].join(' ');

  box.image.setAttribute('transform', transform);
  if (activeImagePart === part) {
    transformBox.setAttribute('transform', transform);
  }
}

function setControlBox(part) {
  const box = imageBoxes[part];
  const handleSize = 42;
  const handleOffset = handleSize / 2;
  const rotateGap = part === 'face' ? 34 : 42;

  controlMoveArea.setAttribute('x', box.x);
  controlMoveArea.setAttribute('y', box.y);
  controlMoveArea.setAttribute('width', box.width);
  controlMoveArea.setAttribute('height', box.height);

  controlOutline.setAttribute('x', box.x);
  controlOutline.setAttribute('y', box.y);
  controlOutline.setAttribute('width', box.width);
  controlOutline.setAttribute('height', box.height);

  rotateLine.setAttribute('x1', box.centerX);
  rotateLine.setAttribute('y1', box.y);
  rotateLine.setAttribute('x2', box.centerX);
  rotateLine.setAttribute('y2', box.y - rotateGap);
  rotateHandle.setAttribute('cx', box.centerX);
  rotateHandle.setAttribute('cy', box.y - rotateGap - 12);
  rotateHandle.setAttribute('r', 22);
  removeImageHandle.setAttribute('cx', box.x + box.width);
  removeImageHandle.setAttribute('cy', box.y);
  document.querySelector('#removeImageIcon').setAttribute(
    'd',
    `M${box.x + box.width - 8} ${box.y - 8} L${box.x + box.width + 8} ${box.y + 8} M${box.x + box.width + 8} ${box.y - 8} L${box.x + box.width - 8} ${box.y + 8}`
  );

  const corners = {
    tl: [box.x - handleOffset, box.y - handleOffset],
    tr: [box.x + box.width - handleOffset, box.y - handleOffset],
    bl: [box.x - handleOffset, box.y + box.height - handleOffset],
    br: [box.x + box.width - handleOffset, box.y + box.height - handleOffset],
  };

  resizeHandles.forEach((handle) => {
    const [x, y] = corners[handle.dataset.corner];
    handle.setAttribute('x', x);
    handle.setAttribute('y', y);
    handle.setAttribute('width', handleSize);
    handle.setAttribute('height', handleSize);
  });
}

function hasImage(part) {
  return imageBoxes[part].image.hasAttribute('href');
}

function selectImageForTransform(part) {
  activeImagePart = hasImage(part) ? part : null;
  if (!activeImagePart) {
    hideTransformControls();
    return;
  }

  setControlBox(part);
  transformControls.classList.remove('hidden');
  applyImageTransform(part);
}

function hideTransformControls() {
  activeImagePart = null;
  activeDrag = null;
  activePointers.clear();
  activeGesture = null;
  transformControls.classList.add('hidden');
}

function resetImageTransform(part) {
  imageState[part] = { x: 0, y: 0, scale: 1, rotate: 0 };
  applyImageTransform(part);
  if (hasImage(part)) {
    selectImageForTransform(part);
  }
}

function readUpload(file, part) {
  if (!file) return;

  const targetImage = imageBoxes[part].image;
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    targetImage.setAttribute('href', reader.result);
    targetImage.setAttribute('opacity', '1');
    if (targetImage === faceImageSvg) {
      document.querySelector('.figure-svg').classList.add('face-uploaded');
    }
    resetImageTransform(part);
    selectImageForTransform(part);
    editorPopover.classList.add('hidden');
  });
  reader.readAsDataURL(file);
}

function clearImage(part, uploadInput) {
  const targetImage = imageBoxes[part].image;
  targetImage.removeAttribute('href');
  targetImage.setAttribute('opacity', '0');
  targetImage.removeAttribute('transform');
  uploadInput.value = '';
  if (targetImage === faceImageSvg) {
    document.querySelector('.figure-svg').classList.remove('face-uploaded');
  }
  resetImageTransform(part);
  hideTransformControls();
}

function svgPoint(event) {
  const point = figureSvg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform(figureSvg.getScreenCTM().inverse());
}

function imageCenter(part) {
  const box = imageBoxes[part];
  const state = imageState[part];
  return {
    x: box.centerX + state.x,
    y: box.centerY + state.y,
  };
}

function pointerAngle(point, center) {
  return Math.atan2(point.y - center.y, point.x - center.x) * (180 / Math.PI);
}

function pointerDistance(point, center) {
  return Math.hypot(point.x - center.x, point.y - center.y);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function pointerPairMetrics() {
  const points = Array.from(activePointers.values());
  if (points.length < 2) return null;

  const [first, second] = points;
  const center = {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  };

  return {
    center,
    distance: Math.max(pointerDistance(first, second), 1),
    angle: pointerAngle(second, first),
  };
}

function startGestureDrag() {
  if (!activeImagePart) return;

  const metrics = pointerPairMetrics();
  if (!metrics) return;

  const state = imageState[activeImagePart];
  activeGesture = {
    startCenter: metrics.center,
    startDistance: metrics.distance,
    startAngle: metrics.angle,
    startX: state.x,
    startY: state.y,
    startScale: state.scale,
    startRotate: state.rotate,
  };
  activeDrag = null;
}

function startTransformDrag(event, mode) {
  if (!activeImagePart) return;
  event.preventDefault();
  event.stopPropagation();

  const point = svgPoint(event);
  if (mode === 'move') {
    activePointers.set(event.pointerId, point);
  } else {
    activePointers.clear();
    activeGesture = null;
  }

  try {
    event.currentTarget.setPointerCapture(event.pointerId);
  } catch (error) {
    // Some mobile browsers skip capture for a second touch; the SVG listener still receives moves.
  }

  if (mode === 'move' && activePointers.size >= 2) {
    startGestureDrag();
    return;
  }

  const state = imageState[activeImagePart];
  const center = imageCenter(activeImagePart);
  activeDrag = {
    mode,
    pointerId: event.pointerId,
    startPoint: point,
    startX: state.x,
    startY: state.y,
    startScale: state.scale,
    startRotate: state.rotate,
    startDistance: Math.max(pointerDistance(point, center), 1),
    startAngle: pointerAngle(point, center),
    center,
  };
}

function updateTransformDrag(event) {
  if (!activeImagePart) return;
  event.preventDefault();

  const point = svgPoint(event);
  if (activePointers.has(event.pointerId)) {
    activePointers.set(event.pointerId, point);
  }

  if (activePointers.size >= 2) {
    if (!activeGesture) {
      startGestureDrag();
    }

    const metrics = pointerPairMetrics();
    if (!activeGesture || !metrics) return;

    const state = imageState[activeImagePart];
    state.x = activeGesture.startX + metrics.center.x - activeGesture.startCenter.x;
    state.y = activeGesture.startY + metrics.center.y - activeGesture.startCenter.y;
    state.scale = clamp(activeGesture.startScale * (metrics.distance / activeGesture.startDistance), 0.35, 3);
    state.rotate = activeGesture.startRotate + metrics.angle - activeGesture.startAngle;
    applyImageTransform(activeImagePart);
    return;
  }

  if (!activeDrag || event.pointerId !== activeDrag.pointerId) return;

  const state = imageState[activeImagePart];

  if (activeDrag.mode === 'move') {
    state.x = activeDrag.startX + point.x - activeDrag.startPoint.x;
    state.y = activeDrag.startY + point.y - activeDrag.startPoint.y;
  }

  if (activeDrag.mode === 'scale') {
    const distance = pointerDistance(point, activeDrag.center);
    state.scale = clamp(activeDrag.startScale * (distance / activeDrag.startDistance), 0.35, 3);
  }

  if (activeDrag.mode === 'rotate') {
    const angle = pointerAngle(point, activeDrag.center);
    state.rotate = activeDrag.startRotate + angle - activeDrag.startAngle;
  }

  applyImageTransform(activeImagePart);
}

function stopTransformDrag(event) {
  activePointers.delete(event.pointerId);
  if (activeGesture && activePointers.size < 2) {
    activeGesture = null;
    const remainingPointer = activePointers.entries().next().value;
    if (remainingPointer && activeImagePart) {
      const [pointerId, point] = remainingPointer;
      const state = imageState[activeImagePart];
      const center = imageCenter(activeImagePart);
      activeDrag = {
        mode: 'move',
        pointerId,
        startPoint: point,
        startX: state.x,
        startY: state.y,
        startScale: state.scale,
        startRotate: state.rotate,
        startDistance: Math.max(pointerDistance(point, center), 1),
        startAngle: pointerAngle(point, center),
        center,
      };
    }
  }

  if (activeDrag && event.pointerId === activeDrag.pointerId) {
    activeDrag = null;
  }
}

function printStickerSvg(part) {
  const box = imageBoxes[part];
  const imageHref = box.image.getAttribute('href');
  const imageTransform = box.image.getAttribute('transform') || '';
  const scaleMm = 40 / (860 - 64);
  const isFace = part === 'face';
  const printBox = isFace
    ? box
    : { x: 150, y: 300, width: 340, height: 275 };
  const widthMm = isFace ? box.width * scaleMm : printSizes.shirt.bottomWidthMm;
  const heightMm = isFace ? box.height * scaleMm : printSizes.shirt.heightMm;
  const clipId = `${part}PrintClip`;
  const shirtTopWidthUnits = box.width * (printSizes.shirt.topWidthMm / printSizes.shirt.bottomWidthMm);
  const shirtTopInsetUnits = (box.width - shirtTopWidthUnits) / 2;
  const shirtTopLeft = printBox.x + shirtTopInsetUnits;
  const shirtTopRight = printBox.x + printBox.width - shirtTopInsetUnits;
  const shape = isFace
    ? `<rect x="230" y="112" width="180" height="132" rx="28" ry="28" />`
    : `<path d="M${shirtTopLeft.toFixed(2)} 300 H${shirtTopRight.toFixed(2)} L490 575 H150 Z" />`;
  const imageTag = imageHref
    ? `<image href="${imageHref}" x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" preserveAspectRatio="xMidYMid meet" transform="${imageTransform}" clip-path="url(#${clipId})" />`
    : '';

  return `
    <svg class="sticker ${part}-sticker" width="${widthMm.toFixed(2)}mm" height="${heightMm.toFixed(2)}mm" viewBox="${printBox.x} ${printBox.y} ${printBox.width} ${printBox.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="${clipId}">${shape}</clipPath>
      </defs>
      ${imageTag}
      <g class="cut-line">${shape}</g>
    </svg>
  `;
}

function printFigurePreviewSvg() {
  const clone = figureSvg.cloneNode(true);
  clone.querySelectorAll('.hit-area, .transform-controls').forEach((element) => element.remove());
  const classes = ['figure-preview'];
  if (figureSvg.classList.contains('long-sleeve')) classes.push('long-sleeve');
  if (figureSvg.classList.contains('shorts-mode')) classes.push('shorts-mode');
  clone.setAttribute('class', classes.join(' '));
  clone.setAttribute('width', '18mm');
  clone.setAttribute('height', '25.31mm');

  const currentStyles = getComputedStyle(document.documentElement);
  const previewStyle = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  previewStyle.textContent = `
    .scene-bg { fill: #f7efe4; }
    #shirtTint { fill: ${currentStyles.getPropertyValue('--shirt').trim()}; }
    #pantsColor { fill: ${currentStyles.getPropertyValue('--pants').trim()}; }
    #shortsColor { display: none; fill: ${currentStyles.getPropertyValue('--pants').trim()}; }
    .lower-legs { display: none; fill: url(#plasticYellow); }
    .shorts-mode #pantsColor { display: none; }
    .shorts-mode #shortsColor,
    .shorts-mode .lower-legs { display: block; }
    #waistColor { fill: ${currentStyles.getPropertyValue('--waist').trim()}; }
    .neck, .head, .head-stud, .hand, .forearm { fill: url(#plasticYellow); }
    .arm { fill: ${currentStyles.getPropertyValue('--arms').trim()}; }
    .long-sleeve .forearm { fill: ${currentStyles.getPropertyValue('--arms').trim()}; }
    .shirt-shine, .head-shine { fill: url(#shine); pointer-events: none; }
    .pants-lines { fill: none; stroke: rgba(0, 0, 0, 0.28); stroke-width: 7; stroke-linecap: round; }
    .shoe { fill: ${currentStyles.getPropertyValue('--feet').trim()}; }
    .shoe-shine { fill: none; stroke: rgba(255, 255, 255, 0.28); stroke-width: 5; stroke-linecap: round; }
    #defaultFace { fill: #171717; }
    .face-uploaded #defaultFace { opacity: 0; }
  `;
  clone.insertBefore(previewStyle, clone.firstChild);

  return clone.outerHTML;
}

function exportStickersToPdf() {
  if (!hasImage('shirt') && !hasImage('face')) {
    alert('Adicione uma imagem na camiseta ou no rosto antes de salvar.');
    return;
  }

  hideTransformControls();
  editorPopover.classList.add('hidden');

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('O navegador bloqueou a janela de impressão. Libere pop-ups para salvar o PDF.');
    return;
  }

  const html = `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Adesivos Lego</title>
        <style>
          @page { size: A4; margin: 12mm 6mm 6mm 6mm; }
          * { box-sizing: border-box; }
          body { margin: 0; color: #111; }
          .sheet { display: flex; gap: 3mm; align-items: flex-start; justify-content: flex-start; flex-wrap: nowrap; }
          .item { display: block; page-break-inside: avoid; line-height: 0; }
          .sticker { display: block; overflow: visible; }
          .figure-preview { display: block; overflow: visible; }
          .cut-line > * { fill: none; stroke: #111; stroke-width: 1; stroke-dasharray: 5 4; vector-effect: non-scaling-stroke; }
          .print-button { margin: 0 0 8mm; padding: 8px 12px; font: 14px Arial, Helvetica, sans-serif; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <button class="no-print print-button" onclick="window.print()">Imprimir</button>
        <div class="sheet">
          <div class="item">
            ${printStickerSvg('shirt')}
          </div>
          <div class="item">
            ${printStickerSvg('face')}
          </div>
          <div class="item">
            ${printFigurePreviewSvg()}
          </div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
}

swatchColors.forEach((color) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'swatch';
  button.dataset.color = color;
  button.style.background = color;
  button.setAttribute('aria-label', `Usar cor ${color}`);
  button.addEventListener('click', () => {
    setPantsColor(color);
    closeEditorOnMobileChoice();
  });
  swatches.appendChild(button);

  const waistButton = document.createElement('button');
  waistButton.type = 'button';
  waistButton.className = 'swatch';
  waistButton.dataset.color = color;
  waistButton.style.background = color;
  waistButton.setAttribute('aria-label', `Usar cor ${color} na cintura`);
  waistButton.addEventListener('click', () => {
    setWaistColor(color);
    closeEditorOnMobileChoice();
  });
  waistSwatches.appendChild(waistButton);

  const feetButton = document.createElement('button');
  feetButton.type = 'button';
  feetButton.className = 'swatch';
  feetButton.dataset.color = color;
  feetButton.style.background = color;
  feetButton.setAttribute('aria-label', `Usar cor ${color} nos pes`);
  feetButton.addEventListener('click', () => {
    setFeetColor(color);
    closeEditorOnMobileChoice();
  });
  feetSwatches.appendChild(feetButton);

  const armButton = document.createElement('button');
  armButton.type = 'button';
  armButton.className = 'swatch';
  armButton.dataset.color = color;
  armButton.style.background = color;
  armButton.setAttribute('aria-label', `Usar cor ${color} na manga curta`);
  armButton.addEventListener('click', () => {
    setArmsColor(color);
    closeEditorOnMobileChoice();
  });
  armSwatches.appendChild(armButton);
});

document.querySelectorAll('.hit-area').forEach((area) => {
  area.addEventListener('click', (event) => openEditor(area.dataset.part, event));
});

pantsPicker.addEventListener('input', (event) => setPantsColor(event.target.value));
waistPicker.addEventListener('input', (event) => setWaistColor(event.target.value));
feetPicker.addEventListener('input', (event) => setFeetColor(event.target.value));
armsPicker.addEventListener('input', (event) => setArmsColor(event.target.value));
pantsPicker.addEventListener('change', closeEditorOnMobileChoice);
waistPicker.addEventListener('change', closeEditorOnMobileChoice);
feetPicker.addEventListener('change', closeEditorOnMobileChoice);
armsPicker.addEventListener('change', closeEditorOnMobileChoice);
pantsModeButton.addEventListener('click', () => {
  setPantsMode('pants');
  closeEditorOnMobileChoice();
});
shortsModeButton.addEventListener('click', () => {
  setPantsMode('shorts');
  closeEditorOnMobileChoice();
});
shortSleeveButton.addEventListener('click', () => {
  setSleeveMode('short');
  closeEditorOnMobileChoice();
});
longSleeveButton.addEventListener('click', () => {
  setSleeveMode('long');
  closeEditorOnMobileChoice();
});
shirtUpload.addEventListener('change', (event) => readUpload(event.target.files[0], 'shirt'));
faceUpload.addEventListener('change', (event) => readUpload(event.target.files[0], 'face'));

clearShirt.addEventListener('click', () => clearImage('shirt', shirtUpload));
clearFace.addEventListener('click', () => clearImage('face', faceUpload));
resetShirtImage.addEventListener('click', () => resetImageTransform('shirt'));
resetFaceImage.addEventListener('click', () => resetImageTransform('face'));
closePopover.addEventListener('click', () => editorPopover.classList.add('hidden'));
savePdfButton.addEventListener('click', exportStickersToPdf);
removeImageHandle.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  if (!activeImagePart) return;

  clearImage(activeImagePart, activeImagePart === 'shirt' ? shirtUpload : faceUpload);
});

controlMoveArea.addEventListener('pointerdown', (event) => startTransformDrag(event, 'move'));
rotateHandle.addEventListener('pointerdown', (event) => startTransformDrag(event, 'rotate'));
resizeHandles.forEach((handle) => {
  handle.addEventListener('pointerdown', (event) => startTransformDrag(event, 'scale'));
});

figureSvg.addEventListener('pointermove', updateTransformDrag);
figureSvg.addEventListener('pointerup', stopTransformDrag);
figureSvg.addEventListener('pointercancel', stopTransformDrag);

resetButton.addEventListener('click', () => {
  clearImage('shirt', shirtUpload);
  clearImage('face', faceUpload);
  setPantsColor(swatchColors[0]);
  setPantsMode('pants');
  setWaistColor(swatchColors[0]);
  setFeetColor('#0745a8');
  setArmsColor('#d72d16');
  setSleeveMode('short');
  editorPopover.classList.add('hidden');
  selectPart('pants');
});

setPantsColor(activeColor);
setPantsMode(pantsMode);
setWaistColor(activeWaistColor);
setFeetColor(activeFeetColor);
setArmsColor(activeArmsColor);
setSleeveMode(sleeveMode);
selectPart(selectedPart);
