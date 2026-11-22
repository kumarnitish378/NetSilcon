// Single source of truth for every number on the site.
// basis: 'M' = measured on the FPGA reference, 'E' = estimate (tool or datasheet), 'T' = design target, not built.
// Sources: NetSilcon-FPGA repo, NetSilcon-Models/NetSilcon-6x4 (README, docs/results.md, docs/benchmarks.md, docs/architecture.md)
// and the NetSilcon-6x4 preliminary datasheet, Rev 0.1.

export type Basis = 'M' | 'E' | 'T';
export const BASIS_LABEL: Record<Basis, string> = {
  M: 'Measured on the FPGA reference implementation',
  E: 'Estimate: design tool or datasheet figure',
  T: 'Design target for production silicon, not built yet',
};

export const proof = [
  { value: 15, unit: 'clk', label: 'latency, every inference · 0.556 µs at 27 MHz', basis: 'M' as Basis },
  { value: 576, unit: '/576', label: 'bit-exact results, for each of 3 jobs', basis: 'M' as Basis },
  { value: 9600, unit: '', label: 'hardware-in-the-loop decisions, 0 mismatches', basis: 'M' as Basis, sep: true },
  { value: 31, unit: 'ms', label: 'CRC-checked model upload over UART', basis: 'M' as Basis },
];

export interface BenchRow {
  name: string;
  detail: string;
  latency: string;
  power: string;
  energy: string;
  how: string;
  /** energy range in nJ for the log bar; hi = null means open-ended (lower bound) */
  lo?: number;
  hi?: number | null;
  us?: boolean;
}

export const bench: BenchRow[] = [
  { name: 'NetSilcon FPGA', detail: 'Tang Nano 20K, GW2AR-18, 27 MHz', latency: '0.556 µs', power: '139.5 mW', energy: '≈ 78 nJ', how: 'latency measured; power is a Gowin estimate', lo: 78, hi: 78, us: true },
  { name: 'STM32F407', detail: 'Cortex-M4, 168 MHz', latency: '14–21 µs', power: '132 mW', energy: '1.8–2.8 µJ', how: 'instructions counted; ST datasheet', lo: 1800, hi: 2800 },
  { name: 'Laptop i7-13650HX', detail: 'one thread', latency: '0.115 µs', power: '10–55 W', energy: '1.2–6.4 µJ', how: 'latency measured; power estimated', lo: 1200, hi: 6400 },
  { name: 'Jetson Orin Nano', detail: 'edge GPU', latency: '≥ 20 µs', power: '7–25 W', energy: '≥ 140 µJ', how: 'estimate from NVIDIA launch-cost figures', lo: 140000, hi: null },
  { name: 'Coral Edge TPU', detail: 'edge NPU', latency: 'slower than a small CPU at this size', power: '2 W plus host', energy: 'higher than a small CPU', how: 'datasheet and published study' },
];

/** log-scale position (0..100 %) on a 10 nJ … 1 mJ axis */
export const logPos = (nJ: number) => ((Math.log10(nJ) - 1) / 5) * 100;
export const LOG_TICKS = ['10 nJ', '100 nJ', '1 µJ', '10 µJ', '100 µJ', '1 mJ'];

export const headline = {
  speed: 'about 25× faster than the microcontroller',
  energy: '24–36× less energy than the microcontroller',
  laptop: 'A laptop CPU is about 5× faster on a network this small',
};

