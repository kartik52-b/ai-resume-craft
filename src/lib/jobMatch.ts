import { type ResumeData } from '@/types/resume';
import { aiJobMatch } from '@/lib/aiClient';
import { resumeToPlainText } from '@/lib/resumeText';

/**
 * Deterministic job-description matching.
 *
 * All matching is computed in the browser from the raw text of the job
 * description and the resume. AI commentary is optional and only runs when
 * explicitly requested (and the server proxy is configured).
 */

export interface KeywordGroup {
  keyword: string;
  count: number;
}

export interface JobMatchResult {
  matchedSkills: string[];
  missingSkills: string[];
  keywordCoverage: { matched: number; total: number; percent: number };
  topKeywords: KeywordGroup[];
  recommendations: string[];
}

/** Multi-word / symbol skills recognized in both the JD and the resume. */
const KNOWN_SKILLS: string[] = [
  'javascript', 'typescript', 'react', 'react native', 'vue', 'angular', 'svelte', 'next.js',
  'node.js', 'express', 'python', 'django', 'flask', 'java', 'spring', 'kotlin', 'swift',
  'go', 'rust', 'php', 'laravel', 'ruby', 'rails', 'c++', 'c#', '.net', 'sql', 'nosql',
  'postgresql', 'mysql', 'mongodb', 'redis', 'firebase', 'graphql', 'rest api', 'grpc',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ci/cd', 'jenkins', 'git',
  'linux', 'machine learning', 'deep learning', 'nlp', 'data analysis', 'data engineering',
  'pandas', 'numpy', 'tableau', 'power bi', 'excel', 'spark', 'hadoop', 'airflow',
  'figma', 'ui/ux', 'accessibility', 'testing', 'jest', 'playwright', 'cypress', 'selenium',
  'agile', 'scrum', 'kanban', 'jira', 'project management', 'product management',
  'stakeholder management', 'customer service', 'leadership', 'communication',
  'mentoring', 'hiring', 'seo', 'content marketing', 'salesforce', 'sap', 'erp',
];

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'you', 'your', 'our', 'will', 'are', 'have', 'has', 'this',
  'that', 'from', 'into', 'not', 'but', 'all', 'any', 'can', 'may', 'who', 'what', 'was',
  'job', 'role', 'work', 'working', 'team', 'teams', 'company', 'candidate', 'candidates',
  'experience', 'years', 'year', 'including', 'using', 'use', 'used', 'ability', 'strong',
  'plus', 'etc', 'per', 'new', 'other', 'more', 'than', 'also', 'well', 'about', 'across',
  'within', 'must', 'should', 'would', 'could', 'they', 'them', 'their', 'there', 'here',
  'we', 'us', 'it', 'its', 'as', 'at', 'by', 'in', 'on', 'or', 'to', 'of', 'a', 'an', 'be',
  'is', 'do', 'does', 'help', 'join', 'looking', 'apply', 'benefits', 'equal', 'employer',
  'opportunity', 'requirements', 'responsibilities', 'preferred', 'qualifications', 'skills',
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#./\s-]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && w.length < 30 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));
}

function countWords(text: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const word of tokenize(text)) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return counts;
}

/** Keywords from the JD, most frequent first (capped). */
export function extractJobKeywords(jd: string, limit = 20): KeywordGroup[] {
  return [...countWords(jd).entries()]
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count || a.keyword.localeCompare(b.keyword))
    .slice(0, limit);
}

function skillsIn(text: string): Set<string> {
  const lower = text.toLowerCase();
  const found = new Set<string>();
  for (const skill of KNOWN_SKILLS) {
    // Word-boundary-ish match so "java" doesn't hit "javascript".
    const pattern = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`(^|[^\\p{L}#${skill.includes('.') ? '' : '.'}])${pattern}`, 'u').test(lower)) {
      found.add(skill);
    }
  }
  return found;
}

function resumeSkillSource(resume: ResumeData): string {
  const own = resume.skills.join(' ; ');
  const exp = resume.experience
    .map((e) => [e.position, e.company, ...e.bullets].join(' '))
    .join(' ; ');
  const proj = resume.projects.map((p) => [p.name, p.technologies, p.description].join(' ')).join(' ; ');
  return `${own} ; ${exp} ; ${proj}`;
}

