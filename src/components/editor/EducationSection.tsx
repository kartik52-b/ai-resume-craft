import { useState } from 'react';
import { useResume } from '@/context/ResumeContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createEmptyEducation } from '@/types/resume';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const INPUT = "h-9 text-[13px] bg-background/50 border-border/60 focus:border-accent/50 focus:ring-accent/20 transition-colors";
const REQUIRED_MESSAGE = 'Please enter your institution.';

const EducationSection = () => {
  const { resume, updateField } = useResume();
  // Errors are local to the form UI (keyed by entry id); data itself stays in
  // the resume store. An added entry without an institution is flagged inline.
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addEducation = () => updateField('education', [...resume.education, createEmptyEducation()]);
  const removeEducation = (id: string) => {
    updateField('education', resume.education.filter(e => e.id !== id));
    setErrors((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };
  const updateEdu = (id: string, field: string, value: string) => {
    updateField('education', resume.education.map(e => e.id === id ? { ...e, [field]: value } : e));
    if (field === 'school' && value.trim()) {
      setErrors((prev) => {
        if (!(id in prev)) return prev;
        const { [id]: _cleared, ...rest } = prev;
        return rest;
      });
    }
  };

  return (
    <div className="space-y-3">
      {resume.education.map((edu) => {
        const error = errors[edu.id];
        return (
          <div key={edu.id} data-entry-id={edu.id} className="p-3.5 bg-secondary/20 border border-border/40 rounded-xl space-y-3 group relative hover:border-border/60 transition-colors">
            <div className="flex justify-end">
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive transition-colors" onClick={() => removeEducation(edu.id)} aria-label="Delete education entry"><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label className="text-[11px] font-medium text-muted-foreground">
                  Institution <span className="text-destructive" aria-hidden>*</span>
                </Label>
                <Input
                  value={edu.school}
                  onChange={e => updateEdu(edu.id, 'school', e.target.value)}
                  onBlur={() => {
                    if (!edu.school.trim()) setErrors((prev) => ({ ...prev, [edu.id]: REQUIRED_MESSAGE }));
                  }}
                  placeholder="MIT"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? `${edu.id}-error` : undefined}
                  className={cn(INPUT, error && 'border-destructive/60 focus-visible:ring-destructive/30')}
                />
                {error && (
                  <p id={`${edu.id}-error`} className="flex items-start gap-1.5 text-[11px] text-destructive animate-fade-in" role="alert">
                    {error}
                  </p>
                )}
              </div>
              <div className="space-y-1.5"><Label className="text-[11px] font-medium text-muted-foreground">Degree</Label><Input value={edu.degree} onChange={e => updateEdu(edu.id, 'degree', e.target.value)} placeholder="B.S." className={INPUT} /></div>
              <div className="space-y-1.5"><Label className="text-[11px] font-medium text-muted-foreground">Field of Study</Label><Input value={edu.field} onChange={e => updateEdu(edu.id, 'field', e.target.value)} placeholder="Computer Science" className={INPUT} /></div>
              <div className="space-y-1.5"><Label className="text-[11px] font-medium text-muted-foreground">Start Date</Label><Input value={edu.startDate} onChange={e => updateEdu(edu.id, 'startDate', e.target.value)} placeholder="Sep 2018" className={INPUT} /></div>
              <div className="space-y-1.5"><Label className="text-[11px] font-medium text-muted-foreground">End Date</Label><Input value={edu.endDate} onChange={e => updateEdu(edu.id, 'endDate', e.target.value)} placeholder="Jun 2022" className={INPUT} /></div>
              <div className="space-y-1.5"><Label className="text-[11px] font-medium text-muted-foreground">GPA</Label><Input value={edu.gpa} onChange={e => updateEdu(edu.id, 'gpa', e.target.value)} placeholder="3.9/4.0" className={INPUT} /></div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-muted-foreground">
                Description <span className="text-[9px] font-normal text-muted-foreground/70">Optional</span>
              </Label>
              <Textarea
                rows={2}
                value={edu.description}
                onChange={e => updateEdu(edu.id, 'description', e.target.value)}
                placeholder="Honors, relevant coursework, activities…"
                className="min-h-[56px] text-[13px] bg-background/50 border-border/60 focus:border-accent/50 focus:ring-accent/20 transition-colors resize-y"
              />
            </div>
          </div>
        );
      })}
      <button
        data-editor-focus-target="add-education"
        onClick={addEducation}
        className="w-full py-3 border-2 border-dashed border-border/60 rounded-xl text-[13px] text-muted-foreground hover:border-accent/30 hover:text-accent/80 hover:bg-accent/[0.02] transition-all duration-150"
      >+ Add Education</button>
    </div>
  );
};

export default EducationSection;
