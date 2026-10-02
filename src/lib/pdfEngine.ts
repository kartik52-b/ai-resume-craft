import { jsPDF } from 'jspdf';
import { type ResumeData } from '@/types/resume';
import { resumeToSections } from '@/lib/resumeText';

/**
 * Text-based PDF engine (replaces the html2canvas single-page raster).
 *
 * Architecture:
 *   1. `layoutResume()` — PURE function: converts ResumeData into positioned
 *      text elements across A4 pages (mm coordinates). No DOM, fully unit
 *      testable (margins, page breaks, orphan titles).
 *   2. `buildResumePdf()` — renders the laid-out elements with jsPDF so the
 *      PDF contains real selectable text.
 *   3. `downloadResumePdf()` — saves with a filename derived from the resume.
 *
 * Template-awareness: each template maps to a typographic profile
 * (font/casing/rules). Section order and visibility come from the shared
 * section logic (resolveSectionOrder via resumeToSections), so the PDF always
 * matches what the preview shows.
 */

// --- A4 geometry (mm) ---
export const PAGE_W = 210;
export const PAGE_H = 297;
export const MARGIN_X = 18;
export const MARGIN_TOP = 16;
export const MARGIN_BOTTOM = 18;
export const CONTENT_W = PAGE_W - MARGIN_X * 2;

export type PdfFont = 'helvetica' | 'times' | 'courier';

interface StyleProfile {
  font: PdfFont;
  nameSize: number;
  contactSize: number;
  titleSize: number;
  bodySize: number;
  lineHeightFactor: number;
  sectionUppercase: boolean;
  sectionRule: boolean;
  bullet: string;
  /** Average glyph width as a fraction of font size (for pure text wrapping). */
  charRatio: number;
  /** Sidebar background color (RGB) for 'sidebar' layouts */
  sidebarBg?: [number, number, number];
  /** Sidebar text color (RGB) */
  sidebarText?: [number, number, number];
}

/**
 * Structural profile: page geometry that must survive into the PDF.
 * Kept separate from the typographic profile so a template can change one
 * without disturbing the other, and so every template has an explicit entry.
 */
export interface LayoutProfile {
  headerAlign: 'left' | 'center';
  columns: 'single' | 'sidebar-left' | 'sidebar-right';
  /** Sidebar width as a fraction of the content width. */
  sidebarRatio: number;
  /** Draw a hairline rule beneath the name/contact block. */
  nameRule: boolean;
}

