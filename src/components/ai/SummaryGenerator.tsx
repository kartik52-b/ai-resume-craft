import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11.5px]" onClick={generate} disabled={loading}>
        {loading && <Loader2 className="h-3 w-3 animate-spin" />}
        {loading ? 'Writing…' : currentSummary.trim() ? 'Suggest a new summary' : 'Write one from my resume'}
      </Button>
      <AiErrorNotice code={errorCode} />
      {preview && (
        <div className="space-y-2 rounded-md border border-border bg-card p-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Suggestion — review before applying</span>
            <button onClick={() => setPreview(null)} className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Discard"><X className="h-3.5 w-3.5" /></button>
          </div>
          <p className="rounded border border-border bg-muted/40 p-2.5 text-[12.5px] leading-relaxed text-foreground/90">{preview}</p>
          <div className="flex gap-2">
            <Button size="sm" className="h-8 rounded px-3 text-[11.5px]" onClick={() => { onAccept(preview); setPreview(null); }}>Apply</Button>
            <Button variant="ghost" size="sm" className="h-8 rounded px-3 text-[11.5px]" onClick={() => setPreview(null)}>Discard</Button>
          </div>
        </div>
      )}
    </div>
  );
}