export interface Spec { k: string; v: string; basis: Basis; note?: string }
export const specGroups: { title: string; rows: Spec[] }[] = [
  {
    title: 'Network',
    rows: [
      { k: 'Shape', v: '4 → 6 → 6 → 6 → 6 → 2, fully connected', basis: 'M' },
      { k: 'Activation', v: 'ReLU in the 4 hidden layers', basis: 'M' },
      { k: 'Neurons', v: '26', basis: 'M' },
      { k: 'Weights', v: '144 × int8', basis: 'M' },
      { k: 'Biases', v: '26 × int16', basis: 'M' },
      { k: 'Parameters (total)', v: '170 (144 weights + 26 biases), plus 5 layer shifts', basis: 'M' },
      { k: 'Layer shifts', v: '5, each 0…15', basis: 'M' },
      { k: 'Accumulator', v: '20-bit signed, cannot overflow', basis: 'M' },
      { k: 'Multipliers', v: '72, time-shared over 2 phases', basis: 'M' },
    ],
  },
  {
    title: 'Timing (27 MHz)',
    rows: [
      { k: 'Inference latency', v: '15 clock cycles = 0.556 µs, every time', basis: 'M' },
      { k: 'Throughput', v: '1 inference every 2 clocks = 13.5 M/s', basis: 'M' },
      { k: 'Model swap, staging → active', v: '201 clocks = 7.4 µs', basis: 'M' },
      { k: 'Model upload, UART', v: '204 bytes in about 31 ms, including host software', basis: 'M' },
      { k: 'Inference transaction, UART', v: '5 bytes in + 5 bytes out, 0.87 ms', basis: 'M' },
      { k: 'Model upload, SPI at 10 MHz', v: '0.17 ms', basis: 'T' },
      { k: 'Core clock, production', v: 'up to 50 MHz', basis: 'T' },
    ],
  },
  {
    title: 'Model image',
    rows: [
      { k: 'Size', v: '201 bytes: 144 weights, 52 bias bytes, 5 shifts', basis: 'M' },
      { k: 'Integrity', v: 'CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF)', basis: 'M' },
      { k: 'Bad image', v: 'refused; the running model keeps going', basis: 'M' },
      { k: 'Storage at power-off', v: 'on-chip flash, reloaded with CRC check', basis: 'T' },
    ],
  },
  {
    title: 'Interfaces',
    rows: [
      { k: 'UART', v: '115200 8N1, 5-byte replies', basis: 'M' },
      { k: 'Commands', v: 'A5 infer · C3 load model · C5 model info', basis: 'M' },
      { k: 'SPI', v: 'mode 0, up to 10 MHz', basis: 'T' },
      { k: 'Hardware signals', v: 'nREADY, nFAULT, DOUT0 (decision bit), DOUT1, START', basis: 'T' },
    ],
  },
  {
    title: 'Power and package',
    rows: [
      { k: 'FPGA reference, total', v: '139.5 mW (includes FPGA static power)', basis: 'E' },
      { k: 'Network logic only', v: '10.6 mW at 13.5 M inferences/s', basis: 'E' },
      { k: 'Supply', v: '3.0–3.6 V, I/O 1.8–3.6 V', basis: 'T' },
      { k: 'Supply current, run', v: '2.5 mA typical', basis: 'T' },
      { k: 'Package', v: 'QFN-24, 4 × 4 mm, 0.5 mm pitch', basis: 'T' },
      { k: 'Temperature', v: '−40 °C to +105 °C', basis: 'T' },
    ],
  },
];

export const ordering = [
  { part: 'NS6X4-REF', what: 'FPGA reference implementation for the Sipeed Tang Nano 20K: RTL, bitstream build, NetSilcon-Studio tools', pack: 'Open source', status: 'Available' },
  { part: 'NS6X4-EVM', what: 'Evaluation board: NetSilcon-6x4, USB-UART bridge, SPI header, LEDs', pack: 'Board', status: 'Planned' },
  { part: 'NS6X4-Q24T', what: 'NetSilcon-6x4 IC, cut tape, 250', pack: 'QFN-24, 4 × 4 mm', status: 'Preview' },
  { part: 'NS6X4-Q24R', what: 'NetSilcon-6x4 IC, tape and reel, 3 000', pack: 'QFN-24, 4 × 4 mm', status: 'Preview' },
];
export const STATUS_NOTE = 'Available = can be used now. Preview = samples on request after first silicon. Planned = in development.';

