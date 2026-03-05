# Solisys
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

A PWA built with React and Tailwind CSS to accurately design and calculate the requirements for solar systems. It handles energy consumption auditing, inverter and battery sizing, solar array configuration, string design, wire sizing, single-line diagram generation, and cost estimation. All data persists locally in the browser and is exportable as PDF, CSV, or JSON.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build tool | Vite 7 |
| Styling | Tailwind CSS |
| PDF generation | jsPDF 4 |
| Icons | Lucide React |

---

## Getting Started

### Prerequisites
- Node.js v20.19.0 or later (required by Vite 7)
- pnpm (recommended) or npm

### Installation

```bash
git clone https://github.com/charlzx/solisys.git
cd solisys
pnpm install
```

### Development

```bash
pnpm dev
```

The application runs at `http://localhost:5173`.

### Build

```bash
pnpm build
pnpm preview
```

---

## Calculation Reference

| Parameter | Formula |
|---|---|
| Daily energy | Σ (qty × W × h) per appliance |
| Required inverter | (peakLoad × 1.25) / 1000 / 0.8 kVA |
| Total storage | dailyWh × daysOfAutonomy |
| Required bank capacity | totalStorageWh / DoD |
| Required bank capacity (Ah) | bankWh / systemVoltage |
| Batteries in series | systemVoltage / batteryVoltage |
| Parallel strings | ⌈ requiredAh / batteryAh ⌉ |
| Required array wattage | dailyWh / (PSH × efficiency) |
| Number of panels | ⌈ requiredW / panelWp ⌉ |
| Voc at T_min | Voc_STC × (1 + (coeff/100) × (−10 − 25)) |
| Vmp at T_max | Vmp_STC × (1 + (coeff/100) × (70 − 25)) |
| Min panels/string | ⌈ MPPT_min / Vmp_Tmax ⌉ |
| Max panels/string | ⌊ maxPvV / Voc_Tmin ⌋ |
| Min cable cross-section | (2 × L × I × ρ × 1.15) / V_drop |
| Copper resistivity (ρ) | 0.0175 Ω·mm²/m |
| Charge controller | ⌈ (panels × Wp / sysV) × 1.25 ⌉ A, rounded to standard size |

---

## License

MIT © 2026 Charlz — see [LICENSE](./LICENSE).
_____________________________
