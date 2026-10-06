import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAiAction } from './useAiAction';
import AiErrorNotice from './AiErrorNotice';
import { aiBullets } from '@/lib/aiClient';
import AiSuggestionList from './AiSuggestionList';

interface BulletGeneratorProps { role: string; company: string; existingBullets: string[]; skills: string[]; onAccept: (bullets: string[]) => void; }

export default function BulletGenerator({ role, company, existingBullets, skills, onAccept }: BulletGeneratorProps) {
  const { run, loading, errorCode, clearError } = useAiAction();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [context, setContext] = useState('');
  const generate = () => { clearError(); run(() => aiBullets({ role, company, context, skills }), (result) => setSuggestions(result.bullets ?? [])); };
  const accept = (bullet: string) => { onAccept([...existingBullets.filter(Boolean), bullet]); setSuggestions((cur) => cur.filter((b) => b !== bullet)); };

  if (!role.trim()) return <p className="text-xs text-muted-foreground px-0.5">Add a position title first to generate bullet suggestions.</p>;

  return (
    <div className="space-y-1.5">
      <Textarea value={context} onChange={(e) => setContext(e.target.value)} placeholder="Optional: describe what you did..." className="text-xs min-h-[56px]" />
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" className="gap-1.5" onClick={generate} disabled={loading}>
          {loading && <Loader2 className="h-3 w-3 animate-spin" />}
          {loading ? 'Writing…' : 'Suggest bullets'}
        </Button>
      </div>
      <AiErrorNotice code={errorCode} />
      <AiSuggestionList title="Suggested bullets — review before adding" items={suggestions} onAccept={accept} onDismiss={(b) => setSuggestions((cur) => cur.filter((x) => x !== b))} onDismissAll={() => setSuggestions([])} />
    </div>
  );
}
