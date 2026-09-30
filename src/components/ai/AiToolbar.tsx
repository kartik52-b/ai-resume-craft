import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAiAction } from './useAiAction';
import AiErrorNotice from './AiErrorNotice';
import { aiRewrite, type RewriteMode } from '@/lib/aiClient';
import { cn } from '@/lib/utils';

const MODES: { id: RewriteMode; label: string; hint: string }[] = [
  { id: 'professional', label: 'Make professional', hint: 'Polish tone and clarity' },
  { id: 'concise', label: 'Make concise', hint: 'Tighten without losing meaning' },
  { id: 'achievement', label: 'Improve impact', hint: 'Emphasize results' },
  { id: 'grammar', label: 'Fix grammar', hint: 'Correct errors only' },
  { id: 'standard', label: 'Plain wording', hint: 'Simple phrasing, easy to scan' },
];

interface AiToolbarProps { text: string; onAccept: (rewritten: string) => void; className?: string; }

/**
 * Writing assistance attached to a single field.
 *
 * Deliberately shaped like any other editing control: a quiet text button,
 * a short menu, and a draft the user applies or discards. Nothing here is
 * decorative, and nothing is written into the resume without a click.
 */
export default function AiToolbar({ text, onAccept, className }: AiToolbarProps) {
  const { run, loading, errorCode, clearError } = useAiAction();
  const [preview, setPreview] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const rewrite = (mode: RewriteMode) => {
    setMenuOpen(false);
    setOriginalText(text);
    run(() => aiRewrite(text, mode), (result) => setPreview(result.text?.trim() || null));
  };

  if (!text.trim()) return null;

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        disabled={loading}
        onClick={() => { setPreview(null); clearError(); setMenuOpen(v => !v); }}
        className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[11.5px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
      >
        {loading && <Loader2 className="h-3 w-3 animate-spin" />}
        {loading ? 'Writing…' : 'Improve with AI'}
      </button>

      {menuOpen && !loading && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1.5 w-56 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-elevated animate-scale-in"
        >
          {MODES.map((mode) => (
            <button
              key={mode.id}
              role="menuitem"
              onClick={() => rewrite(mode.id)}
              className="block w-full rounded px-2.5 py-2 text-left transition-colors hover:bg-muted"
            >
              <span className="block text-[12px] font-medium text-foreground">{mode.label}</span>
              <span className="block text-[10.5px] text-muted-foreground">{mode.hint}</span>
            </button>
          ))}
        </div>
      )}

      <AiErrorNotice code={errorCode} className="mt-1" />

      {preview && preview !== originalText && (
        <div className="mt-2 rounded-md border border-border bg-card p-3 animate-fade-in">
          <div className="flex items-start justify-between gap-3">
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              Suggestion
            </span>
            <button
              onClick={() => setPreview(null)}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Discard suggestion"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-2 text-[12.5px] leading-relaxed text-foreground/90">{preview}</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" className="h-7 rounded px-3 text-[11.5px]" onClick={() => { onAccept(preview); setPreview(null); }}>
              Apply
            </Button>
            <Button variant="ghost" size="sm" className="h-7 rounded px-3 text-[11.5px]" onClick={() => setPreview(null)}>
              Discard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
