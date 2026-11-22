// One place for everything that points outside the site.
// Contact links shown on the About page, the footer and the use-case calls to action.
export const SITE = {
  name: 'NetSilcon',
  tagline: 'Fix the shape. Load the numbers. New job.',
  description:
    'NetSilcon is an open-source neural network on FPGA: a fixed int8 network in Verilog with loadable weights. 15 clock cycles per inference, bit-exact, on a Tang Nano 20K.',
  author: 'Nitish Kumar Sharma',

  /** Google Search Console ownership token (HTML tag method). Keep it, or the site loses verification. */
  googleSiteVerification: 'E7JXaJ2TNC3EShwt6R6UcwfqbLxSiNuTfNis9sI0WDE',

  /** GitHub repository NetSilcon-FPGA: every NetSilcon model (RTL, tools, trained models, logs). */
  githubUrl: 'https://github.com/kumarnitish378/NetSilcon-FPGA',

  /** Contact links. Leave a field empty ('') to hide it. */
  contact: {
    email: 'nitish.ns378@gmail.com',
    linkedin: 'https://www.linkedin.com/in/nitish-kumar-sharma-21801013b/',
    github: 'https://github.com/kumarnitish378',
  },
};

/** Link to a file or folder inside the repository */
export const repo = (path = '') => `${SITE.githubUrl.replace(/\/$/, '')}${path ? '/blob/main/' + path : ''}`;
export const repoTree = (path = '') => `${SITE.githubUrl.replace(/\/$/, '')}/tree/main/${path}`;

/** Model folders inside NetSilcon-FPGA */
export const M6X4 = 'NetSilcon-Models/NetSilcon-6x4/';
export const M64X6 = 'NetSilcon-Models/NetSilcon-64x6/';

/** Where people suggest a new use case (LinkedIn message) */
export const useCaseUrl = SITE.contact.linkedin;
