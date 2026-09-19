/* ============================================================
   Chirag Bhardwaj — Portfolio interactions
   ============================================================ */
(function () {
  const root = document.documentElement;
  root.classList.add('js');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- theme toggle ---------- */
  const themeBtn = document.getElementById('theme-toggle');
  function currentTheme() {
    const stamped = root.getAttribute('data-theme');
    if (stamped) return stamped;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  try {
    const saved = localStorage.getItem('cb-theme');
    if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);
  } catch (e) {}
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('cb-theme', next); } catch (e) {}
    });
  }

  /* ---------- scroll progress + active nav ---------- */
  const progress = document.querySelector('.progress');
  const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
  const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  function onScroll() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? h.scrollTop / max : 0;
    if (progress) progress.style.setProperty('--p', p.toFixed(4));

    let active = null;
    for (const s of sections) {
      if (s.getBoundingClientRect().top <= window.innerHeight * 0.4) active = s;
    }
    navLinks.forEach(a => a.classList.toggle('active', active && a.getAttribute('href') === '#' + active.id));

    // timeline line draw
    const tl = document.querySelector('.timeline');
    if (tl) {
      const r = tl.getBoundingClientRect();
      const vh = window.innerHeight;
      const done = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / r.height));
      tl.style.setProperty('--line-p', done.toFixed(3));
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
    // safety net: never leave content hidden
    setTimeout(() => revealEls.forEach(el => el.classList.add('in')), 2500);
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------- counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  function runCounter(el) {
    const target = parseFloat(el.getAttribute('data-count'));
    const dur = 1500;
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.round(target * eased);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
  }
  counters.forEach(el => {
    const metric = el.closest('.metric');
    if (reduced) { el.textContent = el.getAttribute('data-count'); if (metric) metric.classList.add('lit'); return; }
    setTimeout(() => { runCounter(el); if (metric) metric.classList.add('lit'); }, 1100);
  });

  /* ---------- rotating role line ---------- */
  const slot = document.querySelector('.rotator .slot');
  if (slot && !reduced) {
    const items = Array.from(slot.querySelectorAll('span'));
    let i = 0;
    items[0].classList.add('in');
    setInterval(() => {
      const cur = items[i];
      i = (i + 1) % items.length;
      const nxt = items[i];
      cur.classList.remove('in'); cur.classList.add('out');
      nxt.classList.remove('out'); nxt.classList.add('in');
      setTimeout(() => cur.classList.remove('out'), 600);
    }, 2600);
  } else if (slot) {
    slot.querySelector('span').classList.add('in');
  }

  /* ---------- cursor glow ---------- */
  const glow = document.querySelector('.glow');
  if (glow && finePointer && !reduced) {
    let gx = window.innerWidth / 2, gy = window.innerHeight / 3;
    let tx = gx, ty = gy;
    window.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() {
      gx += (tx - gx) * 0.08; gy += (ty - gy) * 0.08;
      glow.style.transform = `translate(${gx - 260}px, ${gy - 260}px)`;
      requestAnimationFrame(loop);
    })();
    glow.style.transform = `translate(${gx - 260}px, ${gy - 260}px)`;
  } else if (glow) {
    glow.style.display = 'none';
  }

  /* ---------- magnetic buttons ---------- */
  if (finePointer && !reduced) {
    document.querySelectorAll('.btn, .email-btn, .theme-btn').forEach(btn => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        btn.style.transform = `translate(${dx * 10}px, ${dy * 10}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- 3D tilt cards ---------- */
  if (finePointer && !reduced) {
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (0.5 - py) * 8;
        const ry = (px - 0.5) * 10;
        card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(4px)`;
        card.style.setProperty('--mx', (px * 100) + '%');
        card.style.setProperty('--my', (py * 100) + '%');
      });
      card.addEventListener('pointerleave', () => {
        card.style.transition = 'transform 0.6s cubic-bezier(0.22,1,0.36,1)';
        card.style.transform = '';
        setTimeout(() => { card.style.transition = ''; }, 600);
      });
    });
  }

  /* ---------- education bars ---------- */
  document.querySelectorAll('.edu-item').forEach(el => {
    if (reduced || !('IntersectionObserver' in window)) { el.classList.add('in'); return; }
    const io = new IntersectionObserver((en) => {
      if (en[0].isIntersecting) { el.classList.add('in'); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(el);
  });

  /* ---------- duplicate marquees for seamless loop ---------- */
  document.querySelectorAll('.marquee').forEach(m => {
    if (reduced) return;
    m.innerHTML += m.innerHTML;
  });

  /* ---------- node-network canvas ---------- */
  const canvas = document.getElementById('net');
  if (canvas && !reduced) {
    const ctx = canvas.getContext('2d');
    let W, H, nodes = [], dpr = Math.min(2, window.devicePixelRatio || 1);
    let mouse = { x: -9999, y: -9999 };
    let running = true;

    function size() {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(28, Math.min(80, Math.floor((W * H) / 22000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: 1 + Math.random() * 1.6
      }));
    }
    function css(name) { return getComputedStyle(root).getPropertyValue(name).trim(); }
    function frame() {
      if (!running) return;
      const nodeRGB = css('--node');
      const nodeA = parseFloat(css('--node-alpha')) || 0.5;
      const linkA = parseFloat(css('--link-alpha')) || 0.1;
      ctx.clearRect(0, 0, W, H);
      const linkDist = 130;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        // gentle attraction to pointer
        const dx = mouse.x - n.x, dy = mouse.y - n.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 200 * 200) { n.x += dx * 0.002; n.y += dy * 0.002; }
        if (n.x < -10) n.x = W + 10; if (n.x > W + 10) n.x = -10;
        if (n.y < -10) n.y = H + 10; if (n.y > H + 10) n.y = -10;
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < linkDist) {
            ctx.strokeStyle = `rgba(${nodeRGB}, ${(1 - d / linkDist) * linkA})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.fillStyle = `rgba(${nodeRGB}, ${nodeA})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    size();
    window.addEventListener('resize', size);
    window.addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
      if (running) requestAnimationFrame(frame);
    });
    requestAnimationFrame(frame);
  }

  /* ---------- footer year ---------- */
  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();
})();
