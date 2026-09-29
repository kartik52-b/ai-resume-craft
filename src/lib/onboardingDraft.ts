import { EMPTY_PERSONAL_DETAILS, EMPTY_BACKGROUND, type PersonalDetails, type BackgroundDetails } from '@/lib/onboarding';
import { ALL_TEMPLATE_TYPES, type TemplateType } from '@/types/resume';
import { generateId } from '@/lib/id';

/**
 * Persistent draft cache for the onboarding flow.
 *
 * Stores what the visitor has typed so far (personal details, background rows,
 * chosen design) under a single versioned key so a refresh, an accidental
 * navigation away, or a step change never loses input.
 *
 * The cache is scoped to one draft at a time — `activeDraftId` tags the entry,
 * and a different draft id starts from the empty defaults instead of adopting
 * another resume's data.
 *
 * Conventions follow storage.ts: every read is defensive, malformed payloads
 * fall back to defaults, and nothing here ever throws.
 */

const DRAFT_KEY = 'ai-resume-craft:onboarding-draft';
const DRAFT_VERSION = 1;
/** Bump when the OnboardingDraft shape changes in a non-compatible way. */
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export interface OnboardingDraft {
  version: number;
  savedAt: number;
  /** Identifies the draft these values belong to (per-resume scoping). */
  activeDraftId: string;
  step: number;
  details: PersonalDetails;
  background: BackgroundDetails;
  template: TemplateType;
}

export interface DraftLoadResult {
  draft: OnboardingDraft;
  /** True when the cached draft matched the requested id and was restored. */
  restored: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asStringObject(value: unknown, keys: readonly string[]): Record<string, string> {
  const out: Record<string, string> = {};
  if (!isRecord(value)) return out;
  for (const key of keys) {
    if (typeof value[key] === 'string') out[key] = value[key] as string;
  }
  return out;
}

/** Rows are kept only when every item is an object; fields default to ''. */
function asRowArray(value: unknown, keys: readonly string[]): Record<string, string>[] {
  return Array.isArray(value)
    ? value.filter(isRecord).map((row) => asStringObject(row, keys))
    : [];
}

const DETAIL_KEYS = Object.keys(EMPTY_PERSONAL_DETAILS) as (keyof PersonalDetails)[];

function sanitizeDetails(raw: unknown): PersonalDetails {
  const stored = asStringObject(raw, DETAIL_KEYS);
  return { ...EMPTY_PERSONAL_DETAILS, ...stored };
}

function sanitizeBackground(raw: unknown): BackgroundDetails {
  if (!isRecord(raw)) return { ...EMPTY_BACKGROUND };
  return {
    education: asRowArray(raw.education, ['id', 'school', 'degree', 'field', 'startDate', 'endDate', 'description']).map(
      (row) => ({
        id: asString(row.id) || generateId(),
        school: asString(row.school),
        degree: asString(row.degree),
        field: asString(row.field),
        startDate: asString(row.startDate),
        endDate: asString(row.endDate),
        description: asString(row.description),
      }),
    ),
    experience: asRowArray(raw.experience, ['company', 'position', 'startDate', 'endDate', 'description']).map(
      (row) => ({
        company: asString(row.company),
        position: asString(row.position),
        startDate: asString(row.startDate),
        endDate: asString(row.endDate),
        description: asString(row.description),
      }),
    ),
    skills: Array.isArray(raw.skills) ? raw.skills.filter((s): s is string => typeof s === 'string') : [],
    projects: asRowArray(raw.projects, ['name', 'description', 'technologies', 'link']).map((row) => ({
      name: asString(row.name),
      description: asString(row.description),
      technologies: asString(row.technologies),
      link: asString(row.link),
    })),
    certifications: asRowArray(raw.certifications, ['name', 'issuer', 'date', 'link']).map((row) => ({
      name: asString(row.name),
      issuer: asString(row.issuer),
      date: asString(row.date),
      link: asString(row.link),
    })),
  };
}

function sanitizeTemplate(raw: unknown): TemplateType {
  return ALL_TEMPLATE_TYPES.includes(raw as TemplateType) ? (raw as TemplateType) : 'modern';
}

/** Builds a fresh, empty draft scoped to the given id. */
export function createEmptyDraft(activeDraftId: string): OnboardingDraft {
  return {
    version: DRAFT_VERSION,
    savedAt: Date.now(),
    activeDraftId,
    step: 1,
    details: { ...EMPTY_PERSONAL_DETAILS },
    background: { ...EMPTY_BACKGROUND, education: [], experience: [], projects: [], certifications: [] },
    template: 'modern',
  };
}

/**
 * Reads the cached draft. Returns an empty draft when storage is unavailable,
 * unparsable, stale, or written by a newer app version — and `restored` is
 * only true when the cached entry still belongs to `activeDraftId`.
 */
export function loadOnboardingDraft(activeDraftId: string): DraftLoadResult {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(DRAFT_KEY);
  } catch {
    return { draft: createEmptyDraft(activeDraftId), restored: false };
  }

