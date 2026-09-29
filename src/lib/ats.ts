import { type ResumeData, type SectionId } from '@/types/resume';
import { resolveSectionOrder, isSectionHidden } from '@/lib/sections';
import { resumeToPlainText, resumeToSections } from '@/lib/resumeText';

/**
 * Deterministic ATS analysis.
 *
 * Scoring methodology (0-100, fully computed from the resume itself):
 *   - Contact completeness ....... 15 pts (name, email OR phone, location)
 *   - Summary .................... 10 pts (present, 80-600 chars)
 *   - Experience quality ......... 30 pts
 *       - has >= 1 entry with position+company ......... 10
 *       - every entry has >= 1 non-empty bullet ........ 10
 *       - >= 1/3 of bullets contain digits (metrics) ... 10
 *   - Education .................. 10 pts (>= 1 entry with school)
 *   - Skills ..................... 15 pts (>= 6 skills, scaled)
 *   - Section completeness ....... 10 pts (all non-hidden sections non-empty)
 *   - Formatting risks ........... 10 pts (very long bullets, missing dates)
 *
 * This score is a self-assessment aid computed by a transparent formula — it
 * is NOT a claim about any specific ATS vendor's behavior or parser.
 */

export interface AtsCheck {
  id: string;
  title: string;
  status: 'pass' | 'warn' | 'fail';
  detail: string;
  weight: number;
  earned: number;
}

export interface AtsResult {
  score: number;
  band: 'strong' | 'good' | 'fair' | 'weak';
  checks: AtsCheck[];
  sectionIssues: { section: SectionId; issue: string }[];
}

const BANDS: { min: number; band: AtsResult['band'] }[] = [
  { min: 85, band: 'strong' },
  { min: 70, band: 'good' },
  { min: 50, band: 'fair' },
  { min: 0, band: 'weak' },
];

function hasDigits(text: string): boolean {
  return /\d/.test(text);
}

