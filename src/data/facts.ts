// Single source of truth for every number on the site.
// basis: 'M' = measured on the FPGA reference, 'E' = estimate (tool or datasheet), 'T' = design target, not built.
// Sources: NetSilcon-6x4 repo (README, docs/results.md, docs/benchmarks.md, docs/architecture.md)
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
    items: ['FPGA prototype on the Tang Nano 20K', 'Three jobs on one bitstream, 576/576 bit-exact each', 'CRC-safe model upload with atomic swap', 'Hardware-in-the-loop: 9,600 decisions, 0 mismatches'],
  },
  {
    phase: 'Next', state: 'next',
    items: ['SPI interface beside UART', 'Model storage in flash, loaded at power-up', 'Real sensors instead of simulation', 'STM32 benchmark on real hardware'],
  },
  {
    phase: 'Later', state: 'later',
    items: ['NetSilcon-64x6: 16 → 64×6 → 16, in design', 'The full NetSilcon-Studio toolchain', 'A chip on a shared multi-project wafer (MPW)'],
  },
];

// Applications. Model files exist for the first three; the others are example input sets from datasheet Table 12-1.
export const applications = [
  { id: 'motor', icon: 'motor', title: 'ESC / motor fault detection', inputs: ['Motor current (20 A FS)', 'Supply voltage (30 V FS)', 'Speed (6 000 rpm FS)', 'Temperature (120 °C FS)'], decides: 'HEALTHY or FAULT. DOUT0 can disable the gate driver directly.', status: 'Model file: motor_fault.json · 94.5 % int8 accuracy · 576/576 bit-exact', model: true },
  { id: 'irrigation', icon: 'drop', title: 'Irrigation controller', inputs: ['Soil moisture', 'Air temperature', 'Air humidity', 'Sunlight'], decides: 'SKIP or WATER now.', status: 'Model file: irrigation.json · 97.4 % int8 accuracy · 576/576 bit-exact', model: true },
  { id: 'rover', icon: 'rover', title: 'Robot obstacle decisions', inputs: ['Range front-left', 'Range front-right', 'Range rear-left', 'Range rear-right'], decides: 'Speed and steering, each −1…+1.', status: 'Model file: rover.json (v2) · 9,600 HIL decisions, 0 mismatches', model: true },
  { id: 'bms', icon: 'battery', title: 'BMS cell anomaly', inputs: ['Cell voltage deviation', 'dV/dt', 'Cell temperature', 'Temperature rise rate'], decides: 'Normal or ANOMALY, as an early warning.', status: 'Example input set · train on your own data', model: false },
  { id: 'pump', icon: 'pump', title: 'Pump cavitation and dry run', inputs: ['Motor current', 'Current ripple', 'Outlet pressure', 'Vibration RMS'], decides: 'Normal or CAVITATION.', status: 'Example input set · train on your own data', model: false },
  { id: 'fan', icon: 'fan', title: 'Fan and spindle health', inputs: ['Vibration RMS', 'Vibration peak', 'Speed', 'Temperature'], decides: 'OK or MAINTENANCE NEEDED.', status: 'Example input set · train on your own data', model: false },
  { id: 'fusion', icon: 'fusion', title: 'Sensor fusion and plausibility', inputs: ['Any 4 related readings, for example two sensors measuring the same quantity plus context'], decides: 'Plausible or SUSPECT, beside a safety MCU.', status: 'Idea · no example input set yet', model: false },
];
