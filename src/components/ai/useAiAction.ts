import { useCallback, useState } from 'react';
import { AiRequestError, AI_ERROR_MESSAGES, type AiErrorCode } from '@/lib/aiClient';

export interface AiActionState {
  loading: boolean;
  error: string | null;
  run: <T>(action: () => Promise<T>, onSuccess: (result: T) => void) => Promise<void>;
  clearError: () => void;
}

/** Wraps an AI call with loading + friendly error handling for the UI. */
export function useAiAction(): AiActionState {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async <T,>(action: () => Promise<T>, onSuccess: (result: T) => void) => {
    setLoading(true);
    setError(null);
    try {
      const result = await action();
      onSuccess(result);
    } catch (err) {
      if (err instanceof AiRequestError) {
        setError(AI_ERROR_MESSAGES[err.code] ?? AI_ERROR_MESSAGES.unavailable);
      } else {
        setError(AI_ERROR_MESSAGES.unavailable);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);
  return { loading, error, run, clearError };
}

export type { AiErrorCode };