const STYLE_PROFILES: Record<string, StyleProfile> = {
  modern: {
    font: 'helvetica', nameSize: 22, contactSize: 9.5, titleSize: 10.5, bodySize: 9.5,
    lineHeightFactor: 1.45, sectionUppercase: true, sectionRule: true, bullet: '•', charRatio: 0.5,
  },
  minimal: {
    font: 'courier', nameSize: 18, contactSize: 9, titleSize: 9.5, bodySize: 9,
    lineHeightFactor: 1.5, sectionUppercase: true, sectionRule: false, bullet: '-', charRatio: 0.6,
  },
  professional: {
    font: 'times', nameSize: 23, contactSize: 9.5, titleSize: 11, bodySize: 10,
    lineHeightFactor: 1.4, sectionUppercase: true, sectionRule: true, bullet: '•', charRatio: 0.48,
  },
  'ats-classic': {
    font: 'helvetica', nameSize: 20, contactSize: 9, titleSize: 10, bodySize: 9.5,
    lineHeightFactor: 1.4, sectionUppercase: false, sectionRule: false, bullet: '•', charRatio: 0.5,
  },
  student: {
    font: 'helvetica', nameSize: 20, contactSize: 9, titleSize: 10, bodySize: 9.5,
    lineHeightFactor: 1.45, sectionUppercase: true, sectionRule: true, bullet: '▸', charRatio: 0.5,
  },
  tech: {
    font: 'courier', nameSize: 20, contactSize: 8.5, titleSize: 9.5, bodySize: 9,
    lineHeightFactor: 1.45, sectionUppercase: true, sectionRule: true, bullet: '›', charRatio: 0.58,
  },
  executive: {
    font: 'times', nameSize: 26, contactSize: 10, titleSize: 12, bodySize: 10.5,
    lineHeightFactor: 1.35, sectionUppercase: true, sectionRule: true, bullet: '•', charRatio: 0.48,
  },
  creative: {
    font: 'helvetica', nameSize: 24, contactSize: 9.5, titleSize: 10.5, bodySize: 9.5,
    lineHeightFactor: 1.45, sectionUppercase: true, sectionRule: true, bullet: '▸', charRatio: 0.5,
  },
  academic: {
    font: 'times', nameSize: 22, contactSize: 9.5, titleSize: 10.5, bodySize: 10,
    lineHeightFactor: 1.5, sectionUppercase: true, sectionRule: true, bullet: '•', charRatio: 0.48,
  },
  developer: {
    font: 'courier', nameSize: 20, contactSize: 9, titleSize: 9.5, bodySize: 9,
    lineHeightFactor: 1.45, sectionUppercase: true, sectionRule: true, bullet: '›', charRatio: 0.58,
  },
  corporate: {
    font: 'helvetica', nameSize: 21, contactSize: 9.5, titleSize: 10, bodySize: 9.5,
    lineHeightFactor: 1.4, sectionUppercase: true, sectionRule: true, bullet: '•', charRatio: 0.5,
  },
  elegant: {
    font: 'times', nameSize: 24, contactSize: 9, titleSize: 9, bodySize: 10,
    lineHeightFactor: 1.55, sectionUppercase: true, sectionRule: false, bullet: '•', charRatio: 0.48,
  },
  compact: {
    font: 'helvetica', nameSize: 16, contactSize: 8.5, titleSize: 8.5, bodySize: 9,
    lineHeightFactor: 1.3, sectionUppercase: true, sectionRule: true, bullet: '•', charRatio: 0.5,
  },
  'two-column': {
    font: 'helvetica', nameSize: 17, contactSize: 8.5, titleSize: 10, bodySize: 9.5,
    lineHeightFactor: 1.4, sectionUppercase: true, sectionRule: true, bullet: '▸', charRatio: 0.5,
    sidebarBg: [15, 40, 50], sidebarText: [220, 240, 240],
  },
  portfolio: {
    font: 'helvetica', nameSize: 23, contactSize: 9, titleSize: 9.5, bodySize: 9.5,
    lineHeightFactor: 1.45, sectionUppercase: true, sectionRule: true, bullet: '▸', charRatio: 0.5,
    sidebarBg: [24, 24, 27], sidebarText: [240, 240, 250],
  },
  startup: {
    font: 'helvetica', nameSize: 22, contactSize: 9, titleSize: 10, bodySize: 9.5,
    lineHeightFactor: 1.45, sectionUppercase: true, sectionRule: true, bullet: '→', charRatio: 0.5,
  },
  engineering: {
    font: 'courier', nameSize: 20, contactSize: 8.5, titleSize: 9.5, bodySize: 9,
    lineHeightFactor: 1.45, sectionUppercase: true, sectionRule: true, bullet: '▸', charRatio: 0.58,
  },
  finance: {
    font: 'times', nameSize: 22, contactSize: 9, titleSize: 10, bodySize: 10,
    lineHeightFactor: 1.4, sectionUppercase: true, sectionRule: false, bullet: '•', charRatio: 0.48,
  },
  consultant: {
    font: 'helvetica', nameSize: 21, contactSize: 9, titleSize: 10, bodySize: 9.5,
    lineHeightFactor: 1.45, sectionUppercase: true, sectionRule: true, bullet: '•', charRatio: 0.5,
  },
  research: {
    font: 'times', nameSize: 22, contactSize: 9, titleSize: 10, bodySize: 10,
    lineHeightFactor: 1.6, sectionUppercase: false, sectionRule: false, bullet: '•', charRatio: 0.48,
  },
  marketing: {
    font: 'helvetica', nameSize: 24, contactSize: 9, titleSize: 10.5, bodySize: 9.5,
    lineHeightFactor: 1.45, sectionUppercase: true, sectionRule: true, bullet: '→', charRatio: 0.5,
  },
  designer: {
    font: 'helvetica', nameSize: 23, contactSize: 9, titleSize: 10, bodySize: 9.5,
    lineHeightFactor: 1.45, sectionUppercase: true, sectionRule: true, bullet: '·', charRatio: 0.5,
    sidebarBg: [253, 242, 248], sidebarText: [131, 24, 67],
  },
  healthcare: {
    font: 'helvetica', nameSize: 21, contactSize: 9, titleSize: 10, bodySize: 9.5,
    lineHeightFactor: 1.45, sectionUppercase: true, sectionRule: true, bullet: '•', charRatio: 0.5,
  },
  legal: {
    font: 'times', nameSize: 22, contactSize: 9, titleSize: 10, bodySize: 10,
    lineHeightFactor: 1.5, sectionUppercase: true, sectionRule: false, bullet: '•', charRatio: 0.48,
  },
  international: {
    font: 'helvetica', nameSize: 21, contactSize: 9, titleSize: 10, bodySize: 9.5,
    lineHeightFactor: 1.45, sectionUppercase: true, sectionRule: true, bullet: '•', charRatio: 0.5,
  },
  social: {
    font: 'helvetica', nameSize: 23, contactSize: 9.5, titleSize: 11, bodySize: 9.5,
    lineHeightFactor: 1.45, sectionUppercase: true, sectionRule: true, bullet: '•', charRatio: 0.5,
  },
  tim: {
    font: 'helvetica', nameSize: 20, contactSize: 9, titleSize: 10, bodySize: 9.5,
    lineHeightFactor: 1.45, sectionUppercase: true, sectionRule: true, bullet: '•', charRatio: 0.5,
  },
  mark: {
    font: 'times', nameSize: 24, contactSize: 9.5, titleSize: 10.5, bodySize: 10,
    lineHeightFactor: 1.5, sectionUppercase: true, sectionRule: true, bullet: '•', charRatio: 0.48,
  },
  shelah: {
    font: 'courier', nameSize: 20, contactSize: 9, titleSize: 9.5, bodySize: 9,
    lineHeightFactor: 1.45, sectionUppercase: true, sectionRule: true, bullet: '›', charRatio: 0.58,
  },
  moon: {
    font: 'helvetica', nameSize: 22, contactSize: 9, titleSize: 10, bodySize: 9.5,
    lineHeightFactor: 1.4, sectionUppercase: true, sectionRule: true, bullet: '•', charRatio: 0.5,
  },
  max: {
    font: 'helvetica', nameSize: 21, contactSize: 9, titleSize: 10, bodySize: 9.5,
    lineHeightFactor: 1.45, sectionUppercase: true, sectionRule: true, bullet: '•', charRatio: 0.5,
  },
  lana: {
    font: 'helvetica', nameSize: 21, contactSize: 9, titleSize: 10, bodySize: 9.5,
    lineHeightFactor: 1.45, sectionUppercase: true, sectionRule: true, bullet: '•', charRatio: 0.5,
  },
  timeless: {
    font: 'times', nameSize: 25, contactSize: 9.5, titleSize: 11, bodySize: 10.5,
    lineHeightFactor: 1.55, sectionUppercase: true, sectionRule: true, bullet: '•', charRatio: 0.48,
  },
  plain: {
    font: 'courier', nameSize: 18, contactSize: 9, titleSize: 9.5, bodySize: 9,
    lineHeightFactor: 1.6, sectionUppercase: true, sectionRule: false, bullet: '-', charRatio: 0.6,
  },
  blogger: {
    font: 'helvetica', nameSize: 20, contactSize: 9, titleSize: 10, bodySize: 9.5,
    lineHeightFactor: 1.45, sectionUppercase: true, sectionRule: true, bullet: '•', charRatio: 0.5,
  },
  pacific: {
    font: 'helvetica', nameSize: 21, contactSize: 9, titleSize: 10, bodySize: 9.5,
    lineHeightFactor: 1.45, sectionUppercase: true, sectionRule: true, bullet: '•', charRatio: 0.5,
  },
  comic: {
    font: 'helvetica', nameSize: 21, contactSize: 9, titleSize: 10, bodySize: 9.5,
    lineHeightFactor: 1.45, sectionUppercase: true, sectionRule: true, bullet: '•', charRatio: 0.5,
  },
  kaly: {
    font: 'helvetica', nameSize: 21, contactSize: 9, titleSize: 10, bodySize: 9.5,
    lineHeightFactor: 1.45, sectionUppercase: true, sectionRule: true, bullet: '•', charRatio: 0.5,
  },
  mula: {
    font: 'helvetica', nameSize: 21, contactSize: 9, titleSize: 10, bodySize: 9.5,
    lineHeightFactor: 1.45, sectionUppercase: true, sectionRule: true, bullet: '•', charRatio: 0.5,
  },
  bela: {
    font: 'helvetica', nameSize: 21, contactSize: 9, titleSize: 10, bodySize: 9.5,
    lineHeightFactor: 1.45, sectionUppercase: true, sectionRule: true, bullet: '•', charRatio: 0.5,
  },
  'general-ats': {
    font: 'helvetica', nameSize: 20, contactSize: 9, titleSize: 10, bodySize: 9.5,
    lineHeightFactor: 1.45, sectionUppercase: false, sectionRule: false, bullet: '•', charRatio: 0.5,
  },
  freshman: {
    font: 'helvetica', nameSize: 23, contactSize: 9, titleSize: 10, bodySize: 9.5,
    lineHeightFactor: 1.45, sectionUppercase: true, sectionRule: true, bullet: '▸', charRatio: 0.5,
  },
  graphic: {
    font: 'helvetica', nameSize: 22, contactSize: 9, titleSize: 10, bodySize: 9.5,
    lineHeightFactor: 1.45, sectionUppercase: true, sectionRule: true, bullet: '·', charRatio: 0.5,
  },
};

