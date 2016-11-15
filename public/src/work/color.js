export function hslToRgb(h, s, l) {
  let r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    let hue2rgb = function hue2rgb(p, q, t) {
      if(t < 0) t += 1;
      if(t > 1) t -= 1;
      if(t < 1/6) return p + (q - p) * 6 * t;
      if(t < 1/2) return q;
      if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

export function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if(max == min){
    h = s = 0; // achromatic
  }else{
    let d = max - min;
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

export function hueRotate(imageData, degrees) {
  let data = imageData.data;
  let amount = degrees / 360;
  for(let i = 0; i < data.length; i += 4) {
    let hsl = rgbToHsl(data[i], data[i+1], data[i+2]);
    hsl[0] += amount;
    hsl[0] %= 1;
    const rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
    data[i] = rgb[0];
    data[i + 1] = rgb[1];
    data[i + 2] = rgb[2];
  }
  return imageData;
}

export function contrast(imageData, percentage) {
  let value = percentage / 100;
  let d = imageData.data;
  let intercept = 255 * (-value / 2 + 0.5);
  for(let i = 0;i < d.length; i += 4){
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

export function invert(imageData) {
  let d = imageData.data;
  for(let i = 0;i < d.length; i += 4){
    d[i  ] = 255 - d[i  ];
    d[i+1] = 255 - d[i+1];
    d[i+2] = 255 - d[i+2];
  }
  return imageData;
}

export function brightness(imageData, percent) {
  const d = imageData.data;
  const mul = percent / 100;

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i    ];
    let g = d[i + 1];
    let b = d[i + 2];

    d[i    ] = r * mul;
    d[i + 1] = g * mul;
    d[i + 2] = b * mul;

    if (d[i]   > 255) d[i] = 255;
    if (d[i + 1] > 255) d[i + 1] = 255;
    if (d[i + 2] > 255) d[i + 2] = 255;
    if (d[i]   < 0) d[i  ] = 0;
    if (d[i + 1] < 0) d[i + 1] = 0;
    if (d[i + 2] < 0) d[i + 2] = 0;
  }

  return imageData;
}


export function grayscale(imageData, percentage) {
  const strength = percentage / 100;
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    let brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
    data[i] = brightness * strength + data[i] * (1 - strength);
    data[i + 1] = brightness * strength + data[i + 1] * (1 - strength);
    data[i + 2] = brightness * strength + data[i + 2] * (1 - strength);
    data[i + 3] = data[i + 3];
  }
  return imageData;
}

export function alpha(imageData, value) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i + 3] = 0.1; // data[i + 3] * value;
  }
  return imageData;
}

