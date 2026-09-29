const { chromium } = require('@playwright/test');

const STORE_KEY = 'ai-resume-craft:store';
const BASE = 'http://localhost:4173';
const PATHS = ['/', '/create', '/resumes', '/templates', '/settings', '/nonexistent'];
const WIDTHS = [375, 414, 768, 1024, 1280, 1440];

(async () => {
  const browser = await chromium.launch();

  // ── 1. Preview pagination with a very long summary ──────────────────────
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const summary = 'Experienced engineer with a decade of building reliable systems, leading teams and shipping products end to end. '.repeat(200);
    await page.addInitScript(({ s }) => {
      const id = 'e2e-resume-1';
      localStorage.setItem(STORE_KEY, JSON.stringify({
        version: 2, savedAt: new Date().toISOString(),
        store: {
          resumes: [{
            id, title: 'My Resume', template: 'modern',
            personal: { fullName: '', email: '', phone: '', location: '', headline: '', website: '', linkedin: '', github: '', summary: s },
            experience: [], education: [], skills: [], projects: [], certifications: [],
          }],
          activeId: id,
        },
      }));
    }, { s: summary });
    await page.goto(BASE + '/editor');
    await page.waitForTimeout(2500);
    const probe = await page.evaluate(() => {
      const labels = [...document.querySelectorAll('button')]
        .map((b) => b.getAttribute('aria-label') || b.textContent.trim())
        .filter((t) => /page/i.test(t));
      const content = document.querySelector('div[style*="translateY"]');
      return {
        pageButtons: labels,
        contentHeight: content ? content.offsetHeight : null,
        summaryCharsInDom: (content ? content.textContent : '').length,
        pageText: [...document.querySelectorAll('span')].map((s) => s.textContent).filter((t) => /^Page \d+ of \d+$/.test(t || '')),
      };
    });
    console.log('PREVIEW:', JSON.stringify(probe, null, 2));
    await page.close();
  }

  // ── 2. Horizontal overflow sweep (returning user, 5 resumes) ────────────
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript((n) => {
    const raw = localStorage.getItem('ai-resume-craft:store');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.store?.resumes) && parsed.store.resumes.length > 0) return;
      } catch { /* reseed */ }
    }
    const resumes = Array.from({ length: n }, (_, i) => ({
      id: `e2e-r${i + 1}`, title: i === 0 ? 'My Resume' : `My Resume ${i + 1}`, template: 'modern',
      personal: { fullName: '', email: '', phone: '', location: '', headline: '', website: '', linkedin: '', github: '', summary: '' },
      experience: [], education: [], skills: [], projects: [], certifications: [],
    }));
    localStorage.setItem(STORE_KEY, JSON.stringify({
      version: 2, savedAt: new Date().toISOString(),
      store: { resumes, activeId: resumes[0].id },
    }));
  }, 5);

  const page = await context.newPage();
  const results = [];
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of PATHS) {
      await page.goto(BASE + path);
      await page.waitForTimeout(500);
      const probe = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        offenders: (() => {
          const docW = document.documentElement.clientWidth;
          const out = [];
          document.querySelectorAll('body *').forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && r.right > docW + 0.5) {
              // Ignore anything inside an overflow-hidden ancestor (clipped, not page-level)
              let p = el.parentElement, clipped = false;
              while (p && p !== document.body) {
                const ov = getComputedStyle(p).overflowX;
                if (ov === 'hidden' || ov === 'auto' || ov === 'scroll') { clipped = true; break; }
                p = p.parentElement;
              }
              if (!clipped) out.push(`${el.tagName}.${String(el.className).slice(0, 60)} right=${Math.round(r.right)}`);
            }
          });
          return out.slice(0, 4);
        })(),
      }));
      if (probe.overflow > 0) results.push({ width, path, ...probe });
    }
  }
  console.log(results.length === 0 ? 'OVERFLOW SWEEP: PASS (no page-level overflow anywhere)' : 'OVERFLOW ISSUES:');
  for (const r of results) console.log(JSON.stringify(r, null, 2));

  await page.close();
  await context.close();
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
