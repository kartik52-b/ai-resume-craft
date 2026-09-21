import { useResume } from '@/context/ResumeContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { createEmptyEducation } from '@/types/resume';
import { Trash2, Plus } from 'lucide-react';

const INPUT = "h-9 text-[13px] bg-background/50 border-border/60 focus:border-accent/50 focus:ring-accent/20 transition-colors";

const EducationSection = () => {
  const { resume, updateField } = useResume();
  const addEducation = () => updateField('education', [...resume.education, createEmptyEducation()]);
  const removeEducation = (id: string) => updateField('education', resume.education.filter(e => e.id !== id));
  const updateEdu = (id: string, field: string, value: string) => updateField('education', resume.education.map(e => e.id === id ? { ...e, [field]: value } : e));

  return (
    <div className="space-y-3">
      {resume.education.map((edu) => (
        <div key={edu.id} data-entry-id={edu.id} className="p-3.5 bg-secondary/20 border border-border/40 rounded-xl space-y-3 group relative hover:border-border/60 transition-colors">
          <div className="flex justify-end">
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive transition-colors" onClick={() => removeEducation(edu.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label className="text-[11px] font-medium text-muted-foreground">School</Label><Input value={edu.school} onChange={e => updateEdu(edu.id, 'school', e.target.value)} placeholder="MIT" className={INPUT} /></div>
            <div className="space-y-1.5"><Label className="text-[11px] font-medium text-muted-foreground">Degree</Label><Input value={edu.degree} onChange={e => updateEdu(edu.id, 'degree', e.target.value)} placeholder="B.S." className={INPUT} /></div>
            <div className="space-y-1.5"><Label className="text-[11px] font-medium text-muted-foreground">Field of Study</Label><Input value={edu.field} onChange={e => updateEdu(edu.id, 'field', e.target.value)} placeholder="Computer Science" className={INPUT} /></div>
            <div className="space-y-1.5"><Label className="text-[11px] font-medium text-muted-foreground">GPA</Label><Input value={edu.gpa} onChange={e => updateEdu(edu.id, 'gpa', e.target.value)} placeholder="3.9/4.0" className={INPUT} /></div>
            <div className="space-y-1.5"><Label className="text-[11px] font-medium text-muted-foreground">Start Date</Label><Input value={edu.startDate} onChange={e => updateEdu(edu.id, 'startDate', e.target.value)} placeholder="Sep 2018" className={INPUT} /></div>
            <div className="space-y-1.5"><Label className="text-[11px] font-medium text-muted-foreground">End Date</Label><Input value={edu.endDate} onChange={e => updateEdu(edu.id, 'endDate', e.target.value)} placeholder="Jun 2022" className={INPUT} /></div>
          </div>
        </div>
      ))}
      <button onClick={addEducation} className="w-full py-3 border-2 border-dashed border-border/60 rounded-xl text-[13px] text-muted-foreground hover:border-accent/30 hover:text-accent/80 hover:bg-accent/[0.02] transition-all duration-150">+ Add Education</button>
    </div>
  );
};

export default EducationSection;
