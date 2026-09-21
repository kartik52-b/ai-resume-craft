import { describe, it, expect } from 'vitest';
import {
  layoutResume, wrapText, getStyleProfile, buildResumePdf,
  PAGE_W, PAGE_H, MARGIN_X, MARGIN_TOP, MARGIN_BOTTOM, CONTENT_W,
} from '@/lib/pdfEngine';
import { createEmptyResume } from '@/types/resume';

const fillResume = (bullets: string[] = ['Reduced load time by 40%']) => {
  const r = createEmptyResume();
  r.personal.fullName = 'Aarav Singh';
  r.personal.email = 'jane@example.com';
  r.personal.phone = '+49 30 123456';
  r.personal.location = 'Berlin, DE';
  r.personal.summary = 'Software engineer focused on reliable web systems and developer experience.';
  r.experience = [
    { id: 'e1', position: 'Senior Engineer', company: 'Acme', location: 'Berlin', startDate: '2020', endDate: '', current: true, bullets },
    { id: 'e2', position: 'Engineer', company: 'Globex', location: 'Remote', startDate: '2017', endDate: '2020', current: false, bullets: ['Built features'] },
  ];
  r.education = [{ id: 'ed1', school: 'TU Berlin', degree: 'BSc', field: 'CS', startDate: '2013', endDate: '2017', gpa: '' }];
  r.skills = ['TypeScript', 'React', 'Node.js', 'SQL', 'Docker', 'Git'];
  return r;
};

describe('wrapText', () => {
  it('wraps long text into lines that fit the width', () => {
    const lines = wrapText('word '.repeat(80).trim(), 10, CONTENT_W, 0.5);
    expect(lines.length).toBeGreaterThan(1);
    for (const line of lines) {
      expect(line.length).toBeLessThanOrEqual(Math.floor(CONTENT_W / (10 * 0.352778 * 0.5)));
    }
  });

  it('hard-splits words longer than a full line', () => {
    const lines = wrapText('x'.repeat(200), 10, 40, 0.5);
    expect(lines.length).toBeGreaterThan(1);
    expect(lines.join('')).toBe('x'.repeat(200));
  });

  it('returns empty for empty input', () => {
    expect(wrapText('', 10, CONTENT_W, 0.5)).toEqual([]);
  });
});

describe('layoutResume', () => {
  it('keeps all content inside page margins', () => {
    const { elements } = layoutResume(fillResume(['x'.repeat(300), 'y'.repeat(300)]));
    for (const el of elements) {
      expect(el.x).toBeGreaterThanOrEqual(MARGIN_X - 0.01);
      expect(el.x).toBeLessThanOrEqual(PAGE_W - MARGIN_X + 0.01);
      expect(el.y).toBeGreaterThanOrEqual(MARGIN_TOP - 0.01);
      expect(el.y).toBeLessThanOrEqual(PAGE_H - MARGIN_BOTTOM + 8.1); // footer zone
    }
  });

  it('produces multiple pages for long resumes', () => {
    // ~3 wrapped lines per bullet × 60 bullets + 3 roles ≈ 2+ A4 pages.
    const longBullets = Array.from({ length: 20 }, (_, i) => `Delivered end-to-end initiative ${i} spanning requirements, architecture, implementation and rollout, coordinating with four teams and reducing reported incidents by ${i % 9 + 2}0% within the first two quarters of ownership`);
    const r = fillResume(longBullets);
    r.experience = [
      ...r.experience,
      { id: 'e3', position: 'Lead', company: 'Initech', location: 'Remote', startDate: '2014', endDate: '2017', current: false, bullets: longBullets },
      { id: 'e4', position: 'Engineer', company: 'Umbrella', location: 'Berlin', startDate: '2011', endDate: '2014', current: false, bullets: longBullets },
    ];
    const { totalPages } = layoutResume(r);
    expect(totalPages).toBeGreaterThan(1);
  });

  it('produces exactly one page for a short resume', () => {
    const { totalPages } = layoutResume(fillResume());
    expect(totalPages).toBe(1);
  });

  it('handles empty optional sections without gaps or crashes', () => {
    const r = createEmptyResume();
    r.personal.fullName = 'Aarav Singh';
    const { elements, totalPages } = layoutResume(r);
    expect(totalPages).toBe(1);
    expect(elements.some((e) => e.text === 'Aarav Singh')).toBe(true);
  });

  it('never orphans a section title at the bottom of a page', () => {
    const { elements } = layoutResume(fillResume(Array.from({ length: 40 }, (_, i) => `Long achievement ${i} `.repeat(6))));
    for (const el of elements) {
      if (!/[A-Z]/.test(el.text[0] ?? '') || el.size < 10) continue;
      const isTitle = el.text === el.text.toUpperCase() && el.bold && el.size >= 9.5;
      if (!isTitle) continue;
      const lastOnPage = elements.filter((e) => e.page === el.page && e.text !== `${el.page} / ${Math.max(...elements.map((x) => x.page))}`).at(-1);
      if (lastOnPage && el !== lastOnPage) continue;
      // A title may only be the last element if followed by content on the next page — disallow outright:
      expect(isTitle && el === lastOnPage).toBe(false);
    }
  });

  it('adds page-number footers for every page', () => {
    const long = fillResume(Array.from({ length: 35 }, (_, i) => `Achievement ${i} delivering ${i}% improvements across systems`));
    const { elements, totalPages } = layoutResume(long);
    for (let p = 1; p <= totalPages; p++) {
      expect(elements.some((e) => e.page === p && e.text === `${p} / ${totalPages}`)).toBe(true);
    }
  });

  it('uses a different typographic profile per template', () => {
    expect(getStyleProfile('modern').font).toBe('helvetica');
    expect(getStyleProfile('minimal').font).toBe('courier');
    expect(getStyleProfile('professional').font).toBe('times');
    const r = fillResume();
    r.template = 'professional';
    const { style } = layoutResume(r);
    expect(style.font).toBe('times');
  });

  it('honors section order and visibility', () => {
    const r = fillResume();
    r.sectionOrder = ['personal', 'skills', 'experience'];
    r.hiddenSections = ['education', 'projects', 'certifications'];
    const { elements } = layoutResume(r);
    const text = elements.map((e) => e.text).join('\n');
    expect(text).toContain('SKILLS');
    expect(text).not.toContain('EDUCATION');
  });
});

describe('buildResumePdf', () => {
  it('produces a document whose page count matches the layout', () => {
    const longBullets = Array.from({ length: 20 }, (_, i) => `Initiative ${i} delivered across the full lifecycle with four teams, cutting incidents ${i % 5 + 1}0%`);
    const r = fillResume(longBullets);
    r.experience = [...r.experience, { id: 'e3', position: 'Lead', company: 'Initech', location: '', startDate: '2014', endDate: '2017', current: false, bullets: longBullets }];
    const doc = buildResumePdf(r);
    const { totalPages } = layoutResume(r);
    expect(typeof doc.save).toBe('function');
    expect(doc.getNumberOfPages()).toBe(totalPages);
  });
});
