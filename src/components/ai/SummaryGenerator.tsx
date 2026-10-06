import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAiAction } from './useAiAction';
import AiErrorNotice from './AiErrorNotice';
import { aiSummary } from '@/lib/aiClient';
import { resumeToPlainText } from '@/lib/resumeText';

interface SummaryGeneratorProps { resumeText: string; currentSummary: string; onAccept: (summary: string) => void; }

export default function SummaryGenerator({ resumeText, currentSummary, onAccept }: SummaryGeneratorProps) {
  const { run, loading, errorCode, clearError } = useAiAction();
  const [preview, setPreview] = useState<string | null>(null);
  const generate = () => { clearError(); setPreview(null); run(() => aiSummary(resumeText), (result) => setPreview(result.text?.trim() || null)); };

  return (
    <div className="space-y-1.5">
      <Button variant="secondary" size="sm" className="gap-1.5" onClick={generate} disabled={loading}>
        {loading && <Loader2 className="h-3 w-3 animate-spin" />}
        {loading ? 'Writing…' : currentSummary.trim() ? 'Suggest a new summary' : 'Write one from my resume'}
      </Button>
      <AiErrorNotice code={errorCode} />
      {preview && (
        <div className="space-y-2 rounded-md border border-border bg-card p-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium uppercase tracking-[0.06em] text-muted-2">Suggestion — review before applying</span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0"
              onClick={() => setPreview(null)}
              aria-label="Discard"
            >
              <X />
            </Button>
          </div>
          <p className="rounded border border-border bg-muted/40 p-2.5 text-sm leading-relaxed text-foreground">{preview}</p>
          <div className="flex gap-2">
            <Button size="sm" className="h-8 rounded px-3 text-xs" onClick={() => { onAccept(preview); setPreview(null); }}>Apply</Button>
            <Button variant="ghost" size="sm" className="h-8 rounded px-3 text-xs" onClick={() => setPreview(null)}>Discard</Button>
          </div>
        </div>
      )}
    </div>
  );
}
