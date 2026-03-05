export const STANDARD_SIZES_MM2 = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120];

export const COPPER_RESISTIVITY = 0.0175;
export const TEMP_CORRECTION_FACTOR = 1.15;

export const MM2_TO_AWG = {
  1.5: 16,
  2.5: 14,
  4: 12,
  6: 10,
  10: 8,
  16: 6,
  25: 4,
  35: 2,
  50: 1,
  70: '2/0',
  95: '3/0',
  120: '4/0',
};

export const CABLE_REFERENCE_TABLE = [
  { mm2: 1.5, awg: 16, maxCurrentA: 18, notes: 'Light circuits' },
  { mm2: 2.5, awg: 14, maxCurrentA: 27, notes: 'Light circuits' },
  { mm2: 4, awg: 12, maxCurrentA: 37, notes: 'Standard' },
  { mm2: 6, awg: 10, maxCurrentA: 47, notes: 'Heavy circuits' },
  { mm2: 10, awg: 8, maxCurrentA: 65, notes: 'Array combiner' },
  { mm2: 16, awg: 6, maxCurrentA: 87, notes: 'Battery bank' },
  { mm2: 25, awg: 4, maxCurrentA: 114, notes: 'Main DC runs' },
  { mm2: 35, awg: 2, maxCurrentA: 135, notes: 'High current' },
  { mm2: 50, awg: 1, maxCurrentA: 162, notes: 'Inverter output' },
  { mm2: 70, awg: '2/0', maxCurrentA: 200, notes: 'Large inverters' },
  { mm2: 95, awg: '3/0', maxCurrentA: 240, notes: 'Commercial' },
  { mm2: 120, awg: '4/0', maxCurrentA: 280, notes: 'Commercial' },
];