function titleCase(skill: string): string {
  return skill
    .split(/(\s|\/)/)
    .map((part) => (/^[a-z]$|^[a-z]{2,}$/.test(part) ? part[0].toUpperCase() + part.slice(1) : part))
    .join('');
}

/** Display casing for skills that titleCase would render incorrectly. */
const SKILL_DISPLAY: Record<string, string> = {
  javascript: 'JavaScript', typescript: 'TypeScript', 'node.js': 'Node.js', 'next.js': 'Next.js',
  'rest api': 'REST API', grpc: 'gRPC', 'ci/cd': 'CI/CD', aws: 'AWS', gcp: 'GCP', sql: 'SQL',
  nosql: 'NoSQL', nlp: 'NLP', mysql: 'MySQL', postgresql: 'PostgreSQL', mongodb: 'MongoDB',
  php: 'PHP', seo: 'SEO', sap: 'SAP', erp: 'ERP', 'ui/ux': 'UI/UX', go: 'Go', '.net': '.NET',
  'c++': 'C++', 'c#': 'C#', 'power bi': 'Power BI', numpy: 'NumPy',
};

const displaySkill = (skill: string) => SKILL_DISPLAY[skill] ?? titleCase(skill);

export function matchJob(resume: ResumeData, jd: string): JobMatchResult {
  const jdSkills = skillsIn(jd);
  const resumeSkillSet = new Set([
    ...skillsIn(resumeSkillSource(resume)),
    ...resume.skills.map((s) => s.toLowerCase().trim()),
  ]);
  const matchedSkills = [...jdSkills].filter((s) => resumeSkillSet.has(s));
  const missingSkills = [...jdSkills].filter((s) => !resumeSkillSet.has(s));

  const resumeText = [
    resume.personal.fullName, resume.personal.summary, resumeSkillSource(resume),
    resume.education.map((e) => [e.school, e.degree, e.field].join(' ')).join(' ; '),
    resume.certifications.map((c) => [c.name, c.issuer].join(' ')).join(' ; '),
  ].join(' ; ');
  const resumeLower = resumeText.toLowerCase();
  const resumeWordCounts = countWords(resumeText);

  const topKeywords = extractJobKeywords(jd, 20);
  const found = topKeywords.filter((k) => resumeLower.includes(k.keyword) || (resumeWordCounts.get(k.keyword) ?? 0) > 0);
  const keywordCoverage = {
    matched: found.length,
    total: topKeywords.length,
    percent: topKeywords.length ? Math.round((found.length / topKeywords.length) * 100) : 0,
  };

  const recommendations: string[] = [];
  for (const skill of missingSkills.slice(0, 3)) {
    recommendations.push(
      `The posting mentions “${titleCase(skill)}” but your resume does not. Add it to Skills or Experience only if you genuinely have that experience.`,
    );
  }
  const jdTitleWord = topKeywords.find((k) => !matchedSkills.includes(k.keyword));
  if (jdTitleWord && !resumeLower.includes(resume.personal.summary.trim().toLowerCase().slice(0, 30))) {
    recommendations.push('Mirror the job title wording in your professional summary where it truthfully applies.');
  }
  if (!/\d/.test(resume.experience.flatMap((e) => e.bullets).join(' '))) {
    recommendations.push('Add measurable results (numbers, %, team sizes) to your experience bullets.');
  }
  if (keywordCoverage.percent < 40 && topKeywords.length > 0) {
    recommendations.push('Low keyword overlap — work the posting’s key terms naturally into your summary and bullets.');
  }

  return {
    matchedSkills: matchedSkills.map(displaySkill),
    missingSkills: missingSkills.map(displaySkill),
    keywordCoverage,
    topKeywords,
    recommendations,
  };
}

/** Optional AI commentary through the server proxy (key stays server-side). */
export async function requestJobMatch(resume: ResumeData, jd: string): Promise<string> {
  const res = await aiJobMatch({ resumeText: resumeToPlainText(resume).slice(0, 4000), jobDescription: jd.slice(0, 6000) });
  return res.text;
}
