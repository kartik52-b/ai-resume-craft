import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AiRequestNotice({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p role="note" className={cn('flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground', className)}>
      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-bronze" aria-hidden="true" />
      <span>{children} Sent to Google Gemini only when you request a suggestion; your resume changes only if you apply it.</span>
    </p>
  );
}