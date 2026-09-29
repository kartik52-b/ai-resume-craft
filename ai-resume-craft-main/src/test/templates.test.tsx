import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TEMPLATE_REGISTRY, getTemplate } from '@/lib/templateRegistry';
import { createEmptyResume } from '@/types/resume';

describe('template registry', () => {
  it('contains all twenty-five templates with unique ids', () => {
    const ids = TEMPLATE_REGISTRY.map((t) => t.id);
    expect(new Set(ids).size).toBe(25);
    expect(ids).toEqual(expect.arrayContaining([
      'modern', 'minimal', 'professional', 'ats-classic', 'student', 'tech', 'executive',
      'creative', 'academic', 'developer', 'corporate', 'elegant', 'compact', 'two-column', 'portfolio',
      'startup', 'engineering', 'finance', 'consultant', 'research', 'marketing', 'designer',
      'healthcare', 'legal', 'international',
    ]));
  });

  it('falls back to the first template for unknown ids', () => {
    expect(getTemplate('nonexistent' as never).id).toBe('modern');
  });
});

describe('template section handling', () => {
  it('renders only non-hidden sections and honors stored order', () => {
    const resume = createEmptyResume();
    resume.personal.fullName = 'Aarav Singh';
    resume.skills = ['React', 'TypeScript'];
    resume.experience = [{ id: 'e1', position: 'Engineer', company: 'Acme', location: '', startDate: '2020', endDate: '', current: true, bullets: ['Shipped things'] }];
    resume.sectionOrder = ['personal', 'skills', 'experience'];
    resume.hiddenSections = ['projects', 'certifications'];

    const { container } = render(<ModernLike data={resume} />);
    const text = container.textContent ?? '';
    // Skills appears; hidden projects/certifications never render.
    expect(text).toContain('React');
    expect(text).not.toContain('CERTIFICATIONS');
    // Order: skills section header appears before experience header.
    const skillsIdx = text.indexOf('SKILLS');
    const expIdx = text.indexOf('EXPERIENCE');
    expect(skillsIdx).toBeGreaterThan(-1);
    expect(expIdx).toBeGreaterThan(-1);
    expect(skillsIdx < expIdx || text.indexOf('Skills') < text.indexOf('Experience')).toBe(true);
  });

  it('renders the same data on every template (switching loses nothing)', () => {
    const resume = createEmptyResume();
    resume.personal.fullName = 'Aarav Singh';
    resume.skills = ['React', 'TypeScript', 'SQL'];
    for (const t of TEMPLATE_REGISTRY) {
      const { container, unmount } = render(<t.Component data={resume} />);
      expect(container.textContent).toContain('Aarav Singh');
      expect(container.textContent).toContain('TypeScript');
      unmount();
    }
  });
});

// Reuse real templates through the registry for structural assertions.
const ModernLike = getTemplate('minimal').Component;
