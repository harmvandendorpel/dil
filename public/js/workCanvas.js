
var canvas = null;
var ctx = null;

var generate = false;
// var parents = [
//   "101000011000100001110100111000110000101101001110000100101100011011010100110011000011110101001101010101001100110100100111001111100010000010010101100101100110110101110101101010010001010101101000111010001111000000100010100110000100000110000011101101101000011100111000010101110100100011",
//   "101000011000100001110100111000110000101101001110000100101100011011010100110011000011110101001101010101001100110100100111001111100010000010010101100101100110110101110101101010010001010101101000111010001111000000100010100110000100000110000011101101101000011100111000010101110100100011"
// ];

var dna = '';
var cursor = 0;

function newDna(parents) {
  var result = "";

  if (parents[0].length !== parents[1].length) {
    throw "parent dna string lengths do not match";
  }

  for (var i = 0; i < parents[0].length; i++) {
    var a = parents[0].charAt(i);
    var b = parents[1].charAt(i);
    result += Math.random() > 0.5 ? a:b;
  }

  return result;
}

Array.prototype.random = function () {
  var index = Math.round((this.length-1) * (Math.random()));
  return this[index];
};

function pad(n) {
  var nString = n.toString();
  while (nString.length < 3) {
    nString = '0' + nString;
  }
  return nString + '.png';
}


function grayscale(imageData, percentage) {
  var strength = percentage / 100;
  var data = imageData.data;
  for(var i = 0; i < data.length; i += 4) {
    var brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
    data[i + 0] = brightness * strength + data[i + 0] * (1-strength);
    data[i + 1] = brightness * strength + data[i + 1] * (1-strength);
    data[i + 2] = brightness * strength + data[i + 2] * (1-strength);
    data[i + 3] = data[i + 3];
  }
  return imageData;
}

function createLayer(cssClass, elements, trans, done) {
  var showLayer = getN(1, 'show this layer?');

  if (trans) {
    ctx.globalCompositeOperation = "multiply";
  } else {
    ctx.globalCompositeOperation = "source-over";
  }

  var elementIndex = getN(elements.length - 1, 'figure out what kind of organ');
  var organ = elements[elementIndex];
  var layerIndex = getN(organ.el.length - 1, 'figure out which element from the organ type');
  var filename = organ.el[layerIndex].f;
  var url = '/images/organs/' + organ.folder + '/' + filename + '.png';
  var rotationIndex = getN(rotateClasses.length-1, 'get rotation');
  var rotation = rotateClasses[rotationIndex];
  var hueValue = getN(360, 'get hue color value');
  var setsGrayscale = getN(1, 'set grayscale');
  var grayScalePercentage = getN(100, 'get grayscale value');
  var brightnessPercentage = getN(100, 'get brightness value') + 100;
  var contrastPercentage = getN(100, 'get constrast value') + 100;

  var img = new Image();

  img.onload = function () {
    var needsRestore = false;
    var tempCanvas = createOffscreenCanvas(img.width, img.height);
    var imageContext = tempCanvas.getContext('2d');
    imageContext.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);

    var imageData = imageContext.getImageData(0,0, tempCanvas.width, tempCanvas.height);
    if (!organ.fixedColor) {
      if (setsGrayscale) {
        imageData = grayscale(imageData, grayScalePercentage);
      }
      imageData = hueRotate(imageData, hueValue);

      imageData = brightness(imageData, brightnessPercentage);
      imageData = contrast(imageData, contrastPercentage);
    }

    imageContext.putImageData(imageData,0,0);

    if (organ.canRotate && rotation !== null ) {
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rotation * Math.PI/180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
      needsRestore = true;
    }

    if (showLayer) {
      ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
    }

    if (needsRestore) {
      ctx.restore();
    }

    done();
  };


  img.src = url;
}

function createOffscreenCanvas(width,height){
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}


function dec2bin(dec){
  var s = (dec >>> 0).toString(2);
  while (s.length <= 16) {
    s = '0' + s;
  }
  return s;
}

