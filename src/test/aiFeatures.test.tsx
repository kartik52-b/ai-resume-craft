import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SummaryGenerator from '@/components/ai/SummaryGenerator';
import BulletGenerator from '@/components/ai/BulletGenerator';
import SkillsSuggester from '@/components/ai/SkillsSuggester';

afterEach(() => vi.restoreAllMocks());

describe('AI writing controls', () => {
  it('keeps summary generation disabled until factual source text exists', () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    render(<SummaryGenerator resumeText="" currentSummary="" onAccept={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Write one from my resume' })).toBeDisabled();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText('Add a headline or resume section before drafting a summary.')).toBeInTheDocument();
  });

  it('shows a real summary suggestion for review and applies only on request', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ text: 'A concise factual summary.' }), { status: 200 }),
    );
    const onAccept = vi.fn();
    render(<SummaryGenerator resumeText="EXPERIENCE\nProduct Engineer at Example Co" currentSummary="" onAccept={onAccept} />);

    fireEvent.click(screen.getByRole('button', { name: 'Write one from my resume' }));
    expect(await screen.findByText('A concise factual summary.')).toBeInTheDocument();
    expect(onAccept).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onAccept).toHaveBeenCalledWith('A concise factual summary.');
  });

  it('shows the missing-provider setup path without replacing the summary', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'not_configured' }), { status: 503 }),
    );
    const onAccept = vi.fn();
    render(<MemoryRouter><SummaryGenerator resumeText="EXPERIENCE\nEngineer" currentSummary="Current summary" onAccept={onAccept} /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: 'Suggest a new summary' }));
    expect(await screen.findByRole('status')).toHaveTextContent("AI writing assistance isn't configured yet.");
    expect(screen.getByRole('link', { name: 'Set up AI' })).toHaveAttribute('href', '/settings');
    expect(onAccept).not.toHaveBeenCalled();
  });

  it('requires factual work notes before enabling bullet generation', () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    render(<BulletGenerator role="Engineer" company="Example Co" existingBullets={[]} skills={[]} onAccept={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Suggest bullets' })).toBeDisabled();
    expect(screen.getByText('Add your own work notes first so suggestions do not invent accomplishments.')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('asks for a real role before suggesting skills', () => {
    render(<SkillsSuggester role="" experienceContext="" existingSkills={[]} onAddSkills={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Suggest skills' })).not.toBeInTheDocument();
    expect(screen.getByText('Add a professional headline or experience position first to get role-specific skill ideas.')).toBeInTheDocument();
  });
});
