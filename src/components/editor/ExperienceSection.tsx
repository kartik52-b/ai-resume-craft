import { useResume } from '@/context/ResumeContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { type Experience, createEmptyExperience } from '@/types/resume';
import { Plus, Trash2, GripVertical } from 'lucide-react';

const ExperienceSection = () => {
  const { resume, updateField } = useResume();

  const addExperience = () => {
    updateField('experience', [...resume.experience, createEmptyExperience()]);
  };

  const removeExperience = (id: string) => {
    updateField('experience', resume.experience.filter(e => e.id !== id));
  };

  const updateExp = (id: string, field: keyof Experience, value: unknown) => {
    updateField('experience', resume.experience.map(e =>
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const updateBullet = (expId: string, idx: number, value: string) => {
    updateField('experience', resume.experience.map(e =>
      e.id === expId ? { ...e, bullets: e.bullets.map((b, i) => i === idx ? value : b) } : e
    ));
  };

  const addBullet = (expId: string) => {
    updateField('experience', resume.experience.map(e =>
      e.id === expId ? { ...e, bullets: [...e.bullets, ''] } : e
    ));
  };

  const removeBullet = (expId: string, idx: number) => {
    updateField('experience', resume.experience.map(e =>
      e.id === expId ? { ...e, bullets: e.bullets.filter((_, i) => i !== idx) } : e
    ));
  };

  return (
    <div className="space-y-4">
      {resume.experience.map((exp) => (
        <div key={exp.id} className="p-3 bg-secondary/50 rounded-lg space-y-3 group relative">
          <div className="flex items-start justify-between">
            <GripVertical className="h-4 w-4 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={() => removeExperience(exp.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Position</Label>
              <Input value={exp.position} onChange={e => updateExp(exp.id, 'position', e.target.value)} placeholder="Software Engineer" className="h-8 text-sm bg-card" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Company</Label>
              <Input value={exp.company} onChange={e => updateExp(exp.id, 'company', e.target.value)} placeholder="Google" className="h-8 text-sm bg-card" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Location</Label>
              <Input value={exp.location} onChange={e => updateExp(exp.id, 'location', e.target.value)} placeholder="Mountain View, CA" className="h-8 text-sm bg-card" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Start</Label>
                <Input value={exp.startDate} onChange={e => updateExp(exp.id, 'startDate', e.target.value)} placeholder="Jan 2022" className="h-8 text-sm bg-card" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">End</Label>
                <Input value={exp.endDate} onChange={e => updateExp(exp.id, 'endDate', e.target.value)} placeholder="Present" disabled={exp.current} className="h-8 text-sm bg-card" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={exp.current} onCheckedChange={v => updateExp(exp.id, 'current', v)} id={`current-${exp.id}`} />
            <Label htmlFor={`current-${exp.id}`} className="text-xs text-muted-foreground">Currently working here</Label>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Bullet Points</Label>
            {exp.bullets.map((bullet, idx) => (
              <div key={idx} className="flex gap-1.5">
                <span className="text-xs text-muted-foreground mt-2.5">•</span>
                <Input value={bullet} onChange={e => updateBullet(exp.id, idx, e.target.value)} placeholder="Describe your achievement..." className="h-8 text-sm bg-card flex-1" />
                {exp.bullets.length > 1 && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" onClick={() => removeBullet(exp.id, idx)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7" onClick={() => addBullet(exp.id)}>
              <Plus className="h-3 w-3 mr-1" /> Add bullet
            </Button>
          </div>
        </div>
      ))}
      <button
        onClick={addExperience}
        className="w-full py-2.5 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-foreground/30 hover:text-foreground/60 transition-colors"
      >
        + Add Experience
      </button>
    </div>
  );
};

export default ExperienceSection;
