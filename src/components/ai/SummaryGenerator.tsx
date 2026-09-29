import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAiAction } from './useAiAction';
import { aiSummary } from '@/lib/aiClient';
import { resumeToPlainText } from '@/lib/resumeText';

interface SummaryGeneratorProps { resumeText: string; currentSummary: string; onAccept: (summary: string) => void; }

export default function SummaryGenerator({ resumeText, currentSummary, onAccept }: SummaryGeneratorProps) {
  const { run, loading, error, clearError } = useAiAction();
  const [preview, setPreview] = useState<string | null>(null);
  const generate = () => { clearError(); setPreview(null); run(() => aiSummary(resumeText), (result) => setPreview(result.text?.trim() || null)); };

  return (
    <div className="space-y-1.5">
      <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5 border-accent/20 text-accent hover:bg-accent/5 hover:border-accent/30 transition-colors" onClick={generate} disabled={loading}>
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <span className="text-[9px]">✦</span>}
        {currentSummary.trim() ? 'Suggest a new summary' : 'Generate from my resume'}
      </Button>
      {error && <p className="text-[11px] text-destructive">{error}</p>}
      {preview && (
        <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-3 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-accent flex items-center gap-1.5"><span className="text-[9px]">✦</span> AI suggestion — review before accepting</span>
            <button onClick={() => setPreview(null)} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Discard"><X className="h-3 w-3" /></button>
          </div>
          <p className="text-[12px] text-foreground/85 leading-relaxed bg-background/50 rounded-lg p-2.5 border border-border/40">{preview}</p>
          <div className="flex gap-1.5">
            <Button size="sm" className="h-7 px-3 text-[11px] font-medium" onClick={() => { onAccept(preview); setPreview(null); }}>Use this summary</Button>
            <Button variant="ghost" size="sm" className="h-7 px-3 text-[11px]" onClick={() => setPreview(null)}>Discard</Button>
          </div>
        </div>
      )}
    </div>
  );
}
