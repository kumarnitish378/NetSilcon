// Small site-wide behaviours: theme toggle, mobile menu, count-up numbers, bars that grow into view.
export function initSite() {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.getElementById('theme-btn')?.addEventListener('click', () => {
    const t = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = t;
    try { localStorage.setItem('ns-theme', t); } catch (e) { /* storage may be unavailable */ }
  });

  const head = document.getElementById('site-head');
  const menu = document.getElementById('menu-btn');
  menu?.addEventListener('click', () => {
    const open = !head.classList.contains('open');
    head.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && head?.classList.contains('open')) { head.classList.remove('open'); menu?.setAttribute('aria-expanded', 'false'); menu?.focus(); }
  });

  const fmt = (n, sep) => (sep ? n.toLocaleString('en-US') : String(n));
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      const t = e.target;
      if (t.classList.contains('grow')) { t.classList.add('in'); continue; }
      const to = Number(t.dataset.to), sep = t.dataset.sep === '1';
      if (reduce) { t.textContent = fmt(to, sep); continue; }
      const t0 = performance.now(), D = 900;
      const step = (now) => {
        const p = Math.min(1, (now - t0) / D);
        t.textContent = fmt(Math.round(to * (1 - Math.pow(1 - p, 3))), sep);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }, { threshold: 0.35 });
  document.querySelectorAll('.cu, .grow').forEach((n) => io.observe(n));
}