const mul_table = [
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


const shg_table = [
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

function BlurStack() {
  this.r = 0;
  this.g = 0;
  this.b = 0;
  this.a = 0;
  this.next = null;
}

export function blur(imageData,  radius) {
  if (isNaN(radius) || radius < 1) return;
  radius |= 0;

  // let top_x = 0;
  // let top_y = 0;
  const width = imageData.width;
  const height = imageData.height;

  // let canvas  = document.getElementById( id );
  // let context = canvas.getContext("2d");
  // let imageData;

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

  const pixels = imageData.data;

  let x;
  let y;
  let i;
  let p;
  let yp;
  let yi;
  let yw;
  let redSum;
  let greenSum;
  let blueSum;
  let alphaSum;
  let redOutSum;
  let greenOutSum;
  let blueOutSum;
  let alphaOutSum;
  let redInSum;
  let greenInSum;
  let blueInSum;
  let alphaInSum;
  let pr;
  let pg;
  let pb;
  let pa;
  let rbs;

  let div = radius + radius + 1;
  let widthMinus1 = width - 1;
  let heightMinus1 = height - 1;
  let radiusPlus1 = radius + 1;
  let sumFactor = radiusPlus1 * (radiusPlus1 + 1) * 0.5;

  let stackStart = new BlurStack();
  let stack = stackStart;
  let stackEnd = null;

  for (let i = 1; i < div; i++) {
    stack = stack.next = new BlurStack();
    if (i === radiusPlus1) stackEnd = stack;
  }
  stack.next = stackStart;
  let stackIn = null;
  let stackOut = null;

  yw = yi = 0;

  let mulSum = mul_table[radius];
  let shgSum = shg_table[radius];

  for (let y = 0; y < height; y++) {
    redInSum = greenInSum = blueInSum = alphaInSum = redSum = greenSum = blueSum = alphaSum = 0;

    redOutSum = radiusPlus1 * ( pr = pixels[yi] );
    greenOutSum = radiusPlus1 * ( pg = pixels[yi+1] );
    blueOutSum = radiusPlus1 * ( pb = pixels[yi+2] );
    alphaOutSum = radiusPlus1 * ( pa = pixels[yi+3] );

    redSum += sumFactor * pr;
    greenSum += sumFactor * pg;
    blueSum += sumFactor * pb;
    alphaSum += sumFactor * pa;

    stack = stackStart;

    for(let i = 0; i < radiusPlus1; i++ ) {
      stack.r = pr;
      stack.g = pg;
      stack.b = pb;
      stack.a = pa;
      stack = stack.next;
    }

    for(let i = 1; i < radiusPlus1; i++) {
      p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
      redSum += (stack.r = (pr = pixels[p + 0])) * (rbs = radiusPlus1 - i);
      greenSum += (stack.g = (pg = pixels[p + 1])) * rbs;
      blueSum += (stack.b = (pb = pixels[p + 2])) * rbs;
      alphaSum += (stack.a = (pa = pixels[p + 3])) * rbs;

      redInSum += pr;
      greenInSum += pg;
      blueInSum += pb;
      alphaInSum += pa;

      stack = stack.next;
    }

    stackIn = stackStart;
    stackOut = stackEnd;

    for (let x = 0; x < width; x++) {
      pixels[yi + 3] = pa = (alphaSum * mulSum) >> shgSum;
      if (pa !== 0) {
        pa = 255 / pa;
        pixels[yi] = ((redSum * mulSum) >> shgSum) * pa;
        pixels[yi + 1] = ((greenSum * mulSum) >> shgSum) * pa;
        pixels[yi + 2] = ((blueSum * mulSum) >> shgSum) * pa;
      } else {
        pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
      }

      redSum -= redOutSum;
      greenSum -= greenOutSum;
      blueSum -= blueOutSum;
      alphaSum -= alphaOutSum;

      redOutSum -= stackIn.r;
      greenOutSum -= stackIn.g;
      blueOutSum -= stackIn.b;
      alphaOutSum -= stackIn.a;

      p = (yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1)) << 2;

      redInSum += (stackIn.r = pixels[p]);
      greenInSum += (stackIn.g = pixels[p + 1]);
      blueInSum += (stackIn.b = pixels[p + 2]);
      alphaInSum += (stackIn.a = pixels[p + 3]);

      redSum += redInSum;
      greenSum += greenInSum;
      blueSum += blueInSum;
      alphaSum += alphaInSum;

      stackIn = stackIn.next;

      redOutSum += (pr = stackOut.r);
      greenOutSum += (pg = stackOut.g);
      blueOutSum += (pb = stackOut.b);
      alphaOutSum += (pa = stackOut.a);

      redInSum -= pr;
      greenInSum -= pg;
      blueInSum -= pb;
      alphaInSum -= pa;

      stackOut = stackOut.next;

      yi += 4;
    }
    yw += width;
  }

  for (let x = 0; x < width; x++) {
    greenInSum = blueInSum = alphaInSum = redInSum = greenSum = blueSum = alphaSum = redSum = 0;

    yi = x << 2;
    redOutSum = radiusPlus1 * (pr = pixels[yi]);
    greenOutSum = radiusPlus1 * (pg = pixels[yi + 1]);
    blueOutSum = radiusPlus1 * (pb = pixels[yi + 2]);
    alphaOutSum = radiusPlus1 * (pa = pixels[yi + 3]);

    redSum += sumFactor * pr;
    greenSum += sumFactor * pg;
    blueSum += sumFactor * pb;
    alphaSum += sumFactor * pa;

    stack = stackStart;

    for (let i = 0; i < radiusPlus1; i++) {
      stack.r = pr;
      stack.g = pg;
      stack.b = pb;
      stack.a = pa;
      stack = stack.next;
    }

    yp = width;

    for (let i = 1; i <= radius; i++) {
      yi = (yp + x) << 2;

      redSum += (stack.r = (pr = pixels[yi])) * (rbs = radiusPlus1 - i);
      greenSum += (stack.g = (pg = pixels[yi + 1])) * rbs;
      blueSum += (stack.b = (pb = pixels[yi + 2])) * rbs;
      alphaSum += (stack.a = (pa = pixels[yi + 3])) * rbs;

      redInSum += pr;
      greenInSum += pg;
      blueInSum += pb;
      alphaInSum += pa;

      stack = stack.next;

      if (i < heightMinus1) {
        yp += width;
      }
    }

    yi = x;
    stackIn = stackStart;
    stackOut = stackEnd;
    for (let y = 0; y < height; y++) {
      p = yi << 2;
      pixels[p + 3] = pa = (alphaSum * mulSum) >> shgSum;
      if (pa > 0) {
        pa = 255 / pa;
        pixels[p] = ((redSum * mulSum) >> shgSum) * pa;
        pixels[p + 1] = ((greenSum * mulSum) >> shgSum) * pa;
        pixels[p + 2] = ((blueSum * mulSum) >> shgSum) * pa;
      } else {
        pixels[p] = pixels[p + 1] = pixels[p + 2] = 0;
      }

      redSum -= redOutSum;
      greenSum -= greenOutSum;
      blueSum -= blueOutSum;
      alphaSum -= alphaOutSum;

      redOutSum -= stackIn.r;
      greenOutSum -= stackIn.g;
      blueOutSum -= stackIn.b;
      alphaOutSum -= stackIn.a;

      p = (x + (((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width)) << 2;

      redSum += (redInSum += (stackIn.r = pixels[p]));
      greenSum += (greenInSum += (stackIn.g = pixels[p + 1]));
      blueSum += (blueInSum += (stackIn.b = pixels[p + 2]));
      alphaSum += (alphaInSum += (stackIn.a = pixels[p + 3]));

      stackIn = stackIn.next;

      redOutSum += (pr = stackOut.r);
      greenOutSum += (pg = stackOut.g);
      blueOutSum += (pb = stackOut.b);
      alphaOutSum += (pa = stackOut.a);

      redInSum -= pr;
      greenInSum -= pg;
      blueInSum -= pb;
      alphaInSum -= pa;

      stackOut = stackOut.next;

      yi += width;
    }
  }

  // context.putImageData( imageData, top_x, top_y );
  return imageData;
}