import { describe, expect, it } from 'vitest';
import { act, fireEvent, render } from '@testing-library/react';
import HeroPaperCore, { HeroPaper } from '@/pages/HeroPaperCore';
import { getSampleResume } from '@/lib/sampleResume';

/**
 * Direct coverage for the homepage resume (spec §6–§7): the pointer tilt,
 * the bounded push, the cursor sheen, and the three ways it must stay still —
 * touch pointers, reduced motion, and the spring home on leave.
 *
 * jsdom has no layout, so the sheet gets a known box; styles are written on
 * the next animation frame, so each interaction is followed by a flushed tick.
 */
const WIDTH = 330;
const HEIGHT = 467;
const LEFT = 80;
const TOP = 60;

function stubRect(el: HTMLElement) {
  el.getBoundingClientRect = () =>
    ({
      left: LEFT,
      top: TOP,
      right: LEFT + WIDTH,
      bottom: TOP + HEIGHT,
      width: WIDTH,
      height: HEIGHT,
      x: LEFT,
      y: TOP,
      toJSON: () => ({}),
    }) as DOMRect;
}

function movePointer(el: HTMLElement, x: number, y: number, pointerType = 'mouse') {
  const event = new MouseEvent('pointermove', { bubbles: true, cancelable: true, clientX: x, clientY: y });
  Object.defineProperty(event, 'pointerType', { value: pointerType });
  act(() => {
    el.dispatchEvent(event);
  });
}

function leavePointer(el: HTMLElement) {
  act(() => {
    fireEvent.pointerOut(el, { relatedTarget: document.body });
  });
}

async function flushFrame() {
  await act(async () => {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  });
}

/** Pull the tilt values out of a transform string, ignoring the perspective. */
const readTilt = (value: string) => ({
  rotX: Number(value.match(/rotateX\((-?[\d.]+)deg\)/)?.[1] ?? NaN),
  rotY: Number(value.match(/rotateY\((-?[\d.]+)deg\)/)?.[1] ?? NaN),
  shiftX: Number(value.match(/translate3d\((-?[\d.]+)px/)?.[1] ?? NaN),
  shiftY: Number(value.match(/translate3d\(-?[\d.]+px,\s*(-?[\d.]+)px/)?.[1] ?? NaN),
});

function sheetOf(container: HTMLElement): HTMLElement {
  const el = container.querySelector('.tilt-surface');
  if (!el) throw new Error('tilt surface missing');
  return el as HTMLElement;
}

describe('hero resume — pointer tilt, push and sheen', () => {
  it('layers the drift sheet around the tilt surface with the thumbnail inside', () => {
    const { container } = render(<HeroPaperCore data={getSampleResume()} />);
    const drift = container.querySelector('.hero-sheet');
    const tilt = container.querySelector('.tilt-surface');
    expect(drift).not.toBeNull();
    expect(tilt).not.toBeNull();
    expect(drift?.contains(tilt)).toBe(true);
    // The A4 thumbnail renders inside the sheet.
    expect(tilt?.querySelector('div.absolute')).not.toBeNull();
    // The sheen pseudo-element is driven by these vars.
    expect(tilt?.classList.contains('pointer-sheen')).toBe(true);
  });

  it('tilts within the spec limits (±3°/±4°) and pushes at most 8px', async () => {
    const { container } = render(<HeroPaperCore data={getSampleResume()} />);
    const tilt = sheetOf(container);
    stubRect(tilt);

    // Pointer right of centre and below it: near edge dips forward, the sheet
    // drifts toward the cursor.
    movePointer(tilt, LEFT + WIDTH * 0.85, TOP + HEIGHT * 0.7);
    await flushFrame();

    expect(tilt.dataset.tilting).toBe('true');
    const { rotX, rotY, shiftX, shiftY } = readTilt(tilt.style.transform);
    expect(rotX).toBeGreaterThan(0); // moving down tilts the near edge forward
    expect(rotY).toBeLessThan(0); // moving right leans toward the cursor
    expect(Math.abs(rotX)).toBeLessThanOrEqual(3);
    expect(Math.abs(rotY)).toBeLessThanOrEqual(4);
    expect(Math.abs(shiftX)).toBeGreaterThan(0);
    expect(Math.abs(shiftX)).toBeLessThanOrEqual(8);
    expect(Math.abs(shiftY)).toBeLessThanOrEqual(8);
    // The cursor sheen tracks pointer position for the ::after wash.
    expect(tilt.style.getPropertyValue('--spot-x')).not.toBe('');
    expect(tilt.style.getPropertyValue('--spot-y')).not.toBe('');
  });

  it('springs home to its resting transform when the pointer leaves', async () => {
    const { container } = render(<HeroPaperCore data={getSampleResume()} />);
    const tilt = sheetOf(container);
    stubRect(tilt);

    movePointer(tilt, LEFT + WIDTH - 4, TOP + 10);
    await flushFrame();
    expect(tilt.style.transform).not.toContain('rotateX(0deg)');

    leavePointer(tilt);
    expect(tilt.dataset.tilting).toBe('false');
    expect(tilt.style.transform).toContain('rotateX(0deg)');
    expect(tilt.style.transform).toContain('translate3d(0, 0, 0)');
  });

  it('ignores touch pointers so mobile gets a plain, static preview', async () => {
    const { container } = render(<HeroPaperCore data={getSampleResume()} />);
    const tilt = sheetOf(container);
    stubRect(tilt);

    movePointer(tilt, LEFT + WIDTH - 4, TOP + 10, 'touch');
    await flushFrame();
    expect(tilt.dataset.tilting).toBeUndefined();
    expect(tilt.style.transform).toBe('');
    expect(tilt.style.getPropertyValue('--spot-x')).toBe('');
  });

  it('stays still for reduced-motion visitors', async () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: query.includes('reduced-motion'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;

    try {
      const { container } = render(<HeroPaperCore data={getSampleResume()} />);
      const tilt = sheetOf(container);
      stubRect(tilt);
      movePointer(tilt, LEFT + WIDTH - 4, TOP + 10);
      await flushFrame();
      expect(tilt.dataset.tilting).toBeUndefined();
      expect(tilt.style.transform).toBe('');
    } finally {
      window.matchMedia = original;
    }
  });

  it('HeroPaper wrapper renders the same sheet', () => {
    const { container } = render(<HeroPaper data={getSampleResume()} />);
    expect(container.querySelector('.hero-sheet .tilt-surface')).not.toBeNull();
  });
});