// QFN-24 pinout from datasheet Table 5-1. side: L (1–6), B (7–12), R (13–18), T (19–24)
export const pins: { n: number; name: string; type: string; desc: string }[] = [
  { n: 1, name: 'VDD', type: 'P', desc: 'Main supply, 3.0–3.6 V' },
  { n: 2, name: 'VCORE', type: 'A', desc: 'Internal 1.2 V regulator output, 1 µF to GND' },
  { n: 3, name: 'GND', type: 'G', desc: 'Ground' },
  { n: 4, name: 'CLKIN', type: 'I', desc: 'Clock input or crystal pin 1' },
  { n: 5, name: 'CLKOUT', type: 'O', desc: 'Crystal pin 2' },
  { n: 6, name: 'nRESET', type: 'I', desc: 'Active-low reset, internal pull-up' },
  { n: 7, name: 'IFSEL', type: 'I', desc: 'Interface select at reset: 0 = UART, 1 = SPI' },
  { n: 8, name: 'UART_RX', type: 'I', desc: 'UART data from host' },
  { n: 9, name: 'UART_TX', type: 'O', desc: 'UART data to host' },
  { n: 10, name: 'VDDIO', type: 'P', desc: 'I/O supply, 1.8–3.6 V' },
  { n: 11, name: 'SPI_nCS', type: 'I', desc: 'SPI chip select, active low' },
  { n: 12, name: 'SPI_SCK', type: 'I', desc: 'SPI clock (mode 0)' },
  { n: 13, name: 'SPI_MOSI', type: 'I', desc: 'SPI data from host' },
  { n: 14, name: 'SPI_MISO', type: 'O', desc: 'SPI data to host' },
  { n: 15, name: 'nREADY', type: 'O', desc: 'Result ready, active low: host interrupt' },
  { n: 16, name: 'nFAULT', type: 'OD', desc: 'Fault, active low: CRC, frame or flash error, watchdog' },
  { n: 17, name: 'DOUT0', type: 'O', desc: 'Decision bit: 1 when y1 > y0' },
  { n: 18, name: 'DOUT1', type: 'O', desc: 'Decision valid for the current model' },
  { n: 19, name: 'START', type: 'I', desc: 'Optional hardware trigger, rising edge' },
  { n: 20, name: 'nWP', type: 'I', desc: 'Model write protect, active low' },
  { n: 21, name: 'GND', type: 'G', desc: 'Ground' },
  { n: 22, name: 'STATUS', type: 'O', desc: 'Status LED: slow blink running, fast blink fault' },
  { n: 23, name: 'TEST', type: 'I', desc: 'Factory test, connect to GND' },
  { n: 24, name: 'NC', type: '–', desc: 'No connection' },
];

export const roadmap = [
  {
    phase: 'Done', state: 'done',
    items: ['FPGA prototype on the Tang Nano 20K', 'Three jobs on one bitstream, 576/576 bit-exact each', 'CRC-safe model upload with atomic swap', 'Hardware-in-the-loop: 9,600 decisions, 0 mismatches', 'NetSilcon-64x6: 16 → 64×6 → 16 on the same board, 448 clocks', 'Trained 64x6 rover controller: 19,200 HIL decisions, 0 mismatches'],
  },
  {
    phase: 'Next', state: 'next',
    items: ['SPI interface beside UART', 'Model storage in flash, loaded at power-up', 'Real sensors instead of simulation', 'STM32 benchmark on real hardware'],
  },
  {
    phase: 'Later', state: 'later',
    items: ['More network shapes and trained models', 'Support for more FPGA boards', 'The full NetSilcon-Studio toolchain', 'A chip on a shared multi-project wafer (MPW)'],
  },
];

// Applications. Model files exist for the first three; the others are example input sets from datasheet Table 12-1.
export const applications = [
  { id: 'motor', icon: 'motor', title: 'ESC / motor fault detection', inputs: ['Motor current (20 A FS)', 'Supply voltage (30 V FS)', 'Speed (6 000 rpm FS)', 'Temperature (120 °C FS)'], decides: 'HEALTHY or FAULT. DOUT0 can disable the gate driver directly.', status: 'Model file: motor_fault.json · NetSilcon-6x4, 170 parameters · 94.5 % int8 accuracy · 576/576 bit-exact', model: true },
  { id: 'irrigation', icon: 'drop', title: 'Irrigation controller', inputs: ['Soil moisture', 'Air temperature', 'Air humidity', 'Sunlight'], decides: 'SKIP or WATER now.', status: 'Model file: irrigation.json · NetSilcon-6x4, 170 parameters · 97.4 % int8 accuracy · 576/576 bit-exact', model: true },
  { id: 'rover', icon: 'rover', title: 'Robot obstacle decisions', inputs: ['Range front-left', 'Range front-right', 'Range rear-left', 'Range rear-right'], decides: 'Speed and steering, each −1…+1.', status: 'Model file: rover.json (v2) · NetSilcon-6x4, 170 parameters · 9,600 HIL decisions, 0 mismatches. NetSilcon-64x6 version with 16 LiDAR sectors, 22,928 parameters: 19,200 HIL decisions, 0 mismatches', model: true },
  { id: 'bms', icon: 'battery', title: 'BMS cell anomaly', inputs: ['Cell voltage deviation', 'dV/dt', 'Cell temperature', 'Temperature rise rate'], decides: 'Normal or ANOMALY, as an early warning.', status: 'Example input set · train on your own data', model: false },
  { id: 'pump', icon: 'pump', title: 'Pump cavitation and dry run', inputs: ['Motor current', 'Current ripple', 'Outlet pressure', 'Vibration RMS'], decides: 'Normal or CAVITATION.', status: 'Example input set · train on your own data', model: false },
  { id: 'fan', icon: 'fan', title: 'Fan and spindle health', inputs: ['Vibration RMS', 'Vibration peak', 'Speed', 'Temperature'], decides: 'OK or MAINTENANCE NEEDED.', status: 'Example input set · train on your own data', model: false },
  { id: 'fusion', icon: 'fusion', title: 'Sensor fusion and plausibility', inputs: ['Any 4 related readings, for example two sensors measuring the same quantity plus context'], decides: 'Plausible or SUSPECT, beside a safety MCU.', status: 'Idea · no example input set yet', model: false },
];

