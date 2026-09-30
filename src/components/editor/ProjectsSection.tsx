import { useResume } from '@/context/ResumeContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { createEmptyProject } from '@/types/resume';
import { Trash2 } from 'lucide-react';

const INPUT = "h-9 text-[13px]";
const TEXTAREA = "min-h-[60px] resize-none text-[13px]";

const ProjectsSection = () => {
  const { resume, updateField } = useResume();
  const addProject = () => updateField('projects', [...resume.projects, createEmptyProject()]);
  const removeProject = (id: string) => updateField('projects', resume.projects.filter(p => p.id !== id));
  const updateProj = (id: string, field: string, value: string) => updateField('projects', resume.projects.map(p => p.id === id ? { ...p, [field]: value } : p));

  return (
    <div className="space-y-3">
      {resume.projects.map((proj) => (
        <div key={proj.id} data-entry-id={proj.id} className="group relative space-y-3 rounded-md border border-border bg-muted/30 p-3.5 transition-colors hover:border-foreground/20">
          <div className="flex justify-end"><Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive transition-colors" onClick={() => removeProject(proj.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label className="text-[11px] font-medium text-muted-foreground">Project Name</Label><Input value={proj.name} onChange={e => updateProj(proj.id, 'name', e.target.value)} placeholder="My App" className={INPUT} /></div>
            <div className="space-y-1.5"><Label className="text-[11px] font-medium text-muted-foreground">Link</Label><Input value={proj.link} onChange={e => updateProj(proj.id, 'link', e.target.value)} placeholder="https://..." className={INPUT} /></div>
          </div>
          <div className="space-y-1.5"><Label className="text-[11px] font-medium text-muted-foreground">Technologies</Label><Input value={proj.technologies} onChange={e => updateProj(proj.id, 'technologies', e.target.value)} placeholder="React, Node.js, PostgreSQL" className={INPUT} /></div>
          <div className="space-y-1.5"><Label className="text-[11px] font-medium text-muted-foreground">Description</Label><Textarea value={proj.description} onChange={e => updateProj(proj.id, 'description', e.target.value)} placeholder="Built a full-stack..." className={TEXTAREA} /></div>
        </div>
      ))}
      <button data-editor-focus-target="add-projects" onClick={addProject} className="w-full rounded-md border border-dashed border-border py-2.5 text-[12.5px] text-muted-foreground transition-colors duration-150 hover:border-foreground/30 hover:text-foreground">+ Add Project</button>
    </div>
  );
};

export default ProjectsSection;
