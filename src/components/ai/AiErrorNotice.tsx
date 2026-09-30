import { Link } from 'react-router-dom';
import { AI_ERROR_MESSAGES, type AiErrorCode } from '@/lib/aiClient';
import { cn } from '@/lib/utils';

/**
 * One quiet line of feedback under a writing-assistance control.
 *
 * A missing server key is not a failure the user caused, so it is never shown
 * as a red error: it states the situation plainly and offers the one useful
 * next step. Everything else keeps the short destructive treatment.
 */
export default function AiErrorNotice({
  code,
  className,
}: {
  code: AiErrorCode | null;
  className?: string;
}) {
  if (!code) return null;

  const message = AI_ERROR_MESSAGES[code] ?? AI_ERROR_MESSAGES.unavailable;

  if (code !== 'not_configured') {
    return (
      <p role="status" className={cn('text-[11px] text-destructive', className)}>
        {message}
      </p>
    );
  }

  return (
    <p role="status" className={cn('text-[11px] text-muted-foreground', className)}>
      {message}{' '}
      <Link
        to="/settings"
        className="text-foreground underline decoration-border underline-offset-2 transition-colors hover:decoration-bronze"
      >
        Set up AI
      </Link>
    </p>
  );
}