export function getStyleProfile(template: ResumeData['template']): StyleProfile {
  return STYLE_PROFILES[template] ?? STYLE_PROFILES.modern;
}

const DEFAULT_LAYOUT: LayoutProfile = { headerAlign: 'left', columns: 'single', sidebarRatio: 0.34, nameRule: false };

/**
 * Page geometry per template — mirroring the on-screen layouts so the exported
 * PDF keeps each design's columns, header alignment and rail side.
 */
const LAYOUT_PROFILES: Record<string, LayoutProfile> = {
  modern: { headerAlign: 'center', columns: 'single', sidebarRatio: 0.34, nameRule: true },
  minimal: { headerAlign: 'left', columns: 'single', sidebarRatio: 0.34, nameRule: false },
  professional: { headerAlign: 'left', columns: 'single', sidebarRatio: 0.34, nameRule: true },
  'ats-classic': { headerAlign: 'left', columns: 'single', sidebarRatio: 0.34, nameRule: true },
  student: { headerAlign: 'center', columns: 'sidebar-left', sidebarRatio: 0.36, nameRule: true },
  tech: { headerAlign: 'left', columns: 'sidebar-left', sidebarRatio: 0.32, nameRule: true },
  executive: { headerAlign: 'center', columns: 'single', sidebarRatio: 0.34, nameRule: true },
  creative: { headerAlign: 'left', columns: 'sidebar-left', sidebarRatio: 0.3, nameRule: true },
  academic: { headerAlign: 'center', columns: 'sidebar-right', sidebarRatio: 0.28, nameRule: true },
  developer: { headerAlign: 'left', columns: 'sidebar-left', sidebarRatio: 0.27, nameRule: false },
  corporate: { headerAlign: 'left', columns: 'sidebar-right', sidebarRatio: 0.28, nameRule: true },
  elegant: { headerAlign: 'center', columns: 'single', sidebarRatio: 0.34, nameRule: false },
  compact: { headerAlign: 'left', columns: 'single', sidebarRatio: 0.34, nameRule: true },
  'two-column': { headerAlign: 'left', columns: 'sidebar-left', sidebarRatio: 0.34, nameRule: false },
  portfolio: { headerAlign: 'left', columns: 'sidebar-right', sidebarRatio: 0.27, nameRule: false },
  startup: { headerAlign: 'left', columns: 'sidebar-left', sidebarRatio: 0.34, nameRule: true },
  engineering: { headerAlign: 'left', columns: 'single', sidebarRatio: 0.34, nameRule: true },
  finance: { headerAlign: 'center', columns: 'sidebar-left', sidebarRatio: 0.28, nameRule: true },
  consultant: { headerAlign: 'left', columns: 'single', sidebarRatio: 0.34, nameRule: true },
  research: { headerAlign: 'left', columns: 'single', sidebarRatio: 0.34, nameRule: false },
  marketing: { headerAlign: 'left', columns: 'sidebar-left', sidebarRatio: 0.32, nameRule: true },
  designer: { headerAlign: 'left', columns: 'sidebar-left', sidebarRatio: 0.38, nameRule: false },
  healthcare: { headerAlign: 'left', columns: 'sidebar-right', sidebarRatio: 0.28, nameRule: true },
  legal: { headerAlign: 'center', columns: 'single', sidebarRatio: 0.34, nameRule: true },
  international: { headerAlign: 'left', columns: 'sidebar-left', sidebarRatio: 0.27, nameRule: false },
  social: { headerAlign: 'center', columns: 'single', sidebarRatio: 0.34, nameRule: true },
  tim: { headerAlign: 'left', columns: 'sidebar-left', sidebarRatio: 0.27, nameRule: false },
  mark: { headerAlign: 'center', columns: 'single', sidebarRatio: 0.34, nameRule: true },
  shelah: { headerAlign: 'left', columns: 'sidebar-left', sidebarRatio: 0.32, nameRule: false },
  moon: { headerAlign: 'center', columns: 'sidebar-right', sidebarRatio: 0.25, nameRule: true },
  max: { headerAlign: 'left', columns: 'single', sidebarRatio: 0.34, nameRule: true },
  lana: { headerAlign: 'left', columns: 'sidebar-left', sidebarRatio: 0.38, nameRule: true },
  timeless: { headerAlign: 'center', columns: 'single', sidebarRatio: 0.34, nameRule: true },
  plain: { headerAlign: 'left', columns: 'single', sidebarRatio: 0.34, nameRule: false },
  blogger: { headerAlign: 'left', columns: 'sidebar-left', sidebarRatio: 0.28, nameRule: true },
  pacific: { headerAlign: 'left', columns: 'sidebar-left', sidebarRatio: 0.32, nameRule: true },
  comic: { headerAlign: 'left', columns: 'single', sidebarRatio: 0.34, nameRule: true },
  kaly: { headerAlign: 'center', columns: 'sidebar-right', sidebarRatio: 0.25, nameRule: true },
  mula: { headerAlign: 'left', columns: 'sidebar-right', sidebarRatio: 0.26, nameRule: true },
  bela: { headerAlign: 'center', columns: 'sidebar-left', sidebarRatio: 0.26, nameRule: true },
  'general-ats': { headerAlign: 'left', columns: 'single', sidebarRatio: 0.34, nameRule: false },
  freshman: { headerAlign: 'center', columns: 'sidebar-left', sidebarRatio: 0.36, nameRule: true },
  graphic: { headerAlign: 'left', columns: 'sidebar-left', sidebarRatio: 0.38, nameRule: true },
};

