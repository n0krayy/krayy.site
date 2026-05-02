/* ═══════════════════════════════════════════════════
   TERMINAL PORTFOLIO — script.js
   Handles: boot sequence · typing · scroll reveal
            uptime · CLI input · session clock
════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── CONFIG ─────────────────────────────────────── */
  const START_TS = Date.now();

  /* ── HELPERS ─────────────────────────────────────── */
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function fmtUptime(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s`;
  }

  function fmtTime(d) {
    return d.toLocaleTimeString('en-US', { hour12: false });
  }

  function fmtDate(d) {
    return d.toISOString().split('T')[0];
  }

  /* ── BOOT SEQUENCE ───────────────────────────────── */
  const BOOT_LINES = [
    { text: 'BIOS v2.4.1  —  Initializing POST...', delay: 0,   color: 'dim' },
    { text: 'Memory check: 16384MB OK', delay: 120, color: 'dim' },
    { text: 'Loading kernel modules...', delay: 200, color: 'dim' },
    { text: '', delay: 300, color: '' },
    { text: '[    0.000000] Booting portfolio-os 6.1.0-brayy', delay: 380, color: '' },
    { text: '[    0.081244] ACPI: IRQ0 used by override.', delay: 480, color: 'dim' },
    { text: '[    0.213891] Mounting /proc filesystem...   [  OK  ]', delay: 560, color: '' },
    { text: '[    0.299102] Mounting /sys filesystem...   [  OK  ]', delay: 640, color: '' },
    { text: '[    0.412889] Starting network services...  [  OK  ]', delay: 720, color: '' },
    { text: '', delay: 820, color: '' },
    { text: 'Loading portfolio modules:', delay: 880, color: '' },
    { text: '  ├─ [sections]   hero, about, skills, projects ... [DONE]', delay: 980, color: 'green' },
    { text: '  ├─ [animations] typing, reveal, cursor ........... [DONE]', delay: 1080, color: 'green' },
    { text: '  ├─ [cli]        command parser loaded ............. [DONE]', delay: 1160, color: 'green' },
    { text: '  └─ [assets]     fonts, stylesheets ............... [DONE]', delay: 1240, color: 'green' },
    { text: '', delay: 1320, color: '' },
    { text: '──────────────────────────────────────────────────────────', delay: 1380, color: 'dim' },
    { text: 'Welcome to portfolio-os.  Type `help` to see commands.', delay: 1440, color: 'bright' },
    { text: `Session started: ${fmtDate(new Date())} ${fmtTime(new Date())}`, delay: 1520, color: 'dim' },
    { text: '──────────────────────────────────────────────────────────', delay: 1580, color: 'dim' },
  ];

  async function runBoot() {
    const log = document.getElementById('boot-log');

    for (const item of BOOT_LINES) {
      await sleep(item.delay === 0 ? 0 : (item.delay - (BOOT_LINES[BOOT_LINES.indexOf(item) - 1]?.delay || 0)));
      const el = document.createElement('div');
      el.className = 'boot-line';
      el.textContent = item.text;
      if (item.color === 'green')  el.style.color = '#39d353';
      if (item.color === 'dim')    el.style.color = '#556070';
      if (item.color === 'bright') el.style.color = '#e8edf2';
      log.appendChild(el);
      log.scrollTop = log.scrollHeight;
    }

    await sleep(600);

    // Fade out boot overlay
    const overlay = document.getElementById('boot-overlay');
    overlay.style.transition = 'opacity 0.5s ease';
    overlay.style.opacity = '0';
    await sleep(500);
    overlay.style.display = 'none';

    // Show app
    const app = document.getElementById('app');
    app.classList.remove('hidden');
    app.style.opacity = '0';
    app.style.transition = 'opacity 0.4s ease';
    requestAnimationFrame(() => { app.style.opacity = '1'; });

    await sleep(200);
    initTyping();
  }

  /* ── TYPING ANIMATION (hero cmd) ─────────────────── */
  async function typeText(el, text, speed = 55) {
    el.style.width = '0';
    el.style.borderRight = '2px solid var(--green)';
    el.textContent = '';
    el.style.display = 'inline-block';

    for (let i = 0; i <= text.length; i++) {
      el.textContent = text.slice(0, i);
      el.style.width = 'auto';
      await sleep(speed + Math.random() * 30);
    }

    await sleep(300);
    el.style.borderRight = 'none';
    el.classList.add('done');

    return;
  }

  async function initTyping() {
    const heroCmd = document.getElementById('hero-cmd');
    if (heroCmd) {
      await sleep(300);
      await typeText(heroCmd, './init_portfolio.sh', 60);
      await sleep(200);

      // Reveal hero output lines
      const infoBlock  = document.querySelector('.hero-info');
      const menuBlock  = document.querySelector('.hero-menu');
      if (infoBlock)  infoBlock.classList.add('done');
      if (menuBlock)  {
        await sleep(400);
        menuBlock.classList.add('done');
      }
    }

    // Kick off scroll observer after hero animation
    initScrollReveal();
    updateUptime();
    setInterval(updateUptime, 1000);
  }

  /* ── SCROLL REVEAL ───────────────────────────────── */
  function initScrollReveal() {
    const sections = document.querySelectorAll('.term-section');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.07 });

    sections.forEach(s => obs.observe(s));

    // Hero section is immediately visible
    const hero = document.getElementById('hero');
    if (hero) hero.classList.add('visible');
  }

  /* ── UPTIME COUNTER ──────────────────────────────── */
  function updateUptime() {
    const elapsed = Date.now() - START_TS;
    const str = fmtUptime(elapsed);
    const el1 = document.getElementById('uptime-val');
    const el2 = document.getElementById('footer-uptime');
    if (el1) el1.textContent = str;
    if (el2) el2.textContent = str;
  }

  /* ── SESSION CLOCK ────────────────────────────────── */
  function updateClock() {
    const el = document.getElementById('session-time');
    if (el) el.textContent = fmtTime(new Date());
  }
  setInterval(updateClock, 1000);
  updateClock();

  /* ── FOOTER YEAR ─────────────────────────────────── */
  const fyEl = document.getElementById('footer-year');
  if (fyEl) fyEl.textContent = new Date().getFullYear();

  /* ── CLI COMMAND PALETTE ─────────────────────────── */
  const CLI_COMMANDS = {
    help: () => `
<span style="color:var(--cyan)">Available commands:</span>
  <span style="color:var(--green)">about</span>       → scroll to About section
  <span style="color:var(--green)">skills</span>      → scroll to Skills section
  <span style="color:var(--green)">projects</span>    → scroll to Projects section
  <span style="color:var(--green)">experience</span>  → scroll to Experience section
  <span style="color:var(--green)">blog</span>        → scroll to Blog section
  <span style="color:var(--green)">contact</span>     → scroll to Contact section
  <span style="color:var(--green)">whoami</span>      → display identity info
  <span style="color:var(--green)">ls</span>          → list all sections
  <span style="color:var(--green)">clear</span>       → clear CLI output
  <span style="color:var(--green)">top</span>         → scroll to top
  <span style="color:var(--green)">exit</span>        → close CLI bar
`,
    whoami: () => `<span style="color:var(--fg-bright)">brayy</span> — IT · Cybersecurity · Automation
Building systems, learning security, documenting the journey.`,

    ls: () => `<span style="color:var(--cyan)">Sections:</span>
  drwxr-xr-x  hero/          → landing &amp; intro
  drwxr-xr-x  about/         → background &amp; bio
  drwxr-xr-x  skills/        → tech stack
  drwxr-xr-x  projects/      → portfolio projects
  drwxr-xr-x  experience/    → journey timeline
  drwxr-xr-x  blog/          → write-ups &amp; notes
  drwxr-xr-x  contact/       → social links`,

    about:      () => { scrollTo('about');      return '<span style="color:var(--dim)">→ Scrolling to about...</span>'; },
    skills:     () => { scrollTo('skills');     return '<span style="color:var(--dim)">→ Scrolling to skills...</span>'; },
    projects:   () => { scrollTo('projects');   return '<span style="color:var(--dim)">→ Scrolling to projects...</span>'; },
    experience: () => { scrollTo('experience'); return '<span style="color:var(--dim)">→ Scrolling to experience...</span>'; },
    blog:       () => { scrollTo('blog');       return '<span style="color:var(--dim)">→ Scrolling to blog...</span>'; },
    contact:    () => { scrollTo('contact');    return '<span style="color:var(--dim)">→ Scrolling to contact...</span>'; },
    top:        () => { window.scrollTo({top:0,behavior:'smooth'}); return '<span style="color:var(--dim)">→ Back to top.</span>'; },

    clear: () => {
      const out = document.getElementById('cli-output');
      if (out) out.innerHTML = '';
      return null; // no output
    },

    exit: () => {
      closeCliBar();
      return null;
    },

    date: () => `${fmtDate(new Date())} ${fmtTime(new Date())}`,
    uname: () => 'portfolio-os 6.1.0-brayy x86_64 GNU/Linux',
    uptime: () => fmtUptime(Date.now() - START_TS),
    pwd:   () => '/home/brayy/portfolio',
    echo:  (args) => args.join(' ') || '',
  };

  function scrollTo(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function openCliBar() {
    const bar = document.getElementById('cli-bar');
    if (!bar) return;
    bar.classList.remove('hidden');
    bar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => document.getElementById('cli-input')?.focus(), 100);
  }

  function closeCliBar() {
    const bar = document.getElementById('cli-bar');
    if (bar) bar.classList.add('hidden');
  }

  function runCliCommand(raw) {
    const parts = raw.trim().split(/\s+/);
    const cmd   = parts[0].toLowerCase();
    const args  = parts.slice(1);

    const out = document.getElementById('cli-output');
    if (!out) return;

    // Echo the command
    const echoEl = document.createElement('div');
    echoEl.innerHTML = `<span style="color:var(--fg-dim)">brayy@portfolio:~$</span> <span style="color:var(--fg-bright)">${escapeHtml(raw)}</span>`;
    out.appendChild(echoEl);

    if (cmd === '') {
      out.appendChild(document.createElement('br'));
      return;
    }

    const fn = CLI_COMMANDS[cmd];
    let result;

    if (fn) {
      result = fn(args);
    } else {
      result = `<span style="color:var(--red)">bash: ${escapeHtml(cmd)}: command not found</span>
<span style="color:var(--fg-dim)">Type <span style="color:var(--green)">help</span> to see available commands.</span>`;
    }

    if (result !== null && result !== undefined) {
      const resEl = document.createElement('div');
      resEl.innerHTML = result;
      resEl.style.marginBottom = '0.4rem';
      out.appendChild(resEl);
    }

    out.scrollTop = out.scrollHeight;
  }

  function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ── CLI BUTTON ──────────────────────────────────── */
  document.getElementById('open-cli-btn')?.addEventListener('click', () => {
    const bar = document.getElementById('cli-bar');
    if (bar?.classList.contains('hidden')) {
      openCliBar();
    } else {
      closeCliBar();
    }
  });

  /* ── CLI INPUT HANDLER ────────────────────────────── */
  const cliInput = document.getElementById('cli-input');
  const history = [];
  let histIdx = -1;

  cliInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = cliInput.value;
      if (val.trim()) {
        history.unshift(val);
        histIdx = -1;
      }
      runCliCommand(val);
      cliInput.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx < history.length - 1) {
        histIdx++;
        cliInput.value = history[histIdx] || '';
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx > 0) {
        histIdx--;
        cliInput.value = history[histIdx] || '';
      } else {
        histIdx = -1;
        cliInput.value = '';
      }
    } else if (e.key === 'Escape') {
      closeCliBar();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const partial = cliInput.value.trim().toLowerCase();
      const matches = Object.keys(CLI_COMMANDS).filter(k => k.startsWith(partial));
      if (matches.length === 1) {
        cliInput.value = matches[0];
      } else if (matches.length > 1) {
        runCliCommand('');
        const hintEl = document.createElement('div');
        hintEl.innerHTML = `<span style="color:var(--fg-dim)">${matches.join('  ')}</span>`;
        document.getElementById('cli-output')?.appendChild(hintEl);
      }
    }
  });

  /* ── KEYBOARD SHORTCUT: Ctrl+` ────────────────────── */
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === '`') {
      e.preventDefault();
      const bar = document.getElementById('cli-bar');
      if (bar?.classList.contains('hidden')) openCliBar();
      else closeCliBar();
    }
  });

  /* ── ACTIVE NAV HIGHLIGHT ─────────────────────────── */
  const navLinks = document.querySelectorAll('.nav-cmd[data-cmd]');
  const sectionIds = ['hero', 'about', 'skills', 'projects', 'experience', 'blog', 'contact'];

  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          const cmd = link.dataset.cmd;
          const match = (cmd === '~' && id === 'hero') ||
                        id.startsWith(cmd);
          link.style.color = match ? 'var(--green)' : '';
        });
      }
    });
  }, { threshold: 0.35 });

  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) sectionObs.observe(el);
  });

  /* ── BOOT ─────────────────────────────────────────── */
  runBoot();

})();
