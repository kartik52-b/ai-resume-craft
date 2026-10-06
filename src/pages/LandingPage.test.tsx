import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ResumeProvider } from '@/context/ResumeContext';
import LandingPage from '../pages/LandingPage';

describe('landing page Premium.feature sections', () => {
  it('still renders the three feature sections', () => {
    const { container } = render(
      <BrowserRouter>
        <ResumeProvider>
          <LandingPage />
        </ResumeProvider>
      </BrowserRouter>,
    );

    expect(screen.getByText('Help with the wording, when you want it.')).toBeInTheDocument();
    expect(screen.getByText('Your content stays yours.')).toBeInTheDocument();
    expect(screen.getByText(/^\d+ designs, genuinely different\.$/)).toBeInTheDocument();

    const premiumLabels = Array.from(
      container.querySelectorAll('[class*="uppercase"][class*="bronze"]'),
    )
      .map((el) => el.textContent?.trim())
      .filter(Boolean);

    expect(premiumLabels).toEqual(expect.arrayContaining(['Premium']));
    expect(premiumLabels).toHaveLength(3);
  });
});
