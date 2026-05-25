import { formatNumber } from '../utils.js';

const NODE_W = 160;
const NODE_H = 72;
const VERTICAL_GAP = 56;
const HORIZONTAL_GAP = 80;
const PAD = 60;

function nodeBottom(node) { return node.y + node.h; }
function nodeCx(node) { return node.x + node.w / 2; }
function nodeTop(node) { return node.y; }

export function generateDiagram(project, calculations, selectedPanel, selectedInverter, selectedBattery) {
  const nodes = [];
  const edges = [];
  const labels = [];
  const systemType = project.systemType || 'off-grid';

  const panelW = selectedPanel ? selectedPanel.pmax : (project.panelWattage || 0);
  const numPanels = calculations.numberOfPanels || 0;
  const numStrings = calculations.numberOfStrings || 0;
  const panelsPerString = project.panelsPerString || 0;
  const hasController = !project.hasBuiltInController;
  const hasCombiner = numStrings > 1;

  const totalArrayKw = formatNumber(calculations.actualArrayKw, 2);
  const batCapKwh = formatNumber(calculations.requiredBankCapacityWh / 1000, 1);
  const batCapAh = formatNumber(calculations.requiredBankCapacityAh, 0);
  const inverterKva = selectedInverter ? selectedInverter.ratedKva : calculations.selectedInverterKva;
  const showWires = !!project.wireSectionEnabled;
  const dcArrayCable = showWires ? calculations.wires?.dcArray?.recommendedMm2 : null;
  const dcBatCable = showWires ? calculations.wires?.dcBattery?.recommendedMm2 : null;
  const acCable = showWires ? calculations.wires?.ac?.recommendedMm2 : null;

  const batSeries = calculations.batteriesInSeries || 0;
  const batParallel = calculations.numberOfParallelStrings || 0;
  const batTotal = calculations.totalNumberOfBatteries || 0;
  const hasBatteries = batTotal > 0 || (project.daysOfAutonomy > 0 && systemType !== 'grid-tied');
  const showBatteryNode = systemType === 'off-grid' || systemType === 'hybrid' || (systemType === 'grid-tied' && hasBatteries);

  let cx = PAD + NODE_W / 2 + HORIZONTAL_GAP;
  let curY = PAD;

  const addNode = (id, type, title, specs, opts = {}) => {
    const w = opts.w || NODE_W;
    const h = opts.h || NODE_H;
    const x = (opts.x !== undefined ? opts.x : cx) - w / 2;
    const node = { id, type, title, specs, x, y: curY, w, h };
    nodes.push(node);
    return node;
  };

  const panelNode = addNode('panels', 'panels',
    'PV Array',
    [
      `${numPanels} × ${panelW}W`,
      `${totalArrayKw} kWp`,
      selectedPanel ? `${selectedPanel.manufacturer} ${selectedPanel.model}` : '',
    ].filter(Boolean)
  );
  curY += NODE_H + VERTICAL_GAP;

  let prevNodeId = 'panels';

  if (hasCombiner) {
    addNode('combiner', 'combiner',
      'Combiner Box',
      [`${numStrings} strings × ${panelsPerString} panels/string`]
    );
    edges.push({
      id: 'e_panels_combiner', from: 'panels', to: 'combiner', type: 'dc',
      label: dcArrayCable ? `${dcArrayCable}mm²` : '',
    });
    prevNodeId = 'combiner';
    curY += NODE_H + VERTICAL_GAP;
  }

  if (systemType === 'grid-tied') {
    const inverterLabel = 'Grid-Tie Inverter';
    const inverterSpecs = [
      `${inverterKva} kVA`,
      selectedInverter ? `${selectedInverter.manufacturer} ${selectedInverter.model}` : '',
    ].filter(Boolean);

    if (showBatteryNode && hasController) {
      addNode('mppt', 'mppt', 'MPPT Controller', [`${calculations.chargeControllerAmps || 0}A`]);
      edges.push({ id: `e_${prevNodeId}_mppt`, from: prevNodeId, to: 'mppt', type: 'dc', label: '' });
      prevNodeId = 'mppt';
      curY += NODE_H + VERTICAL_GAP;
    }

    if (showBatteryNode) {
      const splitY = curY;
      const leftCx = cx - NODE_W / 2 - HORIZONTAL_GAP / 2;
      const rightCx = cx + NODE_W / 2 + HORIZONTAL_GAP / 2;

      addNode('battery', 'battery', 'Battery Bank', [
        `${batCapKwh} kWh / ${batCapAh}Ah`,
        batTotal > 0 ? `${batSeries}S × ${batParallel}P (${batTotal} units)` : '',
        `${project.batteryVoltage}V DC`,
      ].filter(Boolean), { x: leftCx });

      const invNodeH = inverterSpecs.length > 2 ? NODE_H + 14 : NODE_H;
      const inverterNode = addNode('inverter', 'inverter', inverterLabel, inverterSpecs, { x: rightCx, h: invNodeH });
      inverterNode.y = splitY;

      edges.push({ id: 'e_to_battery', from: prevNodeId, to: 'battery', type: 'dc', label: '' });
      edges.push({ id: 'e_to_inverter', from: prevNodeId, to: 'inverter', type: 'dc', label: '' });
      edges.push({
        id: 'e_battery_inverter', from: 'battery', to: 'inverter', type: 'dc',
        label: dcBatCable ? `${dcBatCable}mm² × ${project.dcBatteryCableLength}m` : '',
        horizontal: true,
      });
      curY = splitY + NODE_H + VERTICAL_GAP;
    } else {
      addNode('inverter', 'inverter', inverterLabel, inverterSpecs);
      edges.push({
        id: `e_${prevNodeId}_inverter`, from: prevNodeId, to: 'inverter', type: 'dc',
        label: !hasCombiner && dcArrayCable ? `${dcArrayCable}mm² × ${project.dcArrayCableLength}m` : '',
      });
      curY += NODE_H + VERTICAL_GAP;
    }

    addNode('meter', 'meter', 'Net Meter', ['Bi-directional']);
    edges.push({ id: 'e_inverter_meter', from: 'inverter', to: 'meter', type: 'ac', label: '' });
    curY += NODE_H + VERTICAL_GAP;

    const splitY2 = curY;
    const leftCx2 = cx - NODE_W / 2 - HORIZONTAL_GAP / 2;
    const rightCx2 = cx + NODE_W / 2 + HORIZONTAL_GAP / 2;

    addNode('load', 'load', 'Distribution Board', [
      '230V AC / 50Hz',
      `${formatNumber(calculations.totalDailyKwh, 1)} kWh/day`,
    ], { x: leftCx2 });

    addNode('grid', 'grid', 'Utility Grid', ['Reliable Supply'], { x: rightCx2 });

    edges.push({ id: 'e_meter_load', from: 'meter', to: 'load', type: 'ac', label: acCable ? `${acCable}mm² × ${project.acOutputCableLength}m` : '' });
    edges.push({ id: 'e_meter_grid', from: 'meter', to: 'grid', type: 'ac', label: '' });

    curY = splitY2 + NODE_H + VERTICAL_GAP;

  } else if (systemType === 'hybrid') {
    if (hasController) {
      addNode('mppt', 'mppt', 'MPPT Controller', [`${calculations.chargeControllerAmps || 0}A`]);
      edges.push({
        id: hasCombiner ? 'e_combiner_mppt' : 'e_panels_mppt',
        from: prevNodeId, to: 'mppt', type: 'dc',
        label: !hasCombiner && dcArrayCable ? `${dcArrayCable}mm² × ${project.dcArrayCableLength}m` : '',
      });
      prevNodeId = 'mppt';
      curY += NODE_H + VERTICAL_GAP;
    }

    const splitY = curY;
    const leftCx = cx - NODE_W / 2 - HORIZONTAL_GAP / 2;
    const rightCx = cx + NODE_W / 2 + HORIZONTAL_GAP / 2;

    addNode('battery', 'battery', 'Battery Bank', [
      `${batCapKwh} kWh / ${batCapAh}Ah`,
      batTotal > 0 ? `${batSeries}S × ${batParallel}P (${batTotal} units)` : '',
      `${project.batteryVoltage}V DC`,
    ].filter(Boolean), { x: leftCx });

    const inverterSpecs = [
      `${inverterKva} kVA`,
      selectedInverter ? `${selectedInverter.manufacturer} ${selectedInverter.model}` : '',
    ];
    if (project.hasBuiltInController) {
      const ctrlAmps = calculations.chargeControllerAmps || 0;
      inverterSpecs.push(`Built-in MPPT${ctrlAmps > 0 ? ` (${ctrlAmps}A)` : ''}`);
    }
    const filteredInvSpecs = inverterSpecs.filter(Boolean);
    const invNodeH = filteredInvSpecs.length > 2 ? NODE_H + 14 : NODE_H;

    const inverterNode = addNode('inverter', 'inverter', 'Hybrid Inverter', filteredInvSpecs, { x: rightCx, h: invNodeH });
    inverterNode.y = splitY;

    edges.push({ id: 'e_to_battery', from: prevNodeId, to: 'battery', type: 'dc', label: '' });
    edges.push({ id: 'e_to_inverter', from: prevNodeId, to: 'inverter', type: 'dc', label: '' });
    edges.push({
      id: 'e_battery_inverter', from: 'battery', to: 'inverter', type: 'dc',
      label: dcBatCable ? `${dcBatCable}mm² × ${project.dcBatteryCableLength}m` : '',
      horizontal: true,
    });

    curY = splitY + NODE_H + VERTICAL_GAP;

    const splitY2 = curY;
    const leftCx2 = cx - NODE_W / 2 - HORIZONTAL_GAP / 2;
    const rightCx2 = cx + NODE_W / 2 + HORIZONTAL_GAP / 2;

    addNode('load', 'load', 'Distribution Board', [
      '230V AC / 50Hz',
      `${formatNumber(calculations.totalDailyKwh, 1)} kWh/day`,
    ], { x: leftCx2 });

    addNode('grid', 'grid', 'Utility Grid', ['Unreliable / Supplement'], { x: rightCx2 });

    edges.push({ id: 'e_inverter_load', from: 'inverter', to: 'load', type: 'ac', label: acCable ? `${acCable}mm² × ${project.acOutputCableLength}m` : '' });
    edges.push({ id: 'e_inverter_grid', from: 'inverter', to: 'grid', type: 'ac', label: '' });

    curY = splitY2 + NODE_H + VERTICAL_GAP;

  } else {
    if (hasController) {
      addNode('mppt', 'mppt', 'MPPT Controller', [`${calculations.chargeControllerAmps || 0}A`]);
      edges.push({
        id: hasCombiner ? 'e_combiner_mppt' : 'e_panels_mppt',
        from: prevNodeId, to: 'mppt', type: 'dc',
        label: !hasCombiner && dcArrayCable ? `${dcArrayCable}mm² × ${project.dcArrayCableLength}m` : '',
      });
      prevNodeId = 'mppt';
      curY += NODE_H + VERTICAL_GAP;
    }

    const splitY = curY;
    const leftCx = cx - NODE_W / 2 - HORIZONTAL_GAP / 2;
    const rightCx = cx + NODE_W / 2 + HORIZONTAL_GAP / 2;

    addNode('battery', 'battery', 'Battery Bank', [
      `${batCapKwh} kWh / ${batCapAh}Ah`,
      batTotal > 0 ? `${batSeries}S × ${batParallel}P (${batTotal} units)` : '',
      `${project.batteryVoltage}V DC`,
    ].filter(Boolean), { x: leftCx });

    const inverterSpecs = [
      `${inverterKva} kVA`,
      selectedInverter ? `${selectedInverter.manufacturer} ${selectedInverter.model}` : '',
    ];
    if (project.hasBuiltInController) {
      const ctrlAmps = calculations.chargeControllerAmps || 0;
      inverterSpecs.push(`Built-in MPPT${ctrlAmps > 0 ? ` (${ctrlAmps}A)` : ''}`);
    }
    const filteredInvSpecs = inverterSpecs.filter(Boolean);
    const invNodeH = filteredInvSpecs.length > 2 ? NODE_H + 14 : NODE_H;

    const inverterNode = addNode('inverter', 'inverter',
      project.hasBuiltInController ? 'Hybrid Inverter' : 'Inverter',
      filteredInvSpecs,
      { x: rightCx, y: splitY, h: invNodeH }
    );
    inverterNode.y = splitY;

    edges.push({ id: 'e_to_battery', from: prevNodeId, to: 'battery', type: 'dc', label: '' });
    edges.push({ id: 'e_to_inverter', from: prevNodeId, to: 'inverter', type: 'dc', label: '' });
    edges.push({
      id: 'e_battery_inverter', from: 'battery', to: 'inverter', type: 'dc',
      label: dcBatCable ? `${dcBatCable}mm² × ${project.dcBatteryCableLength}m` : '',
      horizontal: true,
    });

    curY = splitY + NODE_H + VERTICAL_GAP;

    addNode('load', 'load', 'Distribution Board', [
      '230V AC / 50Hz',
      `${formatNumber(calculations.totalDailyKwh, 1)} kWh/day`,
    ]);

    edges.push({
      id: 'e_inverter_load', from: 'inverter', to: 'load', type: 'ac',
      label: acCable ? `${acCable}mm² × ${project.acOutputCableLength}m` : '',
    });

    curY += NODE_H + VERTICAL_GAP;
  }

  const canvasWidth = Math.max(PAD * 2 + NODE_W * 2 + HORIZONTAL_GAP * 2, 520);
  const canvasHeight = curY + PAD;

  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  edges.forEach(edge => {
    const from = nodeMap[edge.from];
    const to = nodeMap[edge.to];
    if (!from || !to) { edge.points = []; return; }

    if (edge.horizontal) {
      const fromRight = from.x + from.w;
      const toLeft = to.x;
      const midY = from.y + from.h / 2;
      edge.points = [
        { x: fromRight, y: midY },
        { x: toLeft, y: midY },
      ];
    } else {
      const fromCx = nodeCx(from);
      const fromBy = nodeBottom(from);
      const toCx = nodeCx(to);
      const toTy = nodeTop(to);
      const midY = fromBy + (toTy - fromBy) / 2;

      if (Math.abs(fromCx - toCx) < 2) {
        edge.points = [
          { x: fromCx, y: fromBy },
          { x: fromCx, y: toTy },
        ];
      } else {
        edge.points = [
          { x: fromCx, y: fromBy },
          { x: fromCx, y: midY },
          { x: toCx, y: midY },
          { x: toCx, y: toTy },
        ];
      }
    }
  });

  return { nodes, edges, canvasWidth, canvasHeight };
}
