import { useResume } from '@/context/ResumeContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { createEmptyEducation } from '@/types/resume';
import { Trash2, Plus } from 'lucide-react';

const EducationSection = () => {
  const { resume, updateField } = useResume();

  const addEducation = () => {
    updateField('education', [...resume.education, createEmptyEducation()]);
  };

  const removeEducation = (id: string) => {
    updateField('education', resume.education.filter(e => e.id !== id));
  };

  const updateEdu = (id: string, field: string, value: string) => {
    updateField('education', resume.education.map(e =>
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  return (
    <div className="space-y-4">
      {resume.education.map((edu) => (
        <div key={edu.id} className="p-3 bg-secondary/50 rounded-lg space-y-3 group relative">
          <div className="flex justify-end">
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeEducation(edu.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">School</Label>
              <Input value={edu.school} onChange={e => updateEdu(edu.id, 'school', e.target.value)} placeholder="MIT" className="h-8 text-sm bg-card" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Degree</Label>
              <Input value={edu.degree} onChange={e => updateEdu(edu.id, 'degree', e.target.value)} placeholder="B.S." className="h-8 text-sm bg-card" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Field of Study</Label>
              <Input value={edu.field} onChange={e => updateEdu(edu.id, 'field', e.target.value)} placeholder="Computer Science" className="h-8 text-sm bg-card" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">GPA</Label>
              <Input value={edu.gpa} onChange={e => updateEdu(edu.id, 'gpa', e.target.value)} placeholder="3.9/4.0" className="h-8 text-sm bg-card" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Start Date</Label>
              <Input value={edu.startDate} onChange={e => updateEdu(edu.id, 'startDate', e.target.value)} placeholder="Sep 2018" className="h-8 text-sm bg-card" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">End Date</Label>
              <Input value={edu.endDate} onChange={e => updateEdu(edu.id, 'endDate', e.target.value)} placeholder="Jun 2022" className="h-8 text-sm bg-card" />
            </div>
          </div>
        </div>
      ))}
      <button onClick={addEducation} className="w-full py-2.5 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-foreground/30 hover:text-foreground/60 transition-colors">
        + Add Education
      </button>
    </div>
  );
};

export default EducationSection;