// ---------------------------------------------------------------- NetSilcon-64x6
// Sources: NetSilcon-FPGA repo, NetSilcon-Models/NetSilcon-64x6: docs/test_report.md (22 Nov 2026),
// models/rover/README.md, results/results_rover64.txt, results/results_hil64.txt, results/logs/.

/** The model family, for comparison tables */
export const family = [
  { k: 'Network', a: '4 → 6 → 6 → 6 → 6 → 2', b: '16 → 64 → 64 → 64 → 64 → 64 → 64 → 16' },
  { k: 'Parameters (total)', a: '170 = 144 weights + 26 biases', b: '22,928 = 22,528 weights + 400 biases' },
  { k: 'Layer shifts', a: '5', b: '7' },
  { k: 'Model upload', a: '201 bytes, CRC-16, 31 ms', b: '23,335 bytes, CRC-32, 2.04 s' },
  { k: 'Weights live in', a: 'registers', b: '32 block RAMs, two banks' },
  { k: 'Multipliers', a: '72, two phases', b: '64 MAC lanes (DSP 16 / 24)' },
  { k: 'Latency (27 MHz)', a: '15 clocks = 0.556 µs', b: '448 clocks = 16.6 µs' },
  { k: 'Hardware vs Python', a: '576 / 576 vectors per app, bit-exact', b: '3,200 vectors, bit-exact' },
  { k: 'Hardware-in-the-loop', a: '9,600 rover decisions, 0 mismatches', b: '19,200 rover decisions, 0 mismatches' },
  { k: 'Trained applications', a: 'motor fault, irrigation, rover', b: 'rover (16 LiDAR sectors)' },
];

export const proof64 = [
  { value: 448, unit: 'clk', label: 'latency, every inference · 16.6 µs at 27 MHz', basis: 'M' as Basis },
  { value: 22528, unit: '', label: 'int8 weights, reloadable over UART', basis: 'M' as Basis, sep: true },
  { value: 19200, unit: '', label: 'hardware-in-the-loop rover decisions, 0 mismatches', basis: 'M' as Basis, sep: true },
  { value: 31, unit: '×', label: 'fewer clock cycles than a laptop CPU (best C code)', basis: 'M' as Basis },
];

