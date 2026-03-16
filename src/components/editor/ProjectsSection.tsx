import { useResume } from '@/context/ResumeContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { createEmptyProject } from '@/types/resume';
import { Trash2 } from 'lucide-react';

const ProjectsSection = () => {
  const { resume, updateField } = useResume();

  const addProject = () => {
    updateField('projects', [...resume.projects, createEmptyProject()]);
  };

  const removeProject = (id: string) => {
    updateField('projects', resume.projects.filter(p => p.id !== id));
  };

  const updateProj = (id: string, field: string, value: string) => {
    updateField('projects', resume.projects.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  return (
    <div className="space-y-4">
      {resume.projects.map((proj) => (
        <div key={proj.id} className="p-3 bg-secondary/50 rounded-lg space-y-3">
          <div className="flex justify-end">
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeProject(proj.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Project Name</Label>
              <Input value={proj.name} onChange={e => updateProj(proj.id, 'name', e.target.value)} placeholder="My App" className="h-8 text-sm bg-card" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Link</Label>
              <Input value={proj.link} onChange={e => updateProj(proj.id, 'link', e.target.value)} placeholder="https://..." className="h-8 text-sm bg-card" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Technologies</Label>
            <Input value={proj.technologies} onChange={e => updateProj(proj.id, 'technologies', e.target.value)} placeholder="React, Node.js, PostgreSQL" className="h-8 text-sm bg-card" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Description</Label>
            <Textarea value={proj.description} onChange={e => updateProj(proj.id, 'description', e.target.value)} placeholder="Built a full-stack..." className="text-sm bg-card resize-none min-h-[60px]" />
          </div>
        </div>
      ))}
      <button onClick={addProject} className="w-full py-2.5 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-foreground/30 hover:text-foreground/60 transition-colors">
        + Add Project
      </button>
    </div>
  );
};

export default ProjectsSection;
