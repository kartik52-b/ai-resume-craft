import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAiAction } from './useAiAction';
import { aiSkills } from '@/lib/aiClient';
import AiSuggestionList from './AiSuggestionList';

interface SkillsSuggesterProps { role: string; experienceContext: string; existingSkills: string[]; onAddSkills: (skills: string[]) => void; }

export default function SkillsSuggester({ role, experienceContext, existingSkills, onAddSkills }: SkillsSuggesterProps) {
  const { run, loading, error, clearError } = useAiAction();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const generate = () => { clearError(); run(() => aiSkills({ role: role || 'professional', context: experienceContext }), (result) => setSuggestions((result.skills ?? []).filter((s) => !existingSkills.some((e) => e.toLowerCase() === s.toLowerCase())))); };
  const add = (skill: string) => { onAddSkills([skill]); setSuggestions((cur) => cur.filter((s) => s !== skill)); };

  return (
    <div className="space-y-1.5">
      <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5 border-accent/20 text-accent hover:bg-accent/5 hover:border-accent/30 transition-colors" onClick={generate} disabled={loading}>
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <span className="text-[9px]">✦</span>} Suggest skills with AI
      </Button>
      {error && <p className="text-[11px] text-destructive">{error}</p>}
      <AiSuggestionList title="AI-generated skill ideas — review before adding" items={suggestions} onAccept={add} onDismiss={(s) => setSuggestions((cur) => cur.filter((x) => x !== s))} onDismissAll={() => setSuggestions([])} />
    </div>
  );
}
