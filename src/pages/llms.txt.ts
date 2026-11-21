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

NetSilcon is a personal open-source project by ${SITE.author}. NetSilcon-6x4 is a neural network on FPGA: a fixed 4 -> 6 -> 6 -> 6 -> 6 -> 2 int8 network in Verilog with loadable weights, biases and shifts (a 201-byte model with CRC-16). Measured on a Sipeed Tang Nano 20K (Gowin GW2AR-18) at 27 MHz: 15 clock cycles (0.556 us) per inference, 576/576 bit-exact results on each of three jobs, 9,600 hardware-in-the-loop decisions with 0 mismatches. Production silicon (QFN-24, SPI, on-chip flash) is a design target, not built yet.

## Main pages

- [Neural network on FPGA: how it works, step by step](${a('/neural-network-on-fpga/')}): guide with a measured example
- [Technology](${a('/technology/')}): the neuron maths, the 15-clock pipeline, safe model loading
- [NetSilcon-6x4](${a('/netsilcon-6x4/')}): specifications with measured / estimated / target labels, pinout, datasheet
- [Benchmarks](${a('/benchmarks/')}): same int8 network on FPGA, Cortex-M4, laptop CPU, edge GPU and NPU
- [NetSilcon-Studio](${a('/studio/')}): training, quantization and upload tools
- [Playground](${a('/playground/')}): bit-exact network in the browser and a rover simulator
- [Applications](${a('/applications/')})
- [Roadmap](${a('/roadmap/')})

## Docs

${docs.map((d) => `- [${d.data.title}](${a(`/docs/${d.id}/`)}): ${d.data.description}`).join('\n')}

## News

${news.map((n) => `- [${n.data.title}](${a(`/news/${n.id}/`)}): ${n.data.description}`).join('\n')}

## Optional

- [Datasheet (PDF)](${a('/files/NetSilcon-6x4_Datasheet.pdf')})
- [Source code](${SITE.githubUrl}): Apache-2.0
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
