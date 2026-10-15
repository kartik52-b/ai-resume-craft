import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAiAction } from './useAiAction';
import AiErrorNotice from './AiErrorNotice';
import AiRequestNotice from './AiRequestNotice';
import { aiSkills } from '@/lib/aiClient';
import AiSuggestionList from './AiSuggestionList';

interface SkillsSuggesterProps { role: string; experienceContext: string; existingSkills: string[]; onAddSkills: (skills: string[]) => void; }

export default function SkillsSuggester({ role, experienceContext, existingSkills, onAddSkills }: SkillsSuggesterProps) {
  const { run, loading, errorCode, clearError } = useAiAction();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const generate = () => { if (!role.trim()) return; clearError(); run(() => aiSkills({ role, context: experienceContext }), (result) => setSuggestions((result.skills ?? []).filter((s) => !existingSkills.some((e) => e.toLowerCase() === s.toLowerCase())))); };
  const add = (skill: string) => { onAddSkills([skill]); setSuggestions((cur) => cur.filter((s) => s !== skill)); };

  if (!role.trim()) return <p className="text-xs text-muted-foreground">Add a professional headline or experience position first to get role-specific skill ideas.</p>;

  return (
    <div className="space-y-1.5">
      <AiRequestNotice>Sends the role and experience titles/companies. Add only skills you actually have.</AiRequestNotice>
      <Button variant="secondary" size="sm" className="gap-1.5" onClick={generate} disabled={loading}>
        {loading && <Loader2 className="h-3 w-3 animate-spin" />}
        {loading ? 'Thinking…' : 'Suggest skills'}
      </Button>
      <AiErrorNotice code={errorCode} />
      <AiSuggestionList title="Suggested skills — review before adding" items={suggestions} onAccept={add} onDismiss={(s) => setSuggestions((cur) => cur.filter((x) => x !== s))} onDismissAll={() => setSuggestions([])} />
    </div>
  );
}
