import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '../config';

// A plain-text map of the site for AI assistants and answer engines (llmstxt.org format).
export const GET: APIRoute = async ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const a = (p: string) => new URL(`${base}${p}`, site).toString();
  const docs = (await getCollection('docs')).sort((x, y) => x.data.order - y.data.order);
  const news = (await getCollection('news')).sort((x, y) => y.data.order - x.data.order);
  const body = `# NetSilcon

> ${SITE.description}

NetSilcon is an open-source project by ${SITE.author}: neural network engines on FPGA with a fixed shape and loadable numbers. Code, models and logs: ${SITE.githubUrl}.

NetSilcon-6x4 is a neural network on FPGA: a fixed 4 -> 6 -> 6 -> 6 -> 6 -> 2 int8 network in Verilog with loadable weights, biases and shifts (a 201-byte model with CRC-16). Measured on a Sipeed Tang Nano 20K (Gowin GW2AR-18) at 27 MHz: 15 clock cycles (0.556 us) per inference, 576/576 bit-exact results on each of three jobs, 9,600 hardware-in-the-loop decisions with 0 mismatches. Production silicon (QFN-24, SPI, on-chip flash) is a design target, not built yet.

NetSilcon-64x6 is the larger engine on the same board: a 16 -> 64 x 6 -> 16 int8 network, 22,528 weights in 32 block RAMs, 64 multiply-accumulate lanes, a 23,335-byte model with CRC-32. Measured: 448 clock cycles (16.6 us at 27 MHz) per inference, 3,200 vectors bit-exact on the FPGA, 31x fewer clock cycles than a laptop CPU (best C code). Its trained rover controller (16 LiDAR sectors -> speed, steering) made 19,200 hardware-in-the-loop decisions with 0 mismatches.

## Main pages

- [Neural network on FPGA: how it works, step by step](${a('/neural-network-on-fpga/')}): guide with a measured example
- [Technology](${a('/technology/')}): the neuron maths, the 15-clock pipeline, safe model loading
- [NetSilcon-6x4](${a('/netsilcon-6x4/')}): specifications with measured / estimated / target labels, pinout, datasheet
- [NetSilcon-64x6](${a('/netsilcon-64x6/')}): 22,528-weight engine, clock-cycle comparison, trained rover controller
- [FPGA AI accelerator](${a('/fpga-ai-accelerator/')}): architectures, measured numbers, when an FPGA wins
- [Neural network in Verilog](${a('/verilog-neural-network/')}): int8 MAC, ReLU, requantization, bit-exact testing
- [Tang Nano 20K neural network](${a('/tang-nano-20k-neural-network/')}): what fits, build steps, results
- [TinyML on FPGA](${a('/tinyml-fpga/')}): FPGA vs microcontroller, workflow
- [Benchmarks](${a('/benchmarks/')}): same int8 network on FPGA, Cortex-M4, laptop CPU, edge GPU and NPU
- [NetSilcon-Studio](${a('/studio/')}): training, quantization and upload tools
- [Playground](${a('/playground/')}): bit-exact network in the browser and a rover simulator
- [Applications](${a('/applications/')}): including how to suggest a use case
- [About and contact](${a('/about/')}): ${SITE.contact.linkedin}
- [Roadmap](${a('/roadmap/')})

## Docs

${docs.map((d) => `- [${d.data.title}](${a(`/docs/${d.id}/`)}): ${d.data.description}`).join('\n')}

## News

${news.map((n) => `- [${n.data.title}](${a(`/news/${n.id}/`)}): ${n.data.description}`).join('\n')}

## Optional

- [NetSilcon-6x4 datasheet (PDF)](${a('/files/NetSilcon-6x4_Datasheet.pdf')})
- [NetSilcon-64x6 datasheet (PDF)](${a('/files/NetSilcon-64x6_Datasheet.pdf')})
- [Source code](${SITE.githubUrl}): Apache-2.0
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