export function getLayoutProfile(template: ResumeData['template']): LayoutProfile {
  return LAYOUT_PROFILES[template] ?? DEFAULT_LAYOUT;
}

export interface PdfElement {
  page: number;
  x: number;
  y: number;
  text: string;
  size: number;
  font: PdfFont;
  bold?: boolean;
  gray?: boolean;
  italic?: boolean;
}

/** Pure word-wrap using per-font average char width. Mirrors jsPDF closely enough for layout. */
export function wrapText(text: string, size: number, widthMm: number, charRatio: number): string[] {
  const charW = size * 0.352778 * charRatio;
  const maxChars = Math.max(8, Math.floor(widthMm / charW));
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      // Hard-split words longer than a full line.
      if (word.length > maxChars) {
        for (let i = 0; i < word.length; i += maxChars) lines.push(word.slice(i, i + maxChars));
        current = '';
      } else {
        current = word;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
}

interface LayoutCursor {
  page: number;
  y: number;
  elements: PdfElement[];
}

function ensureSpace(cursor: LayoutCursor, neededMm: number): void {
  if (cursor.y + neededMm > PAGE_H - MARGIN_BOTTOM) {
    cursor.page += 1;
    cursor.y = MARGIN_TOP;
  }
}

function pushLines(
  cursor: LayoutCursor,
  lines: string[],
  opts: { x: number; size: number; font: PdfFont; lh: number; bold?: boolean; gray?: boolean; italic?: boolean },
): void {
  for (const line of lines) {
    ensureSpace(cursor, opts.lh);
    cursor.elements.push({
      page: cursor.page, x: opts.x, y: cursor.y, text: line,
      size: opts.size, font: opts.font, bold: opts.bold, gray: opts.gray, italic: opts.italic,
    });
    cursor.y += opts.lh;
  }
}

/**
 * Lays the resume out over A4 pages. Returns elements + page count.
 * Guarantees: every element fits inside margins; a section title is never
 * the last line on a page (keep-with-next).
 */
export function layoutResume(resume: ResumeData): { elements: PdfElement[]; totalPages: number; style: StyleProfile } {
  const style = getStyleProfile(resume.template);
  const cursor: LayoutCursor = { page: 1, y: MARGIN_TOP, elements: [] };
  const p = resume.personal;
  const PT_TO_MM = 0.352778;
  const lh = (size: number) => size * PT_TO_MM * style.lineHeightFactor;

  // --- Page geometry from the template's structural profile ---
  const layout = getLayoutProfile(resume.template);
  const isLeftSide = layout.columns === 'sidebar-left';
  const isRightSide = layout.columns === 'sidebar-right';
  const isSidebar = isLeftSide || isRightSide;
  const SIDEBAR_W = isSidebar ? Math.round(CONTENT_W * layout.sidebarRatio) : 0;
  const GAP = isSidebar ? 4 : 0;
  const MAIN_X = isLeftSide ? MARGIN_X + SIDEBAR_W + GAP : MARGIN_X;
  const MAIN_W = isSidebar ? CONTENT_W - SIDEBAR_W - GAP : CONTENT_W;
  const SIDEBAR_X = isRightSide ? MARGIN_X + MAIN_W + GAP : MARGIN_X;
  const headerCenter = layout.headerAlign === 'center';
  const sideCursor: LayoutCursor = { page: 1, y: MARGIN_TOP, elements: [] };

  const textW = (text: string, size: number) => text.length * size * PT_TO_MM * style.charRatio;
  const headerX = (text: string, size: number) =>
    headerCenter ? MAIN_X + Math.max(0, (MAIN_W - textW(text, size)) / 2) : MAIN_X;

  // --- Header: name ---
  const name = p.fullName.trim() || 'Your Name';
  ensureSpace(cursor, lh(style.nameSize));
  cursor.elements.push({ page: cursor.page, x: headerX(name, style.nameSize), y: cursor.y, text: name, size: style.nameSize, font: style.font, bold: true });
  cursor.y += lh(style.nameSize);

  // --- Header: contact ---
  const contactItems = [p.email, p.phone, p.location, p.website, p.linkedin, p.github].filter(Boolean) as string[];
  if (contactItems.length > 0) {
    for (const line of wrapText(contactItems.join('  |  '), style.contactSize, MAIN_W, style.charRatio)) {
      ensureSpace(cursor, lh(style.contactSize));
      cursor.elements.push({ page: cursor.page, x: headerX(line, style.contactSize), y: cursor.y, text: line, size: style.contactSize, font: style.font, gray: true });
      cursor.y += lh(style.contactSize);
    }
  }
  cursor.y += 2;

  // --- Header: professional headline (one-line title under the contact row) ---
  if (p.headline && p.headline.trim()) {
    for (const line of wrapText(p.headline.trim(), style.bodySize, MAIN_W, style.charRatio)) {
      ensureSpace(cursor, lh(style.bodySize));
      cursor.elements.push({ page: cursor.page, x: headerX(line, style.bodySize), y: cursor.y, text: line, size: style.bodySize, font: style.font, italic: true });
      cursor.y += lh(style.bodySize);
    }
    cursor.y += 2;
  }

  // --- Header: rule under the identity block (designs that separate the masthead) ---
  if (layout.nameRule) {
    ensureSpace(cursor, 2.2);
    const ruleChars = Math.max(10, Math.floor(MAIN_W / (4 * PT_TO_MM * style.charRatio)));
    cursor.elements.push({ page: cursor.page, x: MAIN_X, y: cursor.y, text: '_'.repeat(ruleChars), size: 4, font: style.font, gray: true });
    cursor.y += 2.2;
  }

  // --- Summary (intro text, no heading) ---
  if (p.summary.trim()) {
    pushLines(cursor, wrapText(p.summary.trim(), style.bodySize, MAIN_W, style.charRatio), {
      x: MAIN_X, size: style.bodySize, font: style.font, lh: lh(style.bodySize), gray: true,
    });
    cursor.y += 2;
  }

  // --- Sidebar sections (skills + certifications) when columnLayout is 'sidebar' ---
  if (isSidebar) {
    const sideSections = resumeToSections(resume).filter(s => s.id === 'skills' || s.id === 'certifications');
    for (const section of sideSections) {
      const title = style.sectionUppercase ? section.title.toUpperCase() : section.title;
      const titleLines = wrapText(title, style.titleSize - 0.5, SIDEBAR_W, style.charRatio);
      for (const tLine of titleLines) {
        sideCursor.elements.push({ page: sideCursor.page, x: SIDEBAR_X, y: sideCursor.y, text: tLine, size: style.titleSize - 0.5, font: style.font, bold: true });
        sideCursor.y += lh(style.titleSize - 0.5);
      }
      sideCursor.y += 0.5;
      for (const line of section.lines) {
        const wrapped = wrapText(line, style.bodySize - 0.5, SIDEBAR_W, style.charRatio);
        pushLines(sideCursor, wrapped, { x: SIDEBAR_X, size: style.bodySize - 0.5, font: style.font, lh: lh(style.bodySize - 0.5) });
        sideCursor.y += 0.3;
      }
      sideCursor.y += 2.5;
    }
  }

  // --- Main sections (personal is rendered as the header/summary above) ---
  const mainSections = resumeToSections(resume).filter(s => {
    if (s.id === 'personal') return false;
    if (isSidebar && (s.id === 'skills' || s.id === 'certifications')) return false;
    return true;
  });
  for (const section of mainSections) {
    const title = style.sectionUppercase ? section.title.toUpperCase() : section.title;
    const titleLines = wrapText(title, style.titleSize, MAIN_W, style.charRatio);

    const firstContentBlock = estimateFirstBlockHeight(section, style);
    ensureSpace(cursor, titleLines.length * lh(style.titleSize) + 1 + firstContentBlock);

    for (const tLine of titleLines) {
      cursor.elements.push({ page: cursor.page, x: MAIN_X, y: cursor.y, text: tLine, size: style.titleSize, font: style.font, bold: true });
      cursor.y += lh(style.titleSize);
    }
    if (style.sectionRule) {
      ensureSpace(cursor, 1.2);
      cursor.elements.push({ page: cursor.page, x: MAIN_X, y: cursor.y, text: '_'.repeat(60), size: 4, font: style.font, gray: true });
      cursor.y += 1.8;
    } else {
      cursor.y += 0.6;
    }

    for (const line of section.lines) {
      if (section.id === 'experience') {
        renderExperienceLine(cursor, line, section, style, lh, MAIN_X, MAIN_W);
      } else if (section.id === 'education') {
        const wrapped = wrapText(line, style.bodySize, MAIN_W, style.charRatio);
        const bold = section.lines.indexOf(line) === 0;
        pushLines(cursor, wrapped, { x: MAIN_X, size: style.bodySize, font: style.font, lh: lh(style.bodySize), bold, gray: !bold });
        cursor.y += 0.4;
      } else {
        const wrapped = wrapText(line, style.bodySize, MAIN_W, style.charRatio);
        pushLines(cursor, wrapped, { x: MAIN_X, size: style.bodySize, font: style.font, lh: lh(style.bodySize) });
        cursor.y += 0.4;
      }
    }
    cursor.y += 3;
  }

  // --- Full-height sidebar rail across every page ('sidebar-*' layouts) ---
  if (isSidebar && sideCursor.elements.length > 0) {
    const railW = SIDEBAR_W + 4;
    const railH = PAGE_H - MARGIN_TOP - MARGIN_BOTTOM + 8;
    const railX = isRightSide ? SIDEBAR_X - 2 : MARGIN_X - 4;
    const rgb = style.sidebarBg?.join(',') ?? '15,40,50';
    const rail = `__SIDEBAR_BG__${railW}__${railH}__${rgb}`;
    // One marker per page so the rail survives page breaks.
    for (let pg = 1; pg <= cursor.page; pg++) {
      cursor.elements.push({ page: pg, x: railX, y: MARGIN_TOP - 4, text: rail, size: 0, font: style.font });
    }
    // Merge the sidebar text on top of the rail.
    for (const el of sideCursor.elements) {
      cursor.elements.push(el);
    }
  }

  // --- Footers with page numbers (data only; drawn by the renderer) ---
  const totalPages = cursor.page;
  for (let i = 1; i <= totalPages; i++) {
    cursor.elements.push({
      page: i, x: PAGE_W / 2 - 6, y: PAGE_H - MARGIN_BOTTOM + 8,
      text: `${i} / ${totalPages}`, size: 8, font: style.font, gray: true,
    });
  }

  return { elements: cursor.elements, totalPages, style };
}

const DATE_RE = /^\d{4}(\s*[–-]\s*(\d{4}|Present))?$/i;

function isBulletLine(line: string, allLines: string[]): boolean {
  void allLines;
  return !DATE_RE.test(line.trim());
}

/** Rough height of a section's first content line, for keep-with-next. */
function estimateFirstBlockHeight(section: { lines: string[] }, style: StyleProfile): number {
  const first = section.lines[0] ?? '';
  return first.length > 0 ? style.bodySize * 0.352778 * style.lineHeightFactor * 2 : 0;
}

function renderExperienceLine(
  cursor: LayoutCursor,
  line: string,
  section: { lines: string[]; id: string },
  style: StyleProfile,
  lh: (size: number) => number,
  x: number = MARGIN_X,
  width: number = CONTENT_W,
): void {
  const trimmed = line.trim();
  if (DATE_RE.test(trimmed)) {
    pushLines(cursor, [trimmed], { x, size: style.bodySize - 0.5, font: style.font, lh: lh(style.bodySize - 0.5), gray: true, italic: true });
    return;
  }
  const isFirstContentOfEntry = DATE_RE.test((section.lines[section.lines.indexOf(line) + 1] ?? '').trim());
  if (isFirstContentOfEntry) {
    const wrapped = wrapText(trimmed, style.bodySize, width, style.charRatio);
    pushLines(cursor, wrapped, { x, size: style.bodySize, font: style.font, lh: lh(style.bodySize), bold: true });
  } else {
    const wrapped = wrapText(trimmed, style.bodySize, width - 4, style.charRatio);
    wrapped.forEach((w, i) => {
      pushLines(cursor, [i === 0 ? `${style.bullet}  ${w}` : `   ${w}`], { x, size: style.bodySize, font: style.font, lh: lh(style.bodySize) });
    });
  }
}

/** Renders laid-out elements into a real jsPDF document (selectable text). */
export function buildResumePdf(resume: ResumeData): jsPDF {
  const { elements, style } = layoutResume(resume);
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const totalPages = Math.max(...elements.map((e) => e.page));

  // Draw in page order so multi-page rails, sidebars and footers land on the
  // right page (background markers sort first via their leading y).
  const ordered = [...elements].sort((a, b) => (a.page - b.page) || (a.y - b.y));

  let currentPage = 1;
  for (const el of ordered) {
    while (el.page > currentPage) {
      doc.addPage();
      currentPage += 1;
    }
    // Sidebar background: special marker element
    if (el.text.startsWith('__SIDEBAR_BG__')) {
      const parts = el.text.split('__');
      const w = parseFloat(parts[2]) || 60;
      const h = parseFloat(parts[3]) || 100;
      const rgb = (parts[4] || '15,40,50').split(',').map(Number);
      doc.setFillColor(rgb[0], rgb[1], rgb[2]);
      doc.rect(el.x, el.y, w, h, 'F');
      continue;
    }
    doc.setFont(el.font, el.bold ? 'bold' : el.italic ? 'italic' : 'normal');
    doc.setFontSize(el.size);
    doc.setTextColor(el.gray ? 120 : 30);
    doc.text(el.text, el.x, el.y, { baseline: 'top' });
  }
  void style;
  void totalPages;
  return doc;
}

/** Generates and downloads the PDF; filename derived from the resume name. */
export function downloadResumePdf(resume: ResumeData): void {
  const doc = buildResumePdf(resume);
  const safeName = (resume.personal.fullName.trim() || 'Resume').replace(/[^a-z0-9 _-]/gi, '').trim() || 'Resume';
  doc.save(`${safeName}.pdf`);
}
