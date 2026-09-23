/**
 * Client for the server-side AI proxy (/api/ai/*).
 *
 * The API key lives only on the server. This client never handles keys.
 * Errors are normalized to a small set of codes the UI can present.
 */

export type AiErrorCode =
  | 'not_configured'
  | 'rate_limited'
  | 'network'
  | 'provider_error'
  | 'empty_response'
  | 'input_too_large'
  | 'invalid_input'
  | 'unavailable';

export class AiRequestError extends Error {
  code: AiErrorCode;
  constructor(code: AiErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

const TIMEOUT_MS = 30_000;
export const MAX_AI_INPUT_CHARS = 6000;

export const AI_ERROR_MESSAGES: Record<AiErrorCode, string> = {
  not_configured: 'AI is not configured on this server. Set GOOGLE_API_KEY to enable it.',
  rate_limited: 'Too many AI requests right now. Please wait a minute and try again.',
  network: 'Could not reach the AI service. Check your connection and try again.',
  provider_error: 'The AI service returned an error. Please try again.',
  empty_response: 'The AI returned an empty response. Try rephrasing your input.',
  input_too_large: 'The selected text is too long for AI processing.',
  invalid_input: 'The request was missing required information.',
  unavailable: 'The AI assistant is temporarily unavailable.',
};

async function callAi<T>(path: string, body: unknown): Promise<T> {
  let controller: AbortController | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  try {
    controller = new AbortController();
    timer = setTimeout(() => controller?.abort(), TIMEOUT_MS);
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

    if (res.ok) return data as T;

    const code = (typeof data.error === 'string' ? data.error : 'unavailable') as AiErrorCode;
    const mapped: AiErrorCode =
      code === 'network' && res.status >= 500 ? 'provider_error' : code;
    throw new AiRequestError(mapped in AI_ERROR_MESSAGES ? mapped : 'unavailable');
  } catch (error) {
    if (error instanceof AiRequestError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new AiRequestError('network', 'AI request timed out.');
    }
    throw new AiRequestError('network');
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export type RewriteMode = 'professional' | 'concise' | 'achievement' | 'grammar' | 'ats';

export const aiRewrite = (text: string, mode: RewriteMode) =>
  callAi<{ text: string }>('/api/ai/rewrite', { text, mode });

export const aiBullets = (input: { role: string; company?: string; context?: string; skills?: string[] }) =>
  callAi<{ bullets: string[] }>('/api/ai/bullets', input);

export const aiSummary = (resumeText: string) =>
  callAi<{ text: string }>('/api/ai/summary', { resumeText });

export const aiSkills = (input: { role: string; context?: string }) =>
  callAi<{ skills: string[] }>('/api/ai/skills', input);
