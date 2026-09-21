import { useState } from 'react';
import { Loader2, Wand2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAiAction } from './useAiAction';
import { aiRewrite, type RewriteMode } from '@/lib/aiClient';
import { cn } from '@/lib/utils';

const MODES: { id: RewriteMode; label: string; hint: string }[] = [
  { id: 'professional', label: 'Make professional', hint: 'Polish tone and clarity' },
  { id: 'concise', label: 'Make concise', hint: 'Tighten without losing meaning' },
  { id: 'achievement', label: 'Improve impact', hint: 'Emphasize results' },
  { id: 'grammar', label: 'Fix grammar', hint: 'Correct errors only' },
  { id: 'ats', label: 'ATS-friendly', hint: 'Standard wording for parsers' },
];

interface AiToolbarProps { text: string; onAccept: (rewritten: string) => void; className?: string; }

export default function AiToolbar({ text, onAccept, className }: AiToolbarProps) {
  const { run, loading, error, clearError } = useAiAction();
  const [preview, setPreview] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const rewrite = (mode: RewriteMode) => { setMenuOpen(false); setOriginalText(text); run(() => aiRewrite(text, mode), (result) => setPreview(result.text?.trim() || null)); };
  if (!text.trim()) return null;

  return (
    <div className={cn('relative', className)}>
      <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] text-accent hover:text-accent hover:bg-accent/5 transition-colors" disabled={loading}
        onClick={() => { setPreview(null); clearError(); setMenuOpen(v => !v); }}>
        {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <span className="mr-1 text-[9px]">✦</span>}
        {loading ? 'Generating...' : 'AI assist'}
      </Button>
      {menuOpen && !loading && (
        <div className="absolute right-0 z-30 mt-1 w-52 rounded-xl border border-border/60 bg-popover text-popover-foreground shadow-lg p-1 animate-scale-in">
          {MODES.map((mode) => (
            <button key={mode.id} onClick={() => rewrite(mode.id)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors group">
              <div className="text-[12px] font-medium text-foreground group-hover:text-accent">{mode.label}</div>
              <div className="text-[10px] text-muted-foreground">{mode.hint}</div>
            </button>
          ))}
        </div>
      )}
      {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
      {preview && (
        <div className="mt-1.5 rounded-xl border border-accent/20 bg-accent/[0.03] p-3 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-accent flex items-center gap-1.5"><span className="text-[9px]">✦</span> AI suggestion</span>
            <button onClick={() => setPreview(null)} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Discard"><X className="h-3 w-3" /></button>
          </div>
          <p className="text-[12px] text-foreground/85 leading-relaxed bg-background/50 rounded-lg p-2.5 border border-border/40">{preview}</p>
          <div className="flex gap-1.5">
            <Button size="sm" className="h-7 px-3 text-[11px] font-medium gap-1" onClick={() => { onAccept(preview); setPreview(null); }}><Wand2 className="h-3 w-3" /> Accept</Button>
            <Button variant="ghost" size="sm" className="h-7 px-3 text-[11px]" onClick={() => setPreview(null)}>Discard</Button>
          </div>
        </div>
      )}
    </div>
  );
}
