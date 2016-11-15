import { reduce } from 'lodash';
import $ from 'jquery';
import {
  hueRotate,
  brightness,
  grayscale,
  blur,
  contrast,
  invert
} from './color';

import {
  foils,
  cuts,
  rotateClasses,
  things,
  organs,
  layerGroups
} from './props';

const state = {
  canvas: null,
  ctx: null,
  dna: '',
  cursor: 0
};

function createOffScreenCanvas(width, height) {
  const offScreenCanvas = document.createElement('canvas');
  offScreenCanvas.width = width;
  offScreenCanvas.height = height;
  return offScreenCanvas;
}

function constructLayer(img, layerProps, organ, layerName) {
  let rotation = rotateClasses[layerProps.rotationIndex];
  const no45 = organ.el[layerProps.layerIndex].no45;
  const tempCanvas = createOffScreenCanvas(img.width, img.height);
  const imageContext = tempCanvas.getContext('2d');
  imageContext.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);

  let imageData = imageContext.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

  if (layerProps.doInvert) {
    imageData = invert(imageData);
  }

  if (!organ.fixedColor) {
    imageData = grayscale(imageData, layerProps.grayScalePercentage);
    imageData = hueRotate(imageData, layerProps.hueValue);

    imageData = brightness(imageData, layerProps.brightnessPercentage);
    imageData = contrast(imageData, layerProps.contrastPercentage);
  }

  if (layerProps.blur > 24 && organ.canBlur) {
    imageData = blur(imageData, (layerProps.blur - 24) * 20);
  }

  imageContext.putImageData(imageData, 0, 0);

  state.ctx.save();
  state.ctx.translate(state.canvas.width / 2, state.canvas.height / 2);
  if (rotation != null && organ.canRotate) {
    rotation = no45 ? rotation * 2 : rotation;
    state.ctx.rotate(rotation * Math.PI / 180);
  }

  let xScale = layerProps.scaleFactor;
  let yScale = layerProps.scaleFactor;

  if (layerProps.mirrorHorizontal === 1) {
    xScale *= -1;
  }

  if (layerProps.mirrorVertical === 1) {
    yScale *= -1;
  }

  let dx = 0;
  let dy = 0;

  if (organ.canScale && layerProps.doMove > 8) {
    xScale *= layerProps.scaleX;
    yScale *= layerProps.scaleY;

    if (layerProps.doMove > 11) {
      const maxXTranslate = state.canvas.width - xScale * state.canvas.width;
      const maxYTranslate = state.canvas.height - yScale * state.canvas.height;
      dx = (layerProps.moveX - 0.5) * maxXTranslate;
      dy = (layerProps.moveY - 0.5) * maxYTranslate;
    }
  }

  state.ctx.scale(xScale, yScale);
  state.ctx.translate(-state.canvas.width / 2 + dx, -state.canvas.height / 2 + dy);

  if (layerProps.showLayer &&
    (
      window.layer === null ||
      layerGroups[window.layer].indexOf(layerName) !== -1)
    ) {
    state.ctx.drawImage(tempCanvas, 0, 0, state.canvas.width, state.canvas.height);
  }

  state.ctx.restore();
}

function getN(maxValue) {
  let bitsCount = Math.floor(Math.log(maxValue) / Math.LN2) + 1;
  bitsCount = Math.max(1, bitsCount);

  const value = state.dna.substring(state.cursor, state.cursor + bitsCount);

  state.cursor += bitsCount;
  let result = parseInt(value, 2);
  result = Math.min(result, maxValue);
  return result;
}

function createLayer(layerName, elements, trans) {
  console.log(`- create layer ${layerName}`);
  const layerProps = {
    scaleFactor: 1,
    showLayer: getN(7, 'show this layer?') > 2,
    elementIndex: getN(elements.length - 1, 'figure out what kind of organ'),
    layerIndex: getN(31, 'figure out which element from the organ type'),
    rotationIndex: getN(rotateClasses.length - 1, 'get rotation'),
    hueValue: getN(255, 'get hue color value') / 255 * 360,
    useWhiteChannel: getN(1, 'use whitechannel'),
    grayScalePercentage: getN(127, 'get grayscale value') / 127 * 100,
    brightnessPercentage: getN(127, 'get brightness value') / 127 * 300,
    contrastPercentage: getN(127, 'get constrast value') / 127 * 200,
    mirrorHorizontal: getN(1, 'mirror horizontal'),
    mirrorVertical: getN(1, 'mirror vertical'),
    doInvert: getN(3, 'invert') > 2,
    blur: getN(31, 'blur'),
    doMove: getN(15, 'move?'), // 4 bits
    moveX: getN(31, 'move x') / 32, // 5 bits
    moveY: getN(31, 'move y') / 32, // 5 bits
    unused: getN(15, 'unused'),
    scaleX: getN(31, 'scale x') / 32 + 1,  // 5 bits
    scaleY: getN(31, 'scale y') / 32 + 1,  // 5 bits
    futureDNASpace: getN(Math.pow(2, 18), 'future dna pos') // 46 bits
  };

  state.ctx.globalCompositeOperation = trans ? 'multiply' : 'source-over';

  const organ = elements[layerProps.elementIndex];
  const filename = organ.el[layerProps.layerIndex].f;
  const url = `/images/organs/${organ.folder}/${filename}.png`;

  const img = new Image();

  return new Promise(resolve => {
    img.onload = () => {
      constructLayer(img, layerProps, organ, layerName);
      resolve();
    };
    img.src = url;
  });
}

function saveToServer(dataURL) {
  return new Promise(resolve => {
    $.ajax({
      url: '/api/saveimage',
      dataType: 'json',
      data: {
        image: dataURL,
        chromosome: window.chromosome,
        hash: window.hash
      },
      method: 'post'
    }).done(() => {
      console.log('...sent');
      resolve();
    });
  });
}

function allDone() {
  console.log('send to server...');
  const dataURL = state.canvas.toDataURL('image/jpeg', 0.9);
  console.log(dataURL.length);
  return saveToServer(dataURL);
}

function makePiece() {
  state.cursor = 0;

  state.ctx.fillStyle = 'white';
  state.ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);

  const newLayers = [
    ['back-print', organs, false],
    ['organ-00', organs, true],
    ['foil', foils, false],
    ['organ-01', organs, true],
    ['organ-02', organs, true],
    ['organ-03', organs, true],
    ['things', things, false],
    ['cuts', cuts, false]
  ];

  const allLayersCreated = reduce(newLayers, (p, newLayer) =>
    p.then(() => createLayer(...newLayer))
  , Promise.resolve());

  allLayersCreated.then(allDone).then(() => {
    console.log('ready');
    location.href = location.href;
  });
}

function run() {
  state.canvas = document.getElementById('canvas');
  state.ctx = state.canvas.getContext('2d');

  state.canvas.width = state.canvas.height = 1800;
  state.canvas.style.width = `${state.canvas.width}px`;
  state.canvas.style.height = `${state.canvas.height}px`;

  state.dna = window.chromosome;

  makePiece();
}

$(document).ready(run);
