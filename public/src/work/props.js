export const layerGroups = {
  backPrint: ['back-print', 'organ-00'],
  foil: ['foil'],
  frontPrint1: ['organ-01'],
  frontPrint2: ['organ-02'],
  frontPrint3: ['organ-03'],
  things: ['things'],
  CNC: ['cuts']
};
//
export const foils = [{
  fixedColor: true,
  folder: 'foils',
  el: [
    { f: '000' },
    { f: '001' },
    { f: '002' },
    { f: '003' },
    { f: '004' },
    { f: '005' },
    { f: '006' },
    { f: '007' },
    { f: '008' },
    { f: '009' },
    { f: '011' },
    { f: '001' },
    { f: '012' },
    { f: '003' },
    { f: '004' },
    { f: '005' },
    { f: '006' },
    { f: '007' },
    { f: '008' },
    { f: '009' },
    { f: '000' },
    { f: '001' },
    { f: '012' },
    { f: '003' },
    { f: '004' },
    { f: '005' },
    { f: '006' },
    { f: '007' },
    { f: '008' },
    { f: '009' },
    { f: '010' },
    { f: '011' }
  ]
}];

export const things = [{
  folder: 'things',
  el: [
    { f: '000' },
    { f: '001' },
    { f: '002' },
    { f: '003' },
    { f: '004' },
    { f: '005' },
    { f: '006' },
    { f: '007' },
    { f: '008' },
    { f: '009' },
    { f: '010' },
    { f: '011' },
    { f: '012' },
    { f: '013' },
    { f: '014' },
    { f: '015' },
    { f: '016' },
    { f: '024' },
    { f: '025' },
    { f: '026' },
    { f: '022' },
    { f: '023' },
    { f: '019' },
    { f: '020' },
    { f: '027' },
    { f: '030' },
    { f: '029' },
    { f: '021' },
    { f: '028' },
    { f: '019' },
    { f: '017' },
    { f: '018' }
  ]
}];

export const cuts = [
  {
    folder: 'cuts',
    canRotate: true,
    el: [
      { f: '000' },
      { f: '001' },
      { f: '002' },
      { f: '003' },
      { f: '004' },
      { f: '005' },
      { f: '006' },
      { f: '007' },
      { f: '008' },
      { f: '009' },
      { f: '016' },
      { f: '017' },
      { f: '003' },
      { f: '015' },
      { f: '005' },
      { f: '006' },
      { f: '007' },
      { f: '008' },
      { f: '010' },
      { f: '011' },
      { f: '012' },
      { f: '013' },
      { f: '014' },
      { f: '005' },
      { f: '006' },
      { f: '007' },
      { f: '008' },
      { f: '009' },
      { f: '011' },
      { f: '012' },
      { f: '013' },
      { f: '015' }
    ]
  }
];

export const rotateClasses = [
  0,
  -45,
  90,
  180,
  0,
  270,
  180,
  45
];

export const organs = [

  {
    folder: 'gradient-glow',
    canRotate: true,
    canBlur: true,
    canScale: true,
    el: [
      { f: '000' },
      { f: '001' },
      { f: '002', no45: true },
      { f: '003', no45: true },
      { f: '004', no45: true },
      { f: '005', no45: true },
      { f: '006' },
      { f: '007', no45: true },
      { f: '008', no45: true },
      { f: '009' },
      { f: '010' },
      { f: '011' },
      { f: '012' },
      { f: '013', no45: true },
      { f: '014', no45: true },
      { f: '015', no45: true },
      { f: '016', no45: true },
      { f: '001' },
      { f: '002', no45: true },
      { f: '003', no45: true },
      { f: '004', no45: true },
      { f: '005', no45: true },
      { f: '006' },
      { f: '007', no45: true },
      { f: '008', no45: true },
      { f: '009' },
      { f: '010' },
      { f: '011' },
      { f: '012' },
      { f: '013', no45: true },
      { f: '014', no45: true },
      { f: '015', no45: true }
    ]
  },

  {
    folder: 'shapes',
    canRotate: true,
    canBlur: true,
    canScale: true,
    el: [
      { f: '000' },
      { f: '001', no45: true },
      { f: '002', no45: true },
      { f: '003' },
      { f: '004' },
      { f: '005' },
      { f: '006' },
      { f: '007' },
      { f: '008' },
      { f: '009' },
      { f: '010' },
      { f: '011' },
      { f: '012' },
      { f: '013', no45: true },
      { f: '014' },
      { f: '015', no45: true },
      { f: '016', no45: true },
      { f: '017', no45: true },
      { f: '018', no45: true },
      { f: '019' },
      { f: '020' },
      { f: '021', no45: true },
      { f: '022' },
      { f: '023' },
      { f: '024' },
      { f: '025' },
      { f: '026' },
      { f: '027' },
      { f: '028' },
      { f: '029' },
      { f: '030', no45: true },
      { f: '031' }
    ]
  },

  {
    folder: 'surfaces',
    canRotate: true,
    canBlur: true,
    canScale: true,
    el: [
      { f: '000', no45: true },
      { f: '001', no45: true },
      { f: '002' },
      { f: '003', no45: true },
      { f: '004' },
      { f: '005' },
      { f: '006', no45: true },
      { f: '007' },
      { f: '008' },
      { f: '009' },
      { f: '010' },
      { f: '011', no45: true },
      { f: '012' },
      { f: '013', no45: true },
      { f: '014', no45: true },
      { f: '015' },
      { f: '016' },
      { f: '017' },
      { f: '018' },
      { f: '019', no45: true },
      { f: '020', no45: true },
      { f: '021', no45: true },
      { f: '022', no45: true },
      { f: '023', no45: true },
      { f: '006', no45: true },
      { f: '007' },
      { f: '008' },
      { f: '009' },
      { f: '010' },
      { f: '011', no45: true },
      { f: '012' },
      { f: '013', no45: true }
    ]
  }
];
