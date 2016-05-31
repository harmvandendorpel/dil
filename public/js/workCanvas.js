
var layerGroups = {
  backPrint : ['back-print','organ-00'],
  foil :['foil'],
  frontPrint1: ['organ-01'],
  frontPrint2: ['organ-02'],
  frontPrint3: ['organ-03'],
  things:['things'],
  CNC: ['cuts']
};

var mutationRate = Math.pow(10, -8);
var canvas = null;
var ctx = null;

var debugMode = false;
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

function alpha(imageData, value) {
  var data = imageData.data;
  for(var i = 0; i < data.length; i += 4) {
    data[i + 3] = 0.1;//data[i + 3] * value;
  }
  return imageData;
}

function createLayer(layerName, elements, trans, done) {
  var layerProps = {
  
    scaleFactor           :  1,
    showLayer             :  getN(7, 'show this layer?') >  2,
    elementIndex          :  getN(elements.length - 1, 'figure out what kind of organ'),
    layerIndex            :  getN(31, 'figure out which element from the organ type'),
    rotationIndex         :  getN(rotateClasses.length - 1, 'get rotation'),
    hueValue              :  getN(255, 'get hue color value')  / 255 * 360,
    useWhiteChannel       :  getN(1,   'use whitechannel'),
    grayScalePercentage   :  getN(127, 'get grayscale value')  / 127 * 100,
    brightnessPercentage  :  getN(127, 'get brightness value') / 127 * 300,
    contrastPercentage    :  getN(127, 'get constrast value')  / 127 * 200,
    mirrorHorizontal      :  getN(1,   'mirror horizontal'),
    mirrorVertical        :  getN(1,   'mirror vertical'),
    doInvert              :  getN(3,  'invert') > 2,
    blur                  :  getN(31,  'blur'),

    futureDNASpace        :  getN(1024  * 1024 * 1024 * 1024 * 64, 'future dna pos')
  };




  if (trans) {
    ctx.globalCompositeOperation = "multiply";
  } else {
    ctx.globalCompositeOperation = "source-over";
  }

  var organ = elements[layerProps.elementIndex];
  var filename = organ.el[layerProps.layerIndex].f;
  var url = '/images/organs/' + organ.folder + '/' + filename + '.png';
  var rotation = rotateClasses[layerProps.rotationIndex];

  var img = new Image();

  img.onload = function () {
    var tempCanvas = createOffscreenCanvas(img.width, img.height);
    var imageContext = tempCanvas.getContext('2d');
    imageContext.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);

    var imageData = imageContext.getImageData(0,0, tempCanvas.width, tempCanvas.height);

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
      imageData = blur(imageData, (layerProps.blur - 24)*20);
    }

    imageContext.putImageData(imageData,0,0);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    if (rotation != null && organ.canRotate) {
      ctx.rotate(rotation * Math.PI / 180);
    }
    
    if (layerProps.mirrorHorizontal === 1) {
      ctx.scale(-layerProps.scaleFactor, layerProps.scaleFactor);
    }

    if (layerProps.mirrorVertical === 1) {
      ctx.scale(layerProps.scaleFactor, -layerProps.scaleFactor);
    }

    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    if (layerProps.showLayer && (window.layer === null || layerGroups[window.layer].indexOf(layerName) !== -1)) {
      ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
    }

    ctx.restore();

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

function getN(maxValue, comment) {

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

function invert(imageData) {
  var d = imageData.data;
  for(var i = 0;i < d.length; i += 4){
    d[i  ] = 255 - d[i  ];
    d[i+1] = 255 - d[i+1];
    d[i+2] = 255 - d[i+2];
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
  } else {
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

function makePiece() {
  cursor = 0;

  ctx.fillStyle = 'white';



  ctx.fillRect(0, 0, canvas.width, canvas.height);
  createLayer('back-print', organs, false, function () {
    createLayer('organ-00',   organs, true, function () {
      createLayer('foil',       foils,  false , function () {
        createLayer('organ-01',   organs, true, function () {
          createLayer('organ-02',   organs, true, function () {
            createLayer('organ-03',   organs, true, function () {
              createLayer('things',     things, false, function () {
                createLayer('cuts',       cuts,   false, function () {
                  var dataURL = canvas.toDataURL("image/jpeg", 0.9);
                  if (window.save) {
                    saveToServer(dataURL);
                  } else {
                    $('#btn-download').show();
                  }
                });
              });
            });
          });
        });
      });
    });
  });
}

function saveToServer(dataURL) {
  if (!window.save) return;
  
  $.ajax({
    url: '/api/saveimage',
    dataType: 'json',
    data: {
      image: dataURL,
      chromosome: window.chromosome,
      hash: window.hash
    },
    method: 'post'
  }).done(function (data) {
    location.href = location.href;
  });
}

function run() {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  canvas.width = canvas.height = 1800;
  canvas.style.width  = canvas.width  / 1 + 'px';
  canvas.style.height = canvas.height / 1 + 'px';

  if (!generate) {
    dna = window.chromosome;
  }

  var button = document.getElementById('btn-download');

  $(button).hide();
  if (!window.save) {
    button.addEventListener('click', function() {
      this.href = canvas.toDataURL();
      this.download = window.hash + '-' + window.layer + '.png';
    }, false);
  }
  makePiece();
}


var mul_table = [
  512,512,456,512,328,456,335,512,405,328,271,456,388,335,292,512,
  454,405,364,328,298,271,496,456,420,388,360,335,312,292,273,512,
  482,454,428,405,383,364,345,328,312,298,284,271,259,496,475,456,
  437,420,404,388,374,360,347,335,323,312,302,292,282,273,265,512,
  497,482,468,454,441,428,417,405,394,383,373,364,354,345,337,328,
  320,312,305,298,291,284,278,271,265,259,507,496,485,475,465,456,
  446,437,428,420,412,404,396,388,381,374,367,360,354,347,341,335,
  329,323,318,312,307,302,297,292,287,282,278,273,269,265,261,512,
  505,497,489,482,475,468,461,454,447,441,435,428,422,417,411,405,
  399,394,389,383,378,373,368,364,359,354,350,345,341,337,332,328,
  324,320,316,312,309,305,301,298,294,291,287,284,281,278,274,271,
  268,265,262,259,257,507,501,496,491,485,480,475,470,465,460,456,
  451,446,442,437,433,428,424,420,416,412,408,404,400,396,392,388,
  385,381,377,374,370,367,363,360,357,354,350,347,344,341,338,335,
  332,329,326,323,320,318,315,312,310,307,304,302,299,297,294,292,
  289,287,285,282,280,278,275,273,271,269,267,265,263,261,259];


var shg_table = [
  9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17,
  17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19,
  19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20,
  20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21,
  21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
  21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22,
  22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
  22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23,
  23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
  23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
  23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
  23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
  24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
  24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
  24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
  24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24 ];

function blur( imageData,  radius ) {
  if ( isNaN(radius) || radius < 1 ) return;
  radius |= 0;

  // var top_x = 0;
  // var top_y = 0;
  var width = imageData.width;
  var height = imageData.height;


  // var canvas  = document.getElementById( id );
  // var context = canvas.getContext("2d");
  // var imageData;

  // try {
  //   try {
  // imageData = context.getImageData( top_x, top_y, width, height );
  //   } catch(e) {
  //
  //     // NOTE: this part is supposedly only needed if you want to work with local files
  //     // so it might be okay to remove the whole try/catch block and just use
  //     // imageData = context.getImageData( top_x, top_y, width, height );
  //     try {
  //       netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
  //       imageData = context.getImageData( top_x, top_y, width, height );
  //     } catch(e) {
  //       alert("Cannot access local image");
  //       throw new Error("unable to access local image data: " + e);
  //       return;
  //     }
  //   }
  // } catch(e) {
  //   alert("Cannot access image");
  //   throw new Error("unable to access image data: " + e);
  // }

  var pixels = imageData.data;

  var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum,
    r_out_sum, g_out_sum, b_out_sum, a_out_sum,
    r_in_sum, g_in_sum, b_in_sum, a_in_sum,
    pr, pg, pb, pa, rbs;

  var div = radius + radius + 1;
  var w4 = width << 2;
  var widthMinus1  = width - 1;
  var heightMinus1 = height - 1;
  var radiusPlus1  = radius + 1;
  var sumFactor = radiusPlus1 * ( radiusPlus1 + 1 ) / 2;

  var stackStart = new BlurStack();
  var stack = stackStart;
  for ( i = 1; i < div; i++ )
  {
    stack = stack.next = new BlurStack();
    if ( i == radiusPlus1 ) var stackEnd = stack;
  }
  stack.next = stackStart;
  var stackIn = null;
  var stackOut = null;

  yw = yi = 0;

  var mul_sum = mul_table[radius];
  var shg_sum = shg_table[radius];

  for ( y = 0; y < height; y++ )
  {
    r_in_sum = g_in_sum = b_in_sum = a_in_sum = r_sum = g_sum = b_sum = a_sum = 0;

    r_out_sum = radiusPlus1 * ( pr = pixels[yi] );
    g_out_sum = radiusPlus1 * ( pg = pixels[yi+1] );
    b_out_sum = radiusPlus1 * ( pb = pixels[yi+2] );
    a_out_sum = radiusPlus1 * ( pa = pixels[yi+3] );

    r_sum += sumFactor * pr;
    g_sum += sumFactor * pg;
    b_sum += sumFactor * pb;
    a_sum += sumFactor * pa;

    stack = stackStart;

    for( i = 0; i < radiusPlus1; i++ )
    {
      stack.r = pr;
      stack.g = pg;
      stack.b = pb;
      stack.a = pa;
      stack = stack.next;
    }

    for( i = 1; i < radiusPlus1; i++ )
    {
      p = yi + (( widthMinus1 < i ? widthMinus1 : i ) << 2 );
      r_sum += ( stack.r = ( pr = pixels[p])) * ( rbs = radiusPlus1 - i );
      g_sum += ( stack.g = ( pg = pixels[p+1])) * rbs;
      b_sum += ( stack.b = ( pb = pixels[p+2])) * rbs;
      a_sum += ( stack.a = ( pa = pixels[p+3])) * rbs;

      r_in_sum += pr;
      g_in_sum += pg;
      b_in_sum += pb;
      a_in_sum += pa;

      stack = stack.next;
    }


    stackIn = stackStart;
    stackOut = stackEnd;
    for ( x = 0; x < width; x++ )
    {
      pixels[yi+3] = pa = (a_sum * mul_sum) >> shg_sum;
      if ( pa != 0 )
      {
        pa = 255 / pa;
        pixels[yi]   = ((r_sum * mul_sum) >> shg_sum) * pa;
        pixels[yi+1] = ((g_sum * mul_sum) >> shg_sum) * pa;
        pixels[yi+2] = ((b_sum * mul_sum) >> shg_sum) * pa;
      } else {
        pixels[yi] = pixels[yi+1] = pixels[yi+2] = 0;
      }

      r_sum -= r_out_sum;
      g_sum -= g_out_sum;
      b_sum -= b_out_sum;
      a_sum -= a_out_sum;

      r_out_sum -= stackIn.r;
      g_out_sum -= stackIn.g;
      b_out_sum -= stackIn.b;
      a_out_sum -= stackIn.a;

      p =  ( yw + ( ( p = x + radius + 1 ) < widthMinus1 ? p : widthMinus1 ) ) << 2;

      r_in_sum += ( stackIn.r = pixels[p]);
      g_in_sum += ( stackIn.g = pixels[p+1]);
      b_in_sum += ( stackIn.b = pixels[p+2]);
      a_in_sum += ( stackIn.a = pixels[p+3]);

      r_sum += r_in_sum;
      g_sum += g_in_sum;
      b_sum += b_in_sum;
      a_sum += a_in_sum;

      stackIn = stackIn.next;

      r_out_sum += ( pr = stackOut.r );
      g_out_sum += ( pg = stackOut.g );
      b_out_sum += ( pb = stackOut.b );
      a_out_sum += ( pa = stackOut.a );

      r_in_sum -= pr;
      g_in_sum -= pg;
      b_in_sum -= pb;
      a_in_sum -= pa;

      stackOut = stackOut.next;

      yi += 4;
    }
    yw += width;
  }


  for ( x = 0; x < width; x++ )
  {
    g_in_sum = b_in_sum = a_in_sum = r_in_sum = g_sum = b_sum = a_sum = r_sum = 0;

    yi = x << 2;
    r_out_sum = radiusPlus1 * ( pr = pixels[yi]);
    g_out_sum = radiusPlus1 * ( pg = pixels[yi+1]);
    b_out_sum = radiusPlus1 * ( pb = pixels[yi+2]);
    a_out_sum = radiusPlus1 * ( pa = pixels[yi+3]);

    r_sum += sumFactor * pr;
    g_sum += sumFactor * pg;
    b_sum += sumFactor * pb;
    a_sum += sumFactor * pa;

    stack = stackStart;

    for( i = 0; i < radiusPlus1; i++ )
    {
      stack.r = pr;
      stack.g = pg;
      stack.b = pb;
      stack.a = pa;
      stack = stack.next;
    }

    yp = width;

    for( i = 1; i <= radius; i++ )
    {
      yi = ( yp + x ) << 2;

      r_sum += ( stack.r = ( pr = pixels[yi])) * ( rbs = radiusPlus1 - i );
      g_sum += ( stack.g = ( pg = pixels[yi+1])) * rbs;
      b_sum += ( stack.b = ( pb = pixels[yi+2])) * rbs;
      a_sum += ( stack.a = ( pa = pixels[yi+3])) * rbs;

      r_in_sum += pr;
      g_in_sum += pg;
      b_in_sum += pb;
      a_in_sum += pa;

      stack = stack.next;

      if( i < heightMinus1 )
      {
        yp += width;
      }
    }

    yi = x;
    stackIn = stackStart;
    stackOut = stackEnd;
    for ( y = 0; y < height; y++ )
    {
      p = yi << 2;
      pixels[p+3] = pa = (a_sum * mul_sum) >> shg_sum;
      if ( pa > 0 )
      {
        pa = 255 / pa;
        pixels[p]   = ((r_sum * mul_sum) >> shg_sum ) * pa;
        pixels[p+1] = ((g_sum * mul_sum) >> shg_sum ) * pa;
        pixels[p+2] = ((b_sum * mul_sum) >> shg_sum ) * pa;
      } else {
        pixels[p] = pixels[p+1] = pixels[p+2] = 0;
      }

      r_sum -= r_out_sum;
      g_sum -= g_out_sum;
      b_sum -= b_out_sum;
      a_sum -= a_out_sum;

      r_out_sum -= stackIn.r;
      g_out_sum -= stackIn.g;
      b_out_sum -= stackIn.b;
      a_out_sum -= stackIn.a;

      p = ( x + (( ( p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1 ) * width )) << 2;

      r_sum += ( r_in_sum += ( stackIn.r = pixels[p]));
      g_sum += ( g_in_sum += ( stackIn.g = pixels[p+1]));
      b_sum += ( b_in_sum += ( stackIn.b = pixels[p+2]));
      a_sum += ( a_in_sum += ( stackIn.a = pixels[p+3]));

      stackIn = stackIn.next;

      r_out_sum += ( pr = stackOut.r );
      g_out_sum += ( pg = stackOut.g );
      b_out_sum += ( pb = stackOut.b );
      a_out_sum += ( pa = stackOut.a );

      r_in_sum -= pr;
      g_in_sum -= pg;
      b_in_sum -= pb;
      a_in_sum -= pa;

      stackOut = stackOut.next;

      yi += width;
    }
  }

  // context.putImageData( imageData, top_x, top_y );
  return imageData;
}

function BlurStack()
{
  this.r = 0;
  this.g = 0;
  this.b = 0;
  this.a = 0;
  this.next = null;
}



$(document).ready(run);