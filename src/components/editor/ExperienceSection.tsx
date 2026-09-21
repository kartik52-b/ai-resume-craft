import { useResume } from '@/context/ResumeContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { type Experience, createEmptyExperience } from '@/types/resume';
import { moveItem } from '@/lib/sections';
import AiToolbar from '@/components/ai/AiToolbar';
import BulletGenerator from '@/components/ai/BulletGenerator';
import { Plus, Trash2, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';

const ExperienceSection = () => {
  const { resume, updateField } = useResume();
  const addExperience = () => updateField('experience', [...resume.experience, createEmptyExperience()]);
  const removeExperience = (id: string) => updateField('experience', resume.experience.filter(e => e.id !== id));
  const moveExperience = (idx: number, delta: -1 | 1) => updateField('experience', moveItem(resume.experience, idx, idx + delta));
  const updateExp = (id: string, field: keyof Experience, value: unknown) => updateField('experience', resume.experience.map(e => e.id === id ? { ...e, [field]: value } : e));
  const updateBullet = (expId: string, idx: number, value: string) => updateField('experience', resume.experience.map(e => e.id === expId ? { ...e, bullets: e.bullets.map((b, i) => i === idx ? value : b) } : e));
  const addBullet = (expId: string) => updateField('experience', resume.experience.map(e => e.id === expId ? { ...e, bullets: [...e.bullets, ''] } : e));
  const removeBullet = (expId: string, idx: number) => updateField('experience', resume.experience.map(e => e.id === expId ? { ...e, bullets: e.bullets.filter((_, i) => i !== idx) } : e));

  const INPUT = "h-9 text-[13px] bg-background/50 border-border/60 focus:border-accent/50 focus:ring-accent/20 transition-colors";

  return (
    <div className="space-y-3">
      {resume.experience.map((exp, idx) => (
        <div key={exp.id} data-entry-id={exp.id} className="p-3.5 bg-secondary/20 border border-border/40 rounded-xl space-y-3 group relative hover:border-border/60 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40" />
              <span className="text-[11px] font-medium text-muted-foreground">Role {idx + 1}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveExperience(idx, -1)} disabled={idx === 0} aria-label="Move up"><ChevronUp className="h-3 w-3" /></Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveExperience(idx, 1)} disabled={idx === resume.experience.length - 1} aria-label="Move down"><ChevronDown className="h-3 w-3" /></Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive transition-colors" onClick={() => removeExperience(exp.id)} aria-label="Delete experience"><Trash2 className="h-3 w-3" /></Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label className="text-[11px] font-medium text-muted-foreground">Position</Label><Input value={exp.position} onChange={e => updateExp(exp.id, 'position', e.target.value)} placeholder="Software Engineer" className={INPUT} /></div>
            <div className="space-y-1.5"><Label className="text-[11px] font-medium text-muted-foreground">Company</Label><Input value={exp.company} onChange={e => updateExp(exp.id, 'company', e.target.value)} placeholder="Google" className={INPUT} /></div>
            <div className="space-y-1.5"><Label className="text-[11px] font-medium text-muted-foreground">Location</Label><Input value={exp.location} onChange={e => updateExp(exp.id, 'location', e.target.value)} placeholder="Mountain View, CA" className={INPUT} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5"><Label className="text-[11px] font-medium text-muted-foreground">Start</Label><Input value={exp.startDate} onChange={e => updateExp(exp.id, 'startDate', e.target.value)} placeholder="Jan 2022" className={INPUT} /></div>
              <div className="space-y-1.5"><Label className="text-[11px] font-medium text-muted-foreground">End</Label><Input value={exp.endDate} onChange={e => updateExp(exp.id, 'endDate', e.target.value)} placeholder="Present" disabled={exp.current} className={INPUT} /></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={exp.current} onCheckedChange={v => updateExp(exp.id, 'current', v)} id={`current-${exp.id}`} />
            <Label htmlFor={`current-${exp.id}`} className="text-[11px] text-muted-foreground">Currently working here</Label>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-medium text-muted-foreground">Bullet Points</Label>
              <AiToolbar text={exp.bullets.filter(Boolean).join(' ')} onAccept={(text) => { const lines = text.split('\n').map((l) => l.trim()).filter(Boolean); updateExp(exp.id, 'bullets', lines.length ? lines : exp.bullets); }} />
            </div>
            {exp.bullets.map((bullet, idx) => (
              <div key={idx} className="flex gap-1.5">
                <span className="text-[10px] text-muted-foreground mt-3 font-medium">•</span>
                <Input value={bullet} onChange={e => updateBullet(exp.id, idx, e.target.value)} placeholder="Describe your achievement..." className={`${INPUT} flex-1`} />
                {exp.bullets.length > 1 && <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0 transition-colors" onClick={() => removeBullet(exp.id, idx)}><Trash2 className="h-3 w-3" /></Button>}
              </div>
            ))}
            <Button variant="ghost" size="sm" className="text-[11px] text-muted-foreground h-7 hover:text-foreground" onClick={() => addBullet(exp.id)}><Plus className="h-3 w-3 mr-1" /> Add bullet</Button>
            <BulletGenerator role={exp.position} company={exp.company} existingBullets={exp.bullets} skills={resume.skills} onAccept={(bullets) => updateExp(exp.id, 'bullets', bullets)} />
          </div>
        </div>
      ))}
      <button data-editor-focus-target="add-experience" onClick={addExperience} className="w-full py-3 border-2 border-dashed border-border/60 rounded-xl text-[13px] text-muted-foreground hover:border-accent/30 hover:text-accent/80 hover:bg-accent/[0.02] transition-all duration-150">+ Add Experience</button>
    </div>
  );
};

export default ExperienceSection;
