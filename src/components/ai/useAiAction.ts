import { useCallback, useState } from 'react';
import { AiRequestError, AI_ERROR_MESSAGES, type AiErrorCode } from '@/lib/aiClient';

export interface AiActionState {
  loading: boolean;
  /** Human-readable message for the last failure, if any. */
  error: string | null;
  /** The same failure as a code, so the UI can react to "not configured". */
  errorCode: AiErrorCode | null;
  run: <T>(action: () => Promise<T>, onSuccess: (result: T) => void) => Promise<void>;
  clearError: () => void;
}

/** Wraps an AI call with loading + friendly error handling for the UI. */
export function useAiAction(): AiActionState {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<AiErrorCode | null>(null);

  const run = useCallback(async <T,>(action: () => Promise<T>, onSuccess: (result: T) => void) => {
    setLoading(true);
    setError(null);
    setErrorCode(null);
    try {
      const result = await action();
      onSuccess(result);
    } catch (err) {
      const code = err instanceof AiRequestError ? err.code : 'unavailable';
      setErrorCode(code);
      setError(AI_ERROR_MESSAGES[code] ?? AI_ERROR_MESSAGES.unavailable);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setErrorCode(null);
  }, []);
  return { loading, error, errorCode, run, clearError };
}

export type { AiErrorCode };
