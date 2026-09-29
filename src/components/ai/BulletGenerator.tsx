import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAiAction } from './useAiAction';
import { aiBullets } from '@/lib/aiClient';
import AiSuggestionList from './AiSuggestionList';

interface BulletGeneratorProps { role: string; company: string; existingBullets: string[]; skills: string[]; onAccept: (bullets: string[]) => void; }

export default function BulletGenerator({ role, company, existingBullets, skills, onAccept }: BulletGeneratorProps) {
  const { run, loading, error, clearError } = useAiAction();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [context, setContext] = useState('');
  const generate = () => { clearError(); run(() => aiBullets({ role, company, context, skills }), (result) => setSuggestions(result.bullets ?? [])); };
  const accept = (bullet: string) => { onAccept([...existingBullets.filter(Boolean), bullet]); setSuggestions((cur) => cur.filter((b) => b !== bullet)); };

  if (!role.trim()) return <p className="text-[11px] text-muted-foreground px-0.5">Add a position title first to generate bullet suggestions.</p>;

  return (
    <div className="space-y-1.5">
      <Textarea value={context} onChange={(e) => setContext(e.target.value)} placeholder="Optional: describe what you did..." className="text-[12px] min-h-[52px] bg-background/50 border-border/60 focus:border-accent/50 focus:ring-accent/20 transition-colors" />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5 border-accent/20 text-accent hover:bg-accent/5 hover:border-accent/30 transition-colors" onClick={generate} disabled={loading}>
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <span className="text-[9px]">✦</span>} Suggest bullets
        </Button>
        {error && <p className="text-[11px] text-destructive">{error}</p>}
      </div>
      <AiSuggestionList title="AI-generated bullets — review before accepting" items={suggestions} onAccept={accept} onDismiss={(b) => setSuggestions((cur) => cur.filter((x) => x !== b))} onDismissAll={() => setSuggestions([])} />
    </div>
  );
}
