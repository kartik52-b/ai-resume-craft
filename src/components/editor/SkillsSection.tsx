import { useState } from 'react';
import { useResume } from '@/context/ResumeContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

const SkillsSection = () => {
  const { resume, updateField } = useResume();
  const [input, setInput] = useState('');

  const addSkill = () => {
    const trimmed = input.trim();
    if (trimmed && !resume.skills.includes(trimmed)) {
      updateField('skills', [...resume.skills, trimmed]);
      setInput('');
    }
  };

  const removeSkill = (skill: string) => {
    updateField('skills', resume.skills.filter(s => s !== skill));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a skill and press Enter"
          className="h-8 text-sm bg-card flex-1"
        />
        <Button variant="secondary" size="sm" onClick={addSkill} className="h-8 text-xs">
          <Plus className="h-3 w-3 mr-1" /> Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {resume.skills.map(skill => (
          <Badge key={skill} variant="secondary" className="text-xs py-0.5 px-2 gap-1 group">
            {skill}
            <button onClick={() => removeSkill(skill)} className="opacity-50 hover:opacity-100">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default SkillsSection;
