import { BadgeCheck, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AiSuggestionListProps { title: string; items: string[]; onAccept: (item: string) => void; onDismiss: (item: string) => void; onDismissAll: () => void; emptyMessage?: string; }

export default function AiSuggestionList({ title, items, onAccept, onDismiss, onDismissAll, emptyMessage }: AiSuggestionListProps) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-3 space-y-2 animate-fade-in">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-accent"><BadgeCheck className="h-3.5 w-3.5" />{title}</span>
        <button onClick={onDismissAll} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">Dismiss all</button>
      </div>
      {items.length === 0 && emptyMessage && <p className="text-xs text-muted-foreground">{emptyMessage}</p>}
      {items.map((item) => (
        <div key={item} className="flex items-start gap-2 group p-2.5 rounded-lg bg-background/50 border border-border/40 hover:border-border/60 transition-colors">
          <p className="flex-1 text-[12px] text-foreground/85 leading-relaxed">{item}</p>
          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] font-medium text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/5 transition-colors" onClick={() => onAccept(item)}>
              <Check className="h-3 w-3 mr-0.5" /> Accept
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors" onClick={() => onDismiss(item)} aria-label="Dismiss suggestion">
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