export const specGroups64: { title: string; rows: Spec[] }[] = [
  {
    title: 'Network',
    rows: [
      { k: 'Shape', v: '16 → 64 → 64 → 64 → 64 → 64 → 64 → 16, fully connected', basis: 'M' },
      { k: 'Activation', v: 'ReLU in the 6 hidden layers', basis: 'M' },
      { k: 'Weights', v: '22,528 × int8', basis: 'M' },
      { k: 'Biases', v: '400 × int16', basis: 'M' },
      { k: 'Parameters (total)', v: '22,928 (22,528 weights + 400 biases), plus 7 layer shifts', basis: 'M' },
      { k: 'Layer shifts', v: '7, each 0…23, round half up', basis: 'M' },
      { k: 'Accumulator', v: '24-bit signed', basis: 'M' },
      { k: 'Compute', v: '64 MAC lanes, one input broadcast per clock', basis: 'M' },
    ],
  },
  {
    title: 'Timing (27 MHz)',
    rows: [
      { k: 'Inference latency', v: '448 clock cycles = 16.6 µs, every time (hardware counter)', basis: 'M' },
      { k: 'Multiply-adds per clock', v: '50.3 average', basis: 'M' },
      { k: 'Model upload, UART', v: '23,340-byte frame in 2.04 s', basis: 'M' },
      { k: 'Model swap', v: 'one clock, only after a good CRC-32', basis: 'M' },
      { k: 'Fmax (Gowin timing)', v: '61.5 MHz, 0 setup / 0 hold violations', basis: 'E' },
    ],
  },
  {
    title: 'Memory and model image',
    rows: [
      { k: 'Weight memory', v: '32 block RAMs (1K × 16), two lanes per RAM', basis: 'M' },
      { k: 'Banks', v: 'bank 0 = built-in model, bank 1 = upload slot', basis: 'M' },
      { k: 'Image', v: '23,335 bytes + CRC-32', basis: 'M' },
      { k: 'Bad image', v: 'refused; the running model keeps going', basis: 'M' },
    ],
  },
  {
    title: 'Verification',
    rows: [
      { k: 'Simulation', v: '1,200 vectors, 0 mismatches; requantizer 21,216 values', basis: 'M' },
      { k: 'Board design over UART (sim)', v: '168 checks, 0 errors', basis: 'M' },
      { k: 'Mutation tests', v: 'engine 6 / 6, loader and top 5 / 5 bugs caught', basis: 'M' },
      { k: 'On the FPGA', v: '1,000 golden + 2,000 random vectors, 0 mismatches', basis: 'M' },
      { k: 'FPGA resources', v: 'logic 35 %, BSRAM 32 / 46, DSP 16 / 24', basis: 'M' },
    ],
  },
];

export const cycles64 = [
  { impl: 'NetSilcon-64x6 on FPGA', clock: '27 MHz', time: '16.6 µs', cycles: '448', macs: '50.3', us: true },
  { impl: 'Laptop CPU i7-13650HX, C -O3 SIMD', clock: '4.09 GHz', time: '3.45 µs', cycles: '≈ 14,100', macs: '1.6' },
  { impl: 'Laptop CPU, C -O2', clock: '4.09 GHz', time: '7.5 µs', cycles: '≈ 30,700', macs: '0.73' },
  { impl: 'NumPy, one input at a time', clock: '4.09 GHz', time: '62.6 µs', cycles: '≈ 256,000', macs: '–' },
  { impl: 'Plain Python', clock: '4.09 GHz', time: '3,023 µs', cycles: '≈ 12.4 million', macs: '–' },
];

export const rover64 = {
  crc: '3A81C867',
  agreement: '89.8 %',
  sim: [
    { who: 'NetSilcon-64x6 network + supervisor', set: '80 drives, 4 standard worlds', crash: '0 / 80', stuck: '0 / 80', dist: '46.9 m', us: true },
    { who: '64x6 network + supervisor, 2 cm sensor noise', set: '80 drives', crash: '0 / 80', stuck: '0 / 80', dist: '46.4 m' },
    { who: 'Hand-written rules (the teacher)', set: '80 drives', crash: '0 / 80', stuck: '0 / 80', dist: '47.7 m' },
    { who: 'NetSilcon-64x6 network + supervisor', set: '40 new random worlds', crash: '0 / 40', stuck: '1 / 40', dist: '37.9 m', us: true },
    { who: 'NetSilcon-6x4 rover v2 + supervisor', set: '40 new random worlds', crash: '0 / 40', stuck: '0 / 40', dist: '33.3 m' },
  ],
  hil: [
    { k: 'Model', v: '22,928 parameters (22,528 weights + 400 biases), 7 shifts, 23,335-byte image' },
    { k: 'FPGA inferences', v: '19,200 (8 drives × 2,400 steps)' },
    { k: 'Mismatches with the Python model', v: '0' },
    { k: 'Chip latency', v: '448 clocks on every step' },
    { k: 'USB round trip', v: '15.3 ms average, 17.8 ms maximum' },
    { k: 'Drives', v: '8: 0 crashes, 0 stuck, 48.1 m per drive' },
    { k: 'Repeat run', v: 'identical inputs and outputs on all 19,200 steps' },
  ],
};