export function analyzeResume(resume: ResumeData): AtsResult {
  const checks: AtsCheck[] = [];
  const sectionIssues: { section: SectionId; issue: string }[] = [];
  const p = resume.personal;

  // --- Contact (15) ---
  const contactFields = [
    { ok: !!p.fullName.trim(), label: 'full name' },
    { ok: !!(p.email.trim() || p.phone.trim()), label: 'email or phone' },
    { ok: !!p.location.trim(), label: 'location' },
  ];
  const contactEarned = Math.round((contactFields.filter((f) => f.ok).length / contactFields.length) * 15);
  checks.push({
    id: 'contact',
    title: 'Contact information',
    status: contactEarned === 15 ? 'pass' : contactEarned >= 10 ? 'warn' : 'fail',
    detail: contactFields.filter((f) => !f.ok).map((f) => `Add your ${f.label}.`).join(' ') || 'Name, contact and location present.',
    weight: 15,
    earned: contactEarned,
  });

  // --- Summary (10) ---
  const summaryLen = p.summary.trim().length;
  const summaryStatus = summaryLen === 0 ? 'fail' : summaryLen < 80 || summaryLen > 600 ? 'warn' : 'pass';
  checks.push({
    id: 'summary',
    title: 'Professional summary',
    status: summaryStatus,
    detail:
      summaryLen === 0
        ? 'Add a 2-3 sentence summary.'
        : summaryLen < 80
          ? 'Summary is short — aim for 80+ characters.'
          : summaryLen > 600
            ? 'Summary is long — consider trimming below 600 characters.'
            : 'Summary present at a good length.',
    weight: 10,
    earned: summaryStatus === 'pass' ? 10 : summaryStatus === 'warn' ? 5 : 0,
  });

  // --- Experience quality (30) ---
  const exp = resume.experience;
  const withRole = exp.filter((e) => e.position.trim() && e.company.trim());
  const allHaveBullets = exp.length > 0 && exp.every((e) => e.bullets.some((b) => b.trim()));
  const bullets = exp.flatMap((e) => e.bullets.filter(Boolean));
  const quantified = bullets.filter(hasDigits);
  const quantifiedRatio = bullets.length ? quantified.length / bullets.length : 0;

  const expEarned =
    (withRole.length > 0 ? 10 : 0) + (allHaveBullets ? 10 : 0) + (quantifiedRatio >= 1 / 3 ? 10 : 0);
  checks.push({
    id: 'experience',
    title: 'Experience quality',
    status: expEarned >= 30 ? 'pass' : expEarned >= 10 ? 'warn' : 'fail',
    detail:
      withRole.length === 0
        ? 'Add experience entries with position and company.'
        : !allHaveBullets
          ? 'Every role needs at least one bullet point.'
          : quantifiedRatio < 1 / 3
            ? 'Add measurable results (numbers, %, sizes) to at least a third of your bullets.'
            : 'Roles have bullets and quantified achievements.',
    weight: 30,
    earned: expEarned,
  });

  // --- Education (10) ---
  const eduOk = resume.education.some((e) => e.school.trim());
  checks.push({
    id: 'education',
    title: 'Education',
    status: eduOk ? 'pass' : 'fail',
    detail: eduOk ? 'Education present.' : 'Add at least one education entry.',
    weight: 10,
    earned: eduOk ? 10 : 0,
  });

  // --- Skills (15) ---
  const skillCount = resume.skills.length;
  const skillsEarned = Math.min(15, Math.round((skillCount / 6) * 15));
  checks.push({
    id: 'skills',
    title: 'Skills',
    status: skillCount >= 6 ? 'pass' : skillCount >= 3 ? 'warn' : 'fail',
    detail:
      skillCount === 0
        ? 'Add relevant skills.'
        : skillCount < 6
          ? `You have ${skillCount} skill(s) — 6+ is recommended.`
          : `${skillCount} skills listed.`,
    weight: 15,
    earned: skillsEarned,
  });

  // --- Section completeness (10) ---
  const visible = resolveSectionOrder(resume).filter((id) => !isSectionHidden(resume, id));
  const emptyVisible = visible.filter((id) => {
    if (id === 'personal') return false;
    if (id === 'experience') return exp.length === 0;
    if (id === 'education') return resume.education.length === 0;
    if (id === 'skills') return resume.skills.length === 0;
    if (id === 'projects') return resume.projects.length === 0;
    return resume.certifications.length === 0;
  });
  const nonPersonal = visible.filter((id) => id !== 'personal');
  const filled = nonPersonal.filter((id) => !emptyVisible.includes(id));
  const completenessEarned = nonPersonal.length
    ? Math.max(0, Math.min(10, Math.round((filled.length / nonPersonal.length) * 10)))
    : 0;
  for (const id of emptyVisible) {
    sectionIssues.push({ section: id, issue: 'Section is visible but empty — fill it or hide it.' });
  }
  checks.push({
    id: 'completeness',
    title: 'Section completeness',
    status: emptyVisible.length === 0 ? 'pass' : emptyVisible.length <= 2 ? 'warn' : 'fail',
    detail: emptyVisible.length === 0 ? 'All visible sections have content.' : 'Some visible sections are empty.',
    weight: 10,
    earned: completenessEarned,
  });

  // --- Formatting risks (10) ---
  const longBullets = bullets.filter((b) => b.length > 240).length;
  const missingDates = exp.filter((e) => !e.startDate.trim()).length;
  const riskEarned = bullets.length === 0 ? 0 : Math.max(0, 10 - longBullets * 2 - missingDates * 2);
  checks.push({
    id: 'formatting',
    title: 'Formatting risks',
    status: riskEarned >= 10 ? 'pass' : riskEarned >= 5 ? 'warn' : 'fail',
    detail:
      bullets.length === 0
        ? 'No experience bullets to assess.'
        : longBullets === 0 && missingDates === 0
          ? 'No obvious formatting risks.'
          : [longBullets > 0 ? `${longBullets} bullet(s) over 240 characters.` : '', missingDates > 0 ? `${missingDates} role(s) missing start dates.` : '']
              .filter(Boolean)
              .join(' '),
    weight: 10,
    earned: riskEarned,
  });

  const score = Math.min(100, checks.reduce((sum, c) => sum + c.earned, 0));
  const band = BANDS.find((b) => score >= b.min)!.band;
  return { score, band, checks, sectionIssues };
}

export { BANDS };
