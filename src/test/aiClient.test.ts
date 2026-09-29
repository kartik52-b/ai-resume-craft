import { describe, it, expect, afterEach, vi } from 'vitest';
import { aiRewrite, AiRequestError, MAX_AI_INPUT_CHARS } from '@/lib/aiClient';

describe('aiClient', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns parsed result on success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ text: 'rewritten' }), { status: 200 }),
    );
    await expect(aiRewrite('original text', 'professional')).resolves.toEqual({ text: 'rewritten' });
  });

  it('maps server error codes to typed errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'not_configured' }), { status: 503 }),
    );
    await expect(aiRewrite('text', 'concise')).rejects.toMatchObject({ code: 'not_configured' });
  });

  it('maps rate limiting', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'rate_limited' }), { status: 429 }),
    );
    await expect(aiRewrite('text', 'grammar')).rejects.toMatchObject({ code: 'rate_limited' });
  });

  it('maps unknown server errors to unavailable', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{"error":"weird_unknown"}', { status: 500 }),
    );
    await expect(aiRewrite('text', 'ats')).rejects.toMatchObject({ code: 'unavailable' });
  });

  it('maps network failures', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(aiRewrite('text', 'professional')).rejects.toMatchObject({ code: 'network' });
  });

  it('maps aborted requests (timeout) to network error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new DOMException('The operation was aborted.', 'AbortError'),
    );
    try {
      await aiRewrite('text', 'professional');
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(AiRequestError);
      expect((e as AiRequestError).code).toBe('network');
    }
  });

  it('exports an input limit consistent with the server cap', () => {
    expect(MAX_AI_INPUT_CHARS).toBe(6000);
  });
});
