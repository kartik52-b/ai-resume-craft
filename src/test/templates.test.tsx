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

/** A fully populated resume — every section has content. */
function fullResume() {
  const r = createEmptyResume();
  r.personal = {
    fullName: 'Aarav Singh',
    email: 'aarav@example.com',
    phone: '+44 20 7946 0000',
    location: 'London, UK',
    headline: 'Senior Engineer',
    website: 'aarav.dev',
    linkedin: 'in/aarav',
    github: 'github.com/aarav',
    summary: 'Engineer focused on reliable systems.',
  };
  r.experience = [
    { id: 'e1', position: 'Senior Engineer', company: 'Acme', location: 'London', startDate: '2020', endDate: '', current: true, bullets: ['Shipped a platform', 'Led a team'] },
    { id: 'e2', position: 'Engineer', company: 'Globex', location: 'Remote', startDate: '2017', endDate: '2020', current: false, bullets: ['Built features'] },
  ];
  r.education = [
    { id: 'ed1', school: 'Imperial College', degree: 'MEng', field: 'Computing', startDate: '2013', endDate: '2017', gpa: '3.9', description: 'First class honours.' },
    { id: 'ed2', school: 'City College', degree: 'BSc', field: 'Maths', startDate: '2011', endDate: '2013', gpa: '', description: '' },
  ];
  r.skills = ['TypeScript', 'React', 'Node.js', 'SQL', 'Docker', 'Git'];
  r.projects = [
    { id: 'p1', name: 'CLI Tool', link: 'github.com/aarav/cli', description: 'Developer productivity tool.', technologies: 'Rust' },
    { id: 'p2', name: 'Design System', link: '', description: 'Shared component library.', technologies: 'React' },
  ];
  r.certifications = [
    { id: 'c1', name: 'AWS Solutions Architect', issuer: 'Amazon', date: '2023', link: '' },
    { id: 'c2', name: 'CKA', issuer: 'CNCF', date: '2022', link: '' },
  ];
  return r;
}

describe('template structural diversity', () => {
  it('renders every content section on every template', () => {
    const resume = fullResume();
    for (const t of TEMPLATE_REGISTRY) {
      const { container, unmount } = render(<t.Component data={{ ...resume, template: t.id }} />);
      const text = container.textContent ?? '';
      for (const needle of [
        'Aarav Singh', 'Senior Engineer', 'Acme', 'Imperial College',
        'TypeScript', 'CLI Tool', 'AWS Solutions Architect',
      ]) {
        expect(text, `${t.id} should render "${needle}"`).toContain(needle);
      }
      unmount();
    }
  });

  it('produces unique markup for every template (no two are the same design)', () => {
    const resume = fullResume();
    const seen = new Map<string, string>();
    for (const t of TEMPLATE_REGISTRY) {
      const { container, unmount } = render(<t.Component data={{ ...resume, template: t.id }} />);
      const html = container.innerHTML;
      expect(seen.get(html), `${t.id} markup is identical to ${seen.get(html)}`).toBeUndefined();
      seen.set(html, t.id);
      unmount();
    }
    expect(seen.size).toBe(TEMPLATE_REGISTRY.length);
  });

  it('spans all three physical layout types', () => {
    expect(new Set(TEMPLATE_REGISTRY.map((t) => t.layoutType))).toEqual(
      new Set(['one-column', 'two-column', 'sidebar']),
    );
  });

  it('honors section order and hidden sections on a sidebar template', () => {
    const resume = fullResume();
    resume.template = 'two-column';
    resume.sectionOrder = ['personal', 'certifications', 'experience', 'skills'];
    resume.hiddenSections = ['education'];

    const { container } = render(<SidebarTemplate data={resume} />);
    const text = container.textContent ?? '';
    expect(text).toContain('CERTIFICATIONS');
    expect(text).toContain('EXPERIENCE');
    expect(text.indexOf('CERTIFICATIONS')).toBeLessThan(text.indexOf('EXPERIENCE'));
    expect(text).not.toContain('Imperial College');
  });
});

const SidebarTemplate = getTemplate('two-column').Component;
