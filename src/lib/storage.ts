import { type ResumeData, type TemplateType, createEmptyResume, createStarterResume, DEFAULT_SECTION_ORDER } from '@/types/resume';
import { generateId } from '@/lib/id';

/**
 * Local persistence for the resume store.
 *
 * Storage layout (single key, versioned envelope):
 *   { "version": 2, "savedAt": "<ISO date>", "store": { resumes: [...], activeId } }
 *
 * Version history:
 *   0 — earliest pre-release single-resume shape (legacy, partial)
 *   1 — single-resume shape: { ..., data: ResumeData }
 *   2 — multi-resume shape:  { ..., store: { resumes: ResumeData[], activeId } }
 *
 * Future schema changes: bump CURRENT_STORAGE_VERSION, extend migrateLegacyData
 * for legacy single-resume inputs and add a store migration for store shapes.
 * Data written by a NEWER app version is never touched (reported as corrupted).
 */

export const STORAGE_KEY = 'ai-resume-craft:store';
export const CURRENT_STORAGE_VERSION = 2;

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
export type LoadStatus = 'fresh' | 'restored' | 'salvaged' | 'corrupted';

export interface ResumeStore {
  resumes: ResumeData[];
  activeId: string | null;
}

/** Versioned envelope (current version). */
export interface StoredEnvelope {
  version: number;
  savedAt: string;
  store: ResumeStore;
}

export interface LoadResult {
  status: LoadStatus;
  store: ResumeStore;
}

export interface SaveResult {
  ok: boolean;
  /** Error NAME only (e.g. "QuotaExceededError") — never data contents. */
  error?: string;
}

import { ALL_TEMPLATE_TYPES } from '@/types/resume';
const TEMPLATE_TYPES: TemplateType[] = ALL_TEMPLATE_TYPES;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/** Object arrays are kept only when every item is an object. */
function asObjectArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

/**
 * Rebuilds a complete ResumeData from arbitrary input, falling back to
 * defaults for every missing/invalid field. Never throws.
 */
export function sanitizeResume(raw: unknown): ResumeData {
  const fallback = createEmptyResume();
  if (!isRecord(raw)) return fallback;

  const personal = isRecord(raw.personal) ? raw.personal : {};

  /** Stored order is kept only when it is a valid array of known section ids. */
  const storedOrder = Array.isArray(raw.sectionOrder)
    ? (raw.sectionOrder.filter(
        (id): id is (typeof DEFAULT_SECTION_ORDER)[number] =>
          typeof id === 'string' && (DEFAULT_SECTION_ORDER as string[]).includes(id),
      ) as ResumeData['sectionOrder'])
    : undefined;

  return {
    id: asString(raw.id) || fallback.id,
    title: asString(raw.title) || fallback.title,
    updatedAt: asString(raw.updatedAt) || undefined,
    template: TEMPLATE_TYPES.includes(raw.template as TemplateType)
      ? (raw.template as TemplateType)
      : fallback.template,
    sectionOrder: storedOrder,
    hiddenSections: Array.isArray(raw.hiddenSections)
      ? (raw.hiddenSections.filter(
          (id): id is (typeof DEFAULT_SECTION_ORDER)[number] =>
            typeof id === 'string' && (DEFAULT_SECTION_ORDER as string[]).includes(id),
        ) as ResumeData['hiddenSections'])
      : undefined,
    personal: {
      fullName: asString(personal.fullName),
      email: asString(personal.email),
      phone: asString(personal.phone),
      location: asString(personal.location),
      website: asString(personal.website),
      linkedin: asString(personal.linkedin),
      github: asString(personal.github),
      summary: asString(personal.summary),
    },
    experience: asObjectArray(raw.experience) as unknown as ResumeData['experience'],
    education: asObjectArray(raw.education) as unknown as ResumeData['education'],
    skills: Array.isArray(raw.skills) ? raw.skills.filter((s): s is string => typeof s === 'string') : [],
    projects: asObjectArray(raw.projects) as unknown as ResumeData['projects'],
    certifications: asObjectArray(raw.certifications) as unknown as ResumeData['certifications'],
  };
}

/** True when `data` matches the single-resume schema without any repair. */
function isValidResumeShape(data: unknown): data is ResumeData {
  if (!isRecord(data)) return false;
  const p = data.personal;
  const validSectionIds = (v: unknown) =>
    Array.isArray(v) && v.every((id) => typeof id === 'string' && (DEFAULT_SECTION_ORDER as string[]).includes(id));
  return (
    typeof data.id === 'string' &&
    typeof data.title === 'string' &&
    TEMPLATE_TYPES.includes(data.template as TemplateType) &&
    isRecord(p) &&
    ['fullName', 'email', 'phone', 'location', 'website', 'linkedin', 'github', 'summary']
      .every((k) => typeof p[k] === 'string') &&
    ['experience', 'education', 'skills', 'projects', 'certifications'].every((k) => Array.isArray(data[k])) &&
    (data.sectionOrder === undefined || validSectionIds(data.sectionOrder)) &&
    (data.hiddenSections === undefined || validSectionIds(data.hiddenSections))
  );
}

