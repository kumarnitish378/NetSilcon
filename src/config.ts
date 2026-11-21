// One place for everything that points outside the site.
// Replace the placeholders before publishing.
export const SITE = {
  name: 'NetSilcon',
  tagline: 'Fix the shape. Load the numbers. New job.',
  description:
    'NetSilcon is open-source neural-network hardware: a fixed network shape with loadable weights, biases and shifts. The FPGA reference runs in 15 clock cycles, bit-exact.',
  author: 'Nitish Kumar Sharma',

  /** GitHub repository of NetSilcon-6x4 (the RTL, tools and models). */
  githubUrl: 'https://github.com/kumarnitish378/NetSilcon-6x4',

  /** Contact links. PLACEHOLDERS: fill in, or leave empty ('') to hide a line. */
  contact: {
    email: '',
    linkedin: '',
    github: 'https://github.com/kumarnitish378',
  },
};

/** Link to a file or folder inside the repository */
export const repo = (path = '') => `${SITE.githubUrl.replace(/\/$/, '')}${path ? '/blob/main/' + path : ''}`;
export const repoTree = (path = '') => `${SITE.githubUrl.replace(/\/$/, '')}/tree/main/${path}`;
