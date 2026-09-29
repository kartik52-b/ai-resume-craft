import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Carousel from '@/components/Carousel';
import Reveal from '@/components/Reveal';
import ScrollRail from '@/components/ScrollRail';
import TipStrip from '@/components/TipStrip';
import { useDragScroll, useInspectableScroll } from '@/hooks/useInteraction';

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

describe('inspectable scroll (homepage resume preview)', () => {
  function Probe() {
    const { ref, dragging, handlers } = useDragScroll<HTMLDivElement>({ axis: 'y' });
    const { atBottom, hasScrolled } = useInspectableScroll(ref);
    return (
      <div ref={ref} {...handlers} data-dragging={dragging} role="region" aria-label="probe">
        <span data-testid="edge">{atBottom ? 'bottom' : 'top'}</span>
        <span data-testid="scrolled">{hasScrolled ? 'yes' : 'no'}</span>
      </div>
    );
  }

  /** jsdom has no layout, so give the probe a fake scrollable geometry. */
  function primeScroller(el: HTMLElement, clientHeight: number, scrollHeight: number) {
    let top = 0;
    Object.defineProperty(el, 'clientHeight', { get: () => clientHeight, configurable: true });
    Object.defineProperty(el, 'scrollHeight', { get: () => scrollHeight, configurable: true });
    Object.defineProperty(el, 'scrollTop', {
      get: () => top,
      set: (value: number) => {
        top = value;
      },
      configurable: true,
    });
    return {
      get scrollTop() {
        return top;
      },
      set scrollTop(value: number) {
        top = value;
      },
    };
  }

  const renderProbe = () => {
    render(<Probe />);
    const region = screen.getByRole('region', { name: 'probe' });
    const state = primeScroller(region, 200, 600);
    return { region, state };
  };

  const wheel = (el: HTMLElement, deltaY: number) => {
    const event = new WheelEvent('wheel', { deltaY, cancelable: true, bubbles: true });
    el.dispatchEvent(event);
    return event;
  };

  it('holds the page still while the resume itself can scroll', () => {
    const { region } = renderProbe();
    const event = wheel(region, 120);
    // preventDefault is what stops the homepage from scrolling underneath.
    expect(event.defaultPrevented).toBe(true);
  });

  it('hands the gesture back to the page at the bottom edge', () => {
    const { region, state } = renderProbe();
    state.scrollTop = 400; // scrollHeight - clientHeight
    const event = wheel(region, 120);
    expect(event.defaultPrevented).toBe(false);
  });

  it('hands the gesture to the page when scrolling up from the top', () => {
    const { region } = renderProbe();
    const event = wheel(region, -120);
    expect(event.defaultPrevented).toBe(false);
  });

  it('leaves the gesture alone when there is nothing to scroll', () => {
    const { region } = renderProbe();
    Object.defineProperty(region, 'scrollHeight', { get: () => 200, configurable: true });
    const event = wheel(region, 120);
    expect(event.defaultPrevented).toBe(false);
  });

  it('never blocks pinch-zoom (ctrl + wheel)', () => {
    const { region } = renderProbe();
    const event = new WheelEvent('wheel', { deltaY: 120, ctrlKey: true, cancelable: true, bubbles: true });
    region.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('reports the boundary and first-scroll state for the indicators', () => {
    const { region, state } = renderProbe();
    expect(screen.getByTestId('edge')).toHaveTextContent('top');
    expect(screen.getByTestId('scrolled')).toHaveTextContent('no');

    state.scrollTop = 400;
    fireEvent.scroll(region);
    expect(screen.getByTestId('edge')).toHaveTextContent('bottom');
    expect(screen.getByTestId('scrolled')).toHaveTextContent('yes');
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