/** True when `store` matches the multi-resume schema without any repair. */
function isValidStoreShape(store: unknown): store is ResumeStore {
  if (!isRecord(store)) return false;
  return (
    Array.isArray(store.resumes) &&
    store.resumes.every(isValidResumeShape) &&
    (store.activeId === null || typeof store.activeId === 'string')
  );
}

/**
 * Legacy single-resume data transforms.
 * Key N migrates data written by legacy version N so it conforms to N+1.
 */
const LEGACY_MIGRATIONS: Record<number, (data: unknown) => unknown> = {
  // v0 → v1: the v1 single-resume shape is a superset of v0, so this is a
  // passthrough. Validation and default-filling happen once in legacyToStore,
  // which also decides restored-vs-salvaged from the ORIGINAL payload.
  0: (data) => data,
};

function migrateLegacyData(data: unknown, fromVersion: number): { ok: true; data: unknown } | { ok: false } {
  let current = data;
  for (let v = fromVersion; v < 1; v++) {
    const migration = LEGACY_MIGRATIONS[v];
    if (!migration) return { ok: false };
    current = migration(current);
  }
  return { ok: true, data: current };
}

/** Wraps legacy single-resume data (v0/v1) into a v2 store. */
function legacyToStore(data: unknown, fromVersion: number): LoadResult {
  const migrated = migrateLegacyData(data, fromVersion);
  if (!migrated.ok) return { status: 'corrupted', store: { resumes: [], activeId: null } };

  // Judge completeness on the pre-repair payload, then sanitize once.
  const status: LoadStatus = isValidResumeShape(migrated.data) ? 'restored' : 'salvaged';
  const resume = sanitizeResume(migrated.data);
  return { status, store: { resumes: [resume], activeId: resume.id } };
}

function emptyStore(): ResumeStore {
  return { resumes: [], activeId: null };
}

/**
 * Reads and validates the stored envelope. Never throws and never writes:
 * - no stored value                    → { status: 'fresh', empty store }
 * - valid v2 store                     → { status: 'restored' }
 * - valid v0/v1 single resume          → migrated to a store ('restored' or 'salvaged')
 * - partially valid store / legacy     → { status: 'salvaged' } (valid items kept)
 * - unparseable/unknown/future version → { status: 'corrupted', empty store }
 *
 * activeId is always normalized to an existing resume, or the first resume.
 */
export function loadStore(): LoadResult {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage unavailable (private mode, disabled cookies, etc.)
    return { status: 'fresh', store: emptyStore() };
  }

  if (raw === null || raw === '') return { status: 'fresh', store: emptyStore() };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { status: 'corrupted', store: emptyStore() };
  }

  if (!isRecord(parsed)) return { status: 'corrupted', store: emptyStore() };

  const version = typeof parsed.version === 'number' ? parsed.version : -1;
  if (version < 0 || version > CURRENT_STORAGE_VERSION) {
    return { status: 'corrupted', store: emptyStore() };
  }

  // Legacy single-resume envelopes (v0/v1) live under `data`.
  if (version <= 1) {
    if (!isRecord(parsed.data)) return { status: 'corrupted', store: emptyStore() };
    return legacyToStore(parsed.data, version);
  }

  if (!isRecord(parsed.store)) return { status: 'corrupted', store: emptyStore() };

  if (isValidStoreShape(parsed.store)) {
    const store = parsed.store;
    const activeId =
      store.activeId && store.resumes.some((r) => r.id === store.activeId)
        ? store.activeId
        : (store.resumes[0]?.id ?? null);
    return { status: 'restored', store: { resumes: store.resumes, activeId } };
  }

  // Salvage: keep every resume that passes sanitization.
  if (Array.isArray(parsed.store.resumes)) {
    const resumes = parsed.store.resumes.filter(isRecord).map((r) => sanitizeResume(r));
    if (resumes.length > 0) {
      const wanted = typeof parsed.store.activeId === 'string' ? parsed.store.activeId : null;
      const activeId =
        wanted && resumes.some((r) => r.id === wanted)
          ? wanted
          : resumes[0].id;
      return { status: 'salvaged', store: { resumes, activeId } };
    }
  }

  return { status: 'corrupted', store: emptyStore() };
}

/**
 * Ensures the store always has at least one active resume.
 * Creates a starter resume (default example details) when the store is empty.
 * Pure (does not persist).
 */
export function ensureActiveResume(store: ResumeStore): ResumeStore {
  if (store.resumes.length > 0 && store.activeId) return store;
  if (store.resumes.length > 0) {
    return { ...store, activeId: store.resumes[0].id };
  }
  const resume = { ...createStarterResume(), updatedAt: new Date().toISOString() };
  return { resumes: [resume], activeId: resume.id };
}

/** Serializes the store into a versioned envelope. Never throws. */
export function saveStore(store: ResumeStore): SaveResult {
  try {
    const envelope: StoredEnvelope = {
      version: CURRENT_STORAGE_VERSION,
      savedAt: new Date().toISOString(),
      store,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: errorName(error) };
  }
}

/** Extracts an error NAME across realms (DOMException does not always extend Error). */
function errorName(error: unknown): string {
  if (error instanceof Error) return error.name;
  if (isRecord(error) && typeof error.name === 'string') return error.name;
  return 'UnknownError';
}

/** Removes stored data entirely (used by tests and future "reset" flows). */
export function clearStoredResume(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore — nothing to clean up.
  }
}
