import { useResume } from '@/context/ResumeContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { createEmptyProject } from '@/types/resume';
import { Trash2 } from 'lucide-react';

const INPUT = "h-9 text-[13px] bg-background/50 border-border/60 focus:border-accent/50 focus:ring-accent/20 transition-colors";
const TEXTAREA = "text-[13px] bg-background/50 border-border/60 resize-none min-h-[60px] focus:border-accent/50 focus:ring-accent/20 transition-colors";

const ProjectsSection = () => {
  const { resume, updateField } = useResume();
  const addProject = () => updateField('projects', [...resume.projects, createEmptyProject()]);
  const removeProject = (id: string) => updateField('projects', resume.projects.filter(p => p.id !== id));
  const updateProj = (id: string, field: string, value: string) => updateField('projects', resume.projects.map(p => p.id === id ? { ...p, [field]: value } : p));

  return (
    <div className="space-y-3">
      {resume.projects.map((proj) => (
        <div key={proj.id} data-entry-id={proj.id} className="p-3.5 bg-secondary/20 border border-border/40 rounded-xl space-y-3 group relative hover:border-border/60 transition-colors">
          <div className="flex justify-end"><Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive transition-colors" onClick={() => removeProject(proj.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label className="text-[11px] font-medium text-muted-foreground">Project Name</Label><Input value={proj.name} onChange={e => updateProj(proj.id, 'name', e.target.value)} placeholder="My App" className={INPUT} /></div>
            <div className="space-y-1.5"><Label className="text-[11px] font-medium text-muted-foreground">Link</Label><Input value={proj.link} onChange={e => updateProj(proj.id, 'link', e.target.value)} placeholder="https://..." className={INPUT} /></div>
          </div>
          <div className="space-y-1.5"><Label className="text-[11px] font-medium text-muted-foreground">Technologies</Label><Input value={proj.technologies} onChange={e => updateProj(proj.id, 'technologies', e.target.value)} placeholder="React, Node.js, PostgreSQL" className={INPUT} /></div>
          <div className="space-y-1.5"><Label className="text-[11px] font-medium text-muted-foreground">Description</Label><Textarea value={proj.description} onChange={e => updateProj(proj.id, 'description', e.target.value)} placeholder="Built a full-stack..." className={TEXTAREA} /></div>
        </div>
      ))}
      <button data-editor-focus-target="add-projects" onClick={addProject} className="w-full py-3 border-2 border-dashed border-border/60 rounded-xl text-[13px] text-muted-foreground hover:border-accent/30 hover:text-accent/80 hover:bg-accent/[0.02] transition-all duration-150">+ Add Project</button>
    </div>
  );
};

export default ProjectsSection;
