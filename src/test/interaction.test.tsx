import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Carousel from '@/components/Carousel';
import Reveal from '@/components/Reveal';
import ScrollRail from '@/components/ScrollRail';
import TipStrip from '@/components/TipStrip';
import { useMagneticHover, useTilt } from '@/hooks/useInteraction';

/* jsdom has no layout, so the rail never overflows here: these tests cover the
   behavioural contract (what renders, what is reachable, what never moves on
   its own) rather than pixel geometry. */

describe('Reveal', () => {
  it('renders its children and settles to the shown state', () => {
    const { container } = render(
      <Reveal>
        <p>Revealed copy</p>
      </Reveal>,
    );
    expect(screen.getByText('Revealed copy')).toBeInTheDocument();
    const wrapper = container.querySelector('[data-reveal]');
    // Without IntersectionObserver the hook resolves to visible, so content can
    // never be stranded at opacity 0.
    expect(wrapper?.getAttribute('data-reveal')).toBe('shown');
  });

  it('drops the animation entirely for reduced-motion visitors', () => {
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

    const { container } = render(
      <Reveal>
        <p>Still visible</p>
      </Reveal>,
    );
    expect(screen.getByText('Still visible')).toBeInTheDocument();
    expect(container.querySelector('[data-reveal]')).toBeNull();

    window.matchMedia = original;
  });
});

describe('TipStrip', () => {
  const tips = [
    { title: 'First tip', text: 'One' },
    { title: 'Second tip', text: 'Two' },
  ];

  it('shows one tip and advances only when asked', () => {
    render(<TipStrip tips={tips} />);
    expect(screen.getByText('First tip')).toBeInTheDocument();
    expect(screen.queryByText('Second tip')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Next tip/ }));
    expect(screen.getByText('Second tip')).toBeInTheDocument();
    expect(screen.queryByText('First tip')).toBeNull();

    // Wraps back around.
    fireEvent.click(screen.getByRole('button', { name: /Next tip/ }));
    expect(screen.getByText('First tip')).toBeInTheDocument();
  });

  it('renders nothing for an empty tip list', () => {
    const { container } = render(<TipStrip tips={[]} />);
    expect(container.textContent).toBe('');
  });
});

