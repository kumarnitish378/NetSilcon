// Bit-exact JavaScript port of the NetSilcon-6x4 int8 network.
// Mirrors model_int8() in host/netsilcon_host.py and rtl/nn_layer.v:
//   acc = bias16 + Σ x_i · w_i            (20-bit signed accumulator; JS numbers are exact here)
//   hidden: acc = max(acc, 0)              (ReLU)
//   y = (acc + 2^(s-1)) >> s               (round, arithmetic shift; no rounding term when s = 0)
//   clamp to 0..127 (hidden) or -128..127 (output)

export const SIZES = [4, 6, 6, 6, 6, 2];

/** Run one inference. x: 4 ints 0..127. Returns { out:[y0,y1], layers:[[...] per layer incl. input] } */
export function infer(model, x) {
  const { weights: w, biases: b, shifts: sh } = model;
  let a = x.slice(0, 4);
  const layers = [a];
  let wi = 0, bi = 0;
  for (let l = 0; l < 5; l++) {
    const nIn = SIZES[l], nOut = SIZES[l + 1], s = sh[l];
    const out = new Array(nOut);
    for (let j = 0; j < nOut; j++) {
      let acc = b[bi + j];
      for (let i = 0; i < nIn; i++) acc += a[i] * w[wi + j * nIn + i];
      if (l < 4 && acc < 0) acc = 0;
      // arithmetic shift right; Math.floor keeps it exact for negative values too
      const y = Math.floor((acc + (s ? 2 ** (s - 1) : 0)) / 2 ** s);
      out[j] = l < 4 ? Math.min(Math.max(y, 0), 127) : Math.min(Math.max(y, -128), 127);
    }
    wi += nIn * nOut;
    bi += nOut;
    a = out;
    layers.push(out);
  }
  return { out: a, layers };
}

/** Real-world value -> chip input byte, as in the protocol: q = round(value / range × 127), 0..127 */
export function quantize(value, range) {
  return Math.min(127, Math.max(0, Math.round((value / range) * 127)));
}

/** CRC-16/CCITT-FALSE over a byte array */
export function crc16(bytes) {
  let crc = 0xffff;
  for (const byte of bytes) {
    crc ^= (byte & 0xff) << 8;
    for (let k = 0; k < 8; k++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc;
}

/** The 201-byte model image: 144 int8 weights, 26 int16 biases (low byte first), 5 shifts */
export function modelImage(model) {
  const img = [];
  for (const w of model.weights) img.push(w & 0xff);
  for (const b of model.biases) img.push(b & 0xff, (b >> 8) & 0xff);
  for (const s of model.shifts) img.push(s & 0xff);
  return img;
}

/** Check every golden vector [x0,x1,x2,x3,y0,y1]. Returns { pass, total } */
export function selfTest(model) {
  let pass = 0;
  for (const t of model.tests) {
    const { out } = infer(model, t.slice(0, 4));
    if (out[0] === t[4] && out[1] === t[5]) pass++;
  }
  return { pass, total: model.tests.length };
}
