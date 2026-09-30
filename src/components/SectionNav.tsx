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
    <div className="flex h-full flex-col overflow-y-auto border-r border-border bg-card scrollbar-thin">
      {/* Section list */}
      <div className="flex-1 px-3 py-4 animate-fade-up">
        <div className="nav-group-label px-2 mb-2">Resume</div>
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
                  'relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors duration-150',
                  // The selected section is the one place a soft bronze wash is
                  // allowed in the editor chrome — quiet, but unmistakable.
                  isActive
                    ? 'bg-bronze-soft text-foreground'
                    : 'text-muted-foreground hover:bg-foreground/[0.035] hover:text-foreground',
                )}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-full bg-bronze"
                  />
                )}
                <Icon className={cn('h-3.5 w-3.5 shrink-0 transition-colors', isActive ? 'text-bronze' : 'text-muted-foreground/60')} />
                <span className="flex-1 text-[12px] font-medium truncate">{meta.title}</span>
                {hidden ? (
                  <EyeOff className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                ) : completeness === 100 ? (
                  <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
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
