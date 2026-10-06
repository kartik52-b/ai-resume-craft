import { useState } from 'react';
import { useResume } from '@/context/ResumeContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SkillsSuggester from '@/components/ai/SkillsSuggester';
import { X, Plus } from 'lucide-react';

const SkillsSection = () => {
  const { resume, updateField } = useResume();
  const [input, setInput] = useState('');
  const addSkill = () => { const trimmed = input.trim(); if (trimmed && !resume.skills.includes(trimmed)) { updateField('skills', [...resume.skills, trimmed]); setInput(''); } };
  const removeSkill = (skill: string) => updateField('skills', resume.skills.filter(s => s !== skill));
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input data-editor-focus-target="skills-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a skill and press Enter"
          className="h-9 flex-1 text-sm" />
        <Button variant="secondary" size="sm" onClick={addSkill} className="h-9 text-xs px-3"><Plus className="h-3 w-3 mr-1" /> Add</Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {resume.skills.map(skill => (
          <Badge key={skill} variant="secondary" className="text-xs py-0.5 px-2.5 gap-1.5 bg-secondary/80 hover:bg-secondary transition-colors">
            {skill}
            <Button
              variant="ghost"
              size="icon-sm"
              className="opacity-40 hover:opacity-100 transition-opacity ml-0.5"
              onClick={() => removeSkill(skill)}
              aria-label="Remove skill"
            >
              <X />
            </Button>
          </Badge>
        ))}
        {resume.skills.length === 0 && <p className="text-xs text-muted-foreground py-2">No skills added yet. Add 6–10 relevant skills.</p>}
      </div>
      <SkillsSuggester role={resume.personal.fullName ? resume.experience[0]?.position ?? '' : ''}
        experienceContext={resume.experience.map((e) => [e.position, e.company].filter(Boolean).join(' at ')).join('; ')}
        existingSkills={resume.skills} onAddSkills={(newSkills) => updateField('skills', [...resume.skills, ...newSkills.filter((s) => !resume.skills.includes(s))])} />
    </div>
  );
};

export default SkillsSection;
