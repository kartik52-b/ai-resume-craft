import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Carousel from '@/components/Carousel';

/**
 * The shared carousel system. jsdom's window is 1024px wide (lg tier), so the
 * `cards` variant shows 3 cards per view.
 */

const makeSlides = (n: number) =>
  Array.from({ length: n }, (_, i) => <div key={i}>Card {i + 1}</div>);

describe('Carousel', () => {
  it('renders an accessible region with a page-aware counter and dots', () => {
    render(<Carousel variant="cards" ariaLabel="Test rail" slides={makeSlides(5)} />);

    expect(screen.getByRole('region', { name: 'Test rail' })).toBeInTheDocument();
    // 5 cards, 3 per view → 2 pages, end-aligned counter.
    expect(screen.getByText('1–3 of 5')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to page 1 of 2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to page 2 of 2' })).toBeInTheDocument();

    // Non-looping rails disable navigation at the edges; cards never autoplay.
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Pause autoplay' })).toBeNull();
  });

  it('advances with arrows, dots and the keyboard', () => {
    render(<Carousel variant="cards" ariaLabel="Test rail" slides={makeSlides(5)} />);

    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(screen.getByText('3–5 of 5')).toBeInTheDocument();
    // Reached the last page — next is disabled, previous re-enables.
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeEnabled();

    fireEvent.keyDown(screen.getByRole('region', { name: 'Test rail' }), { key: 'ArrowLeft' });
    expect(screen.getByText('1–3 of 5')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Go to page 2 of 2' }));
    expect(screen.getByText('3–5 of 5')).toBeInTheDocument();
  });

  it('hides every control when all slides already fit on one page', () => {
    render(<Carousel variant="cards" ariaLabel="Test rail" slides={makeSlides(2)} />);

    expect(screen.getByRole('region', { name: 'Test rail' })).toBeInTheDocument();
    // Both cards are on screen — the whole controls row (counter included) hides.
    expect(screen.getByText('Card 1')).toBeInTheDocument();
    expect(screen.getByText('Card 2')).toBeInTheDocument();
    expect(screen.queryByText(/of 2/)).toBeNull();
    expect(screen.queryByRole('button', { name: 'Next slide' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Previous slide' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Go to page 1 of 1' })).toBeNull();
  });

  it('keeps inactive slides out of the accessibility tree', () => {
    const { container } = render(
      <Carousel
        variant="hero"
        ariaLabel="Hero rail"
        slideLabels={['One', 'Two', 'Three']}
        slides={makeSlides(3)}
      />,
    );

    const group = (i: number) => container.querySelectorAll('[role="group"]')[i];
    expect(group(0).getAttribute('aria-hidden')).toBe('false');
    expect(group(1).getAttribute('aria-hidden')).toBe('true');
    // Inactive slides are inert so focus can never land off-screen.
    expect(group(1).hasAttribute('inert')).toBe(true);
    expect(group(0).hasAttribute('inert')).toBe(false);
    // Hero rails are single-view with a page counter.
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    // Looping rails keep both arrows enabled.
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeEnabled();
  });

  it('returns nothing when there are no slides', () => {
    const { container } = render(<Carousel variant="cards" ariaLabel="Empty rail" slides={[]} />);
    expect(container.querySelector('[role="region"]')).toBeNull();
  });
});
