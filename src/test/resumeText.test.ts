import { describe, expect, it } from 'vitest';
import { createEmptyResume } from '@/types/resume';
import { resumeToAiContext, resumeToPlainText } from '@/lib/resumeText';

describe('resumeToAiContext', () => {
  it('omits identifying details and the existing summary while keeping resume facts', () => {
    const resume = createEmptyResume();
    resume.personal.fullName = 'Aarav Singh';
    resume.personal.email = 'aarav@example.com';
    resume.personal.phone = '+1 555 0100';
    resume.personal.location = 'Austin, TX';
    resume.personal.website = 'aarav.dev';
    resume.personal.linkedin = 'linkedin.com/in/aarav';
    resume.personal.github = 'github.com/aarav';
    resume.personal.headline = 'Product Engineer';
    resume.personal.summary = 'Existing summary should not be repeated.';
    resume.skills = ['TypeScript', 'React'];

    const context = resumeToAiContext(resume);

    expect(context).toContain('Product Engineer');
    expect(context).toContain('TypeScript');
    expect(context).toContain('React');
    for (const identifyingValue of [
      'Aarav Singh', 'aarav@example.com', '+1 555 0100', 'Austin, TX',
      'aarav.dev', 'linkedin.com/in/aarav', 'github.com/aarav',
      'Existing summary should not be repeated.',
    ]) {
      expect(context).not.toContain(identifyingValue);
    }
  });

  it('leaves the normal resume text export unchanged', () => {
    const resume = createEmptyResume();
    resume.personal.fullName = 'Aarav Singh';
    resume.personal.email = 'aarav@example.com';
    expect(resumeToPlainText(resume)).toContain('aarav@example.com');
  });
});
