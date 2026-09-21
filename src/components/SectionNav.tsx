import { useResume } from '@/context/ResumeContext';
import { type SectionId } from '@/types/resume';
import { resolveSectionOrder, isSectionHidden, sectionMeta } from '@/lib/sections';
import { sectionCompleteness } from '@/lib/resumeValidation';
import { cn } from '@/lib/utils';
import {
  User, Briefcase, GraduationCap, Wrench, FolderOpen, Award,
  EyeOff, CheckCircle2,
} from 'lucide-react';

const SECTION_ICONS: Record<SectionId, typeof User> = {
  personal: User,
  experience: Briefcase,
  education: GraduationCap,
  skills: Wrench,
  projects: FolderOpen,
  certifications: Award,
};

interface SectionNavProps {
  activeSection: SectionId | null;
  onSectionClick: (sectionId: SectionId) => void;
}

export default function SectionNav({ activeSection, onSectionClick }: SectionNavProps) {
  const { resume } = useResume();
  const order = resolveSectionOrder(resume);

  return (
    <div className="h-full overflow-y-auto scrollbar-thin bg-card border-r border-border/60 flex flex-col">
      {/* Section list */}
      <div className="flex-1 px-3 py-4">
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">Resume</div>
        <div className="space-y-0.5">
          {order.map((id) => {
            const meta = sectionMeta(id);
            const Icon = SECTION_ICONS[id];
            const hidden = isSectionHidden(resume, id);
            const completeness = sectionCompleteness(resume, id);
            const isActive = activeSection === id;

            return (
              <button
                key={id}
                onClick={() => onSectionClick(id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-150',
                  isActive ? 'bg-accent/10 text-foreground shadow-sm shadow-accent/5' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30',
                )}
              >
                <Icon className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-accent' : 'text-muted-foreground/60')} />
                <span className="flex-1 text-[12px] font-medium truncate">{meta.title}</span>
                {hidden ? (
                  <EyeOff className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                ) : completeness === 100 ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                ) : (
                  <span className="text-[10px] text-muted-foreground/60 tabular-nums shrink-0">{completeness}%</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