  if (!raw) return { draft: createEmptyDraft(activeDraftId), restored: false };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { draft: createEmptyDraft(activeDraftId), restored: false };
  }

  if (
    !isRecord(parsed) ||
    parsed.version !== DRAFT_VERSION ||
    typeof parsed.activeDraftId !== 'string' ||
    typeof parsed.savedAt !== 'number'
  ) {
    return { draft: createEmptyDraft(activeDraftId), restored: false };
  }

  // Expired or written by a newer release — start clean rather than guessing.
  if (Date.now() - parsed.savedAt > MAX_AGE_MS || Date.now() < parsed.savedAt) {
    return { draft: createEmptyDraft(activeDraftId), restored: false };
  }

  const draft: OnboardingDraft = {
    version: DRAFT_VERSION,
    savedAt: parsed.savedAt,
    activeDraftId: parsed.activeDraftId,
    step: typeof parsed.step === 'number' && parsed.step >= 1 && parsed.step <= 5 ? Math.floor(parsed.step) : 1,
    details: sanitizeDetails(parsed.details),
    background: sanitizeBackground(parsed.background),
    template: sanitizeTemplate(parsed.template),
  };

  // Draft ids must match: a different resume's values are never adopted.
  if (draft.activeDraftId !== activeDraftId) {
    return { draft: createEmptyDraft(activeDraftId), restored: false };
  }

  return { draft, restored: true };
}

/** Persists the draft. Never throws (private mode, quota…). */
export function saveOnboardingDraft(draft: OnboardingDraft): boolean {
  try {
    const payload: OnboardingDraft = { ...draft, version: DRAFT_VERSION, savedAt: Date.now() };
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

/** Removes the cached draft (used once onboarding finishes or is reset). */
export function clearOnboardingDraft(): void {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Nothing to clean up.
  }
}

/** True when the draft holds nothing the user typed (used to avoid caching empty forms). */
export function isOnboardingDraftEmpty(draft: OnboardingDraft): boolean {
  const detailsEmpty = Object.values(draft.details).every((v) => v.trim().length === 0);
  if (!detailsEmpty) return false;
  const bg = draft.background;
  const rowHasText = (rows: readonly unknown[]) =>
    rows.some((row) =>
      row !== null && typeof row === 'object' &&
      Object.values(row).some((v) => typeof v === 'string' && v.trim().length > 0),
    );
  const backgroundEmpty =
    !rowHasText(bg.education) &&
    !rowHasText(bg.experience) &&
    !rowHasText(bg.projects) &&
    !rowHasText(bg.certifications) &&
    bg.skills.length === 0;
  return backgroundEmpty && draft.step <= 1 && draft.template === 'modern';
}

/** Saves unless the draft is empty, in which case any stale cache is removed. */
export function syncOnboardingDraft(draft: OnboardingDraft): void {
  if (isOnboardingDraftEmpty(draft)) {
    clearOnboardingDraft();
    return;
  }
  saveOnboardingDraft(draft);
}
