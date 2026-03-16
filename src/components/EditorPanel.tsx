import { useState } from 'react';
import { useResume } from '@/context/ResumeContext';
import { type TemplateType } from '@/types/resume';
import PersonalSection from './editor/PersonalSection';
import ExperienceSection from './editor/ExperienceSection';
import EducationSection from './editor/EducationSection';
import SkillsSection from './editor/SkillsSection';
import ProjectsSection from './editor/ProjectsSection';
import CertificationsSection from './editor/CertificationsSection';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight, User, Briefcase, GraduationCap, Wrench, FolderOpen, Award, LayoutTemplate } from 'lucide-react';
import { cn } from '@/lib/utils';

const sections = [
  { id: 'personal', title: 'Personal Information', icon: User, component: PersonalSection },
  { id: 'experience', title: 'Experience', icon: Briefcase, component: ExperienceSection },
  { id: 'education', title: 'Education', icon: GraduationCap, component: EducationSection },
  { id: 'skills', title: 'Skills', icon: Wrench, component: SkillsSection },
  { id: 'projects', title: 'Projects', icon: FolderOpen, component: ProjectsSection },
  { id: 'certifications', title: 'Certifications', icon: Award, component: CertificationsSection },
];

const templates: { id: TemplateType; label: string }[] = [
  { id: 'modern', label: 'Modern' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'professional', label: 'Professional' },
];

const EditorPanel = () => {
  const { resume, setTemplate } = useResume();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ personal: true });

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="h-full overflow-y-auto bg-card border-r border-border scrollbar-thin">
      <div className="px-6 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Resume Builder</h1>
          <p className="text-xs text-muted-foreground">Fill in your details. Changes appear in real time.</p>
        </div>

        {/* Template Selector */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <LayoutTemplate className="h-3.5 w-3.5" />
            Template
          </div>
          <div className="flex gap-1.5">
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id)}
                className={cn(
                  "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150",
                  resume.template === t.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-1">
          {sections.map(({ id, title, icon: Icon, component: Component }) => (
            <Collapsible key={id} open={openSections[id]} onOpenChange={() => toggleSection(id)}>
              <CollapsibleTrigger className="flex items-center gap-2 w-full px-2 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-md transition-colors group">
                <ChevronRight className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform duration-150", openSections[id] && "rotate-90")} />
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                {title}
              </CollapsibleTrigger>
              <CollapsibleContent className="px-2 pb-3 pt-1 animate-fade-in">
                <Component />
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditorPanel;