describe('Carousel interaction', () => {
  const slides = [<div key="a">Slide A</div>, <div key="b">Slide B</div>];

  const slideNodes = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('[aria-roledescription="slide"]'));

  it('exposes dots, arrows and the current position', () => {
    const { container } = render(
      <Carousel slides={slides} ariaLabel="Test carousel" slideLabels={['A', 'B']} autoplayMs={0} />,
    );
    expect(screen.getByRole('region', { name: 'Test carousel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeInTheDocument();
    expect(slideNodes(container)[0].getAttribute('aria-hidden')).toBe('false');

    fireEvent.click(screen.getByRole('tab', { name: /Go to slide 2/ }));
    expect(slideNodes(container)[1].getAttribute('aria-hidden')).toBe('false');
    expect(slideNodes(container)[0].getAttribute('aria-hidden')).toBe('true');
  });

  it('moves with the arrow keys from inside the carousel', () => {
    const { container } = render(
      <Carousel slides={slides} ariaLabel="Test carousel" autoplayMs={0} />,
    );
    fireEvent.keyDown(screen.getByRole('button', { name: 'Next slide' }), { key: 'ArrowRight' });
    expect(slideNodes(container)[1].getAttribute('aria-hidden')).toBe('false');

    fireEvent.keyDown(screen.getByRole('button', { name: 'Next slide' }), { key: 'ArrowLeft' });
    expect(slideNodes(container)[0].getAttribute('aria-hidden')).toBe('false');
  });

  it('advances on a horizontal trackpad gesture but ignores vertical wheel', () => {
    const { container } = render(
      <Carousel slides={slides} ariaLabel="Test carousel" autoplayMs={0} />,
    );
    const region = screen.getByRole('region', { name: 'Test carousel' });

    // Vertical intent is page scrolling — the carousel must not react.
    fireEvent.wheel(region, { deltaX: 0, deltaY: 120 });
    expect(slideNodes(container)[0].getAttribute('aria-hidden')).toBe('false');

    fireEvent.wheel(region, { deltaX: 90, deltaY: 0 });
    expect(slideNodes(container)[1].getAttribute('aria-hidden')).toBe('false');
  });

  it('never autoplays for reduced-motion visitors', () => {
    vi.useFakeTimers();
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

    const { container } = render(
      <Carousel slides={slides} ariaLabel="Test carousel" autoplayMs={500} />,
    );
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(slideNodes(container)[0].getAttribute('aria-hidden')).toBe('false');

    window.matchMedia = original;
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});

describe('pointer-follow effects (homepage tilt + magnetic CTAs)', () => {
  const WIDTH = 200;
  const HEIGHT = 400;
  const LEFT = 100;
  const TOP = 100;

  /** jsdom has no layout, so give the probe a known box. */
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

  /** The styles are written on the next animation frame. */
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

  function TiltProbe() {
    const tilt = useTilt<HTMLDivElement>();
    return <div {...tilt} data-testid="surface" className="tilt-surface" />;
  }

  function MagnetProbe() {
    const magnet = useMagneticHover<HTMLDivElement>();
    return <div {...magnet} data-testid="magnet" className="magnetic" />;
  }

  it('tilts the surface by a small, bounded amount as the pointer moves', async () => {
    render(<TiltProbe />);
    const surface = screen.getByTestId('surface');
    stubRect(surface);

    // Pointer 40px right of centre, 20px below it.
    movePointer(surface, LEFT + WIDTH / 2 + 40, TOP + HEIGHT / 2 + 20);
    await flushFrame();

    expect(surface.dataset.tilting).toBe('true');
    const { rotX, rotY, shiftX, shiftY } = readTilt(surface.style.transform);
    expect(rotX).toBeGreaterThan(0); // moving down tilts the near edge forward
    expect(rotY).toBeLessThan(0); // moving right tilts toward the cursor
    for (const value of [rotX, rotY]) expect(Math.abs(value)).toBeLessThanOrEqual(3.5);
    for (const value of [shiftX, shiftY]) expect(Math.abs(value)).toBeLessThanOrEqual(6);
  });

  it('eases back to its resting transform when the pointer leaves', async () => {
    render(<TiltProbe />);
    const surface = screen.getByTestId('surface');
    stubRect(surface);

    movePointer(surface, LEFT + WIDTH - 10, TOP + 10);
    await flushFrame();
    expect(surface.style.transform).not.toContain('rotateX(0deg)');

    leavePointer(surface);
    expect(surface.dataset.tilting).toBe('false');
    expect(surface.style.transform).toContain('rotateX(0deg)');
    expect(surface.style.transform).toContain('translate3d(0, 0, 0)');
  });

  it('ignores touch pointers so mobile gets a plain, static preview', async () => {
    render(<TiltProbe />);
    const surface = screen.getByTestId('surface');
    stubRect(surface);

    movePointer(surface, LEFT + WIDTH - 10, TOP + 10, 'touch');
    await flushFrame();
    expect(surface.dataset.tilting).toBeUndefined();
    expect(surface.style.transform).toBe('');
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

    render(<TiltProbe />);
    const surface = screen.getByTestId('surface');
    stubRect(surface);
    movePointer(surface, LEFT + WIDTH - 10, TOP + 10);
    await flushFrame();
    expect(surface.dataset.tilting).toBeUndefined();
    expect(surface.style.transform).toBe('');

    window.matchMedia = original;
  });

  it('moves a CTA a few pixels toward the cursor and never further', async () => {
    render(<MagnetProbe />);
    const magnet = screen.getByTestId('magnet');
    stubRect(magnet);

    // Far from the centre: the shift must still be clamped.
    movePointer(magnet, LEFT + WIDTH + 400, TOP + HEIGHT / 2);
    await flushFrame();
    expect(magnet.dataset.tracking).toBe('true');
    const { shiftX, shiftY } = readTilt(magnet.style.transform);
    expect(shiftX).toBe(6);
    expect(shiftY).toBe(0);

    leavePointer(magnet);
    expect(magnet.dataset.tracking).toBe('false');
    expect(magnet.style.transform).toContain('translate3d(0, 0, 0)');
  });
});

describe('ScrollRail', () => {
  it('renders every card as one scrollable region and hides pointless controls', () => {
    render(
      <ScrollRail
        ariaLabel="Featured designs"
        itemClassName="w-40"
        items={[<div key="1">Card one</div>, <div key="2">Card two</div>]}
      />,
    );
    expect(screen.getByText('Card one')).toBeInTheDocument();
    expect(screen.getByText('Card two')).toBeInTheDocument();

    // The region is focusable and labelled so keyboard users can reach it.
    const region = screen.getByRole('group', { name: 'Featured designs' });
    expect(region).toHaveAttribute('tabindex', '0');

    // Nothing overflows here, so no arrows are rendered.
    expect(screen.queryByRole('button', { name: /Scroll Featured designs/ })).toBeNull();

    // Arrow keys on a rail with nothing to scroll stay harmless.
    fireEvent.keyDown(region, { key: 'ArrowRight' });
    fireEvent.keyDown(region, { key: 'Home' });
  });
});