function getN(maxValue) {
  var bitsCount = Math.floor(Math.log(maxValue) / Math.LN2) + 1;
  bitsCount = Math.max(1, bitsCount);
  var result = null;

  if (generate) {
    result = Math.round(Math.random() * maxValue);

    var bits = dec2bin(result);

    bits = bits.substring(bits.length - bitsCount);
    dna += bits;
  } else {
    var value = dna.substring(cursor, cursor + bitsCount);

    cursor += bitsCount;
    result = parseInt(value, 2);
    result = Math.min(result, maxValue);
  }
  return result;
}

function makePiece() {
  cursor = 0;

  ctx.fillStyle = 'white';

  ctx.fillRect(0, 0, canvas.width, canvas.height);
  console.log('start');
  createLayer('back-print', organs, false, function () {
    createLayer('foil',       foils,  true, function () {
      createLayer('organ-01',   organs, true, function () {
        createLayer('organ-02',   organs, true, function () {
          createLayer('organ-03',   organs, true, function () {
            createLayer('things',     things, false, function () {
              createLayer('cuts',       cuts,   false, function () {
                var dataURL = canvas.toDataURL("image/jpeg", 0.9);
                $.ajax({
                  url: '/api/saveimage',
                  dataType:'json',
                  data: {
                    image: dataURL,
                    chromosome: window.chromosome,
                    hash: window.hash
                  },
                  method:'post'
                }).done(function (data) {
                  console.log('???');
                  location.href = location.href;
                });
              });
            });
          });
        });
      });
    });
  });
}

function hueRotate(imageData, degrees) {
  var data = imageData.data;
  var amount = degrees / 360;
  for(var i = 0; i < data.length; i += 4) {
    var hsl = rgbToHsl(data[i], data[i+1], data[i+2]);
    hsl[0] += amount;
    hsl[0] %= 1;
    var rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
    data[i    ] = rgb[0];
    data[i + 1] = rgb[1];
    data[i + 2] = rgb[2];
  }
  return imageData;
}

function contrast(imageData, percentage) {
  var value = percentage / 100;
  var d = imageData.data;
  var intercept = 255 * (-value / 2 + 0.5);
  for(var i = 0;i < d.length; i += 4){
    d[i  ] = d[i  ] * value + intercept;
    d[i+1] = d[i+1] * value + intercept;
    d[i+2] = d[i+2] * value + intercept;

    if(d[i]   > 255) d[i  ] = 255;
    if(d[i+1] > 255) d[i+1] = 255;
    if(d[i+2] > 255) d[i+2] = 255;
    if(d[i]   < 0)   d[i  ] = 0;
    if(d[i+1] < 0)   d[i+1] = 0;
    if(d[i+2] < 0)   d[i+2] = 0;
  }
  return imageData;
}

function brightness(imageData, percent){
  var d = imageData.data;
  var mul = percent / 100;

  for (var i = 0; i < d.length; i += 4) {
    var r = d[i    ];
    var g = d[i + 1];
    var b = d[i + 2];

    d[i    ] = r * mul;
    d[i + 1] = g * mul;
    d[i + 2] = b * mul;

    if (d[i]   > 255) d[i  ] = 255;
    if (d[i+1] > 255) d[i+1] = 255;
    if (d[i+2] > 255) d[i+2] = 255;
    if (d[i]   < 0)   d[i  ] = 0;
    if (d[i+1] < 0)   d[i+1] = 0;
    if (d[i+2] < 0)   d[i+2] = 0;
  }

  return imageData;
}

function hslToRgb(h, s, l){
  var r, g, b;

  if(s == 0){
    r = g = b = l; // achromatic
  }else{
    var hue2rgb = function hue2rgb(p, q, t){
      if(t < 0) t += 1;
      if(t > 1) t -= 1;
      if(t < 1/6) return p + (q - p) * 6 * t;
      if(t < 1/2) return q;
      if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHsl(r, g, b){
  r /= 255, g /= 255, b /= 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if(max == min){
    h = s = 0; // achromatic
  }else{
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch(max){
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h, s, l];
}

function run() {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  canvas.width = 1800;
  canvas.height = 1800;
  canvas.style.width = canvas.width / 1 + 'px';
  canvas.style.height = canvas.height / 1 + 'px';

  // if (!generate) {
  //   dna = newDna(parents);
  dna = window.chromosome;
    // console.log(dna);
  makePiece();
  // } else {
  //   makePiece();
  //   console.log(dna);
  // }
}


$(document).ready(run);