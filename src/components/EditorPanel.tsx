import { useState, useCallback, useRef, useEffect } from 'react';
import { useResume } from '@/context/ResumeContext';
import { type SectionId } from '@/types/resume';
import { resolveSectionOrder, isSectionHidden, reorderSections, nudgeSection, toggleSectionHidden, sectionMeta } from '@/lib/sections';
import { validateResume, sectionCompleteness, type ValidationIssue } from '@/lib/resumeValidation';
import PersonalSection from './editor/PersonalSection';
import ExperienceSection from './editor/ExperienceSection';
import EducationSection from './editor/EducationSection';
import SkillsSection from './editor/SkillsSection';
import ProjectsSection from './editor/ProjectsSection';
import CertificationsSection from './editor/CertificationsSection';
import { ImportDialog } from './ImportDialog';
import Carousel from './Carousel';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import {
  ChevronRight, ChevronUp, ChevronDown, Eye, EyeOff, User, Briefcase, GraduationCap,
  Wrench, FolderOpen, Award, CheckCircle2, Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SECTION_COMPONENTS: Record<SectionId, () => JSX.Element> = {
  personal: PersonalSection,
  experience: ExperienceSection,
  education: EducationSection,
  skills: SkillsSection,
  projects: ProjectsSection,
  certifications: CertificationsSection,
};

const SECTION_ICONS: Record<SectionId, typeof User> = {
  personal: User,
  experience: Briefcase,
  education: GraduationCap,
  skills: Wrench,
  projects: FolderOpen,
  certifications: Award,
};

export const FOCUS_TARGET_ATTR = 'data-editor-focus-target';

/** Compact rotating tips banner shown at the top of the editor — purely informational, never touches the form. */
const EDITOR_TIPS = [
  { title: 'Tailor your summary', text: 'Mirror keywords from the job posting.' },
  { title: 'Quantify results', text: 'Numbers make experience credible.' },
  { title: 'Use strong action verbs', text: 'Led, built, launched — not “responsible for”.' },
  { title: 'Stay consistent', text: 'Same date format and tense across sections.' },
];

interface EditorPanelProps {
  /** External section to scroll to (from SectionNav click) */
  scrollToSection?: SectionId | null;
  onScrollComplete?: () => void;
}

const EditorPanel = ({ scrollToSection, onScrollComplete }: EditorPanelProps) => {
  const { resume, setResume } = useResume();
  // Only one section open at a time (accordion)
  const [openSection, setOpenSection] = useState<SectionId | null>('personal');
  const [dragFrom, setDragFrom] = useState<SectionId | null>(null);
  const [dragOver, setDragOver] = useState<SectionId | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const order = resolveSectionOrder(resume);
  const issues = validateResume(resume);

  const toggleSection = (id: SectionId) => {
    setOpenSection(prev => prev === id ? null : id);
  };

  const handleDrop = (target: SectionId) => {
    if (dragFrom && dragFrom !== target) setResume(prev => reorderSections(prev, dragFrom, target));
    setDragFrom(null);
    setDragOver(null);
  };

  /** Scroll to and open a section */
  const scrollTo = useCallback((sectionId: SectionId) => {
    // Unhide if hidden
    if (isSectionHidden(resume, sectionId)) {
      setResume(prev => toggleSectionHidden(prev, sectionId));
    }
    // Open the section (accordion — close others)
    setOpenSection(sectionId);
    // Scroll to it
    window.setTimeout(() => {
      const el = sectionRefs.current[sectionId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      onScrollComplete?.();
    }, 100);
  }, [resume, setResume, onScrollComplete]);

  /** Handle external scroll request from SectionNav */
  useEffect(() => {
    if (scrollToSection) scrollTo(scrollToSection);
  }, [scrollToSection, scrollTo]);

  /** Navigate to a specific field for validation fix */
  const navigateToField = useCallback((sectionId: SectionId, field?: string) => {
    if (isSectionHidden(resume, sectionId)) {
      setResume(prev => toggleSectionHidden(prev, sectionId));
    }
    setOpenSection(sectionId);
    window.setTimeout(() => {
      const root = panelRef.current;
      if (!root) return;
      let el: HTMLElement | null = null;
      if (field) {
        el = root.querySelector<HTMLElement>(`[data-editor-section="${sectionId}"] [${FOCUS_TARGET_ATTR}="${field}"]`);
        if (!el) {
          el = root.querySelector<HTMLElement>(`[data-editor-section="${sectionId}"] [data-entry-id="${field}"] input, [data-editor-section="${sectionId}"] [data-entry-id="${field}"] textarea`);
        }
      }
      if (!el) {
        el = root.querySelector<HTMLElement>(`[data-editor-section="${sectionId}"] input, [data-editor-section="${sectionId}"] textarea`);
      }
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus({ preventScroll: true });
      }
    }, 240);
  }, [resume, setResume]);

  /* Onboarding essentials */
  const essentials = [
    { done: !!resume.personal.fullName.trim(), label: 'Add your name', target: { section: 'personal' as SectionId, field: 'fullName' } },
    { done: !!(resume.personal.email.trim() || resume.personal.phone.trim()), label: 'Add email or phone', target: { section: 'personal' as SectionId, field: 'email' } },
    { done: resume.skills.length > 0, label: 'Add skills', target: { section: 'skills' as SectionId, field: 'skills-input' } },
    { done: resume.experience.length > 0 || resume.projects.length > 0, label: 'Add experience or projects', target: { section: 'experience' as SectionId, field: 'add-experience' } },
  ];
  const remainingEssentials = essentials.filter(e => !e.done);
  const showOnboarding = remainingEssentials.length > 0;

  return (
    <div ref={panelRef} className="h-full overflow-y-auto scrollbar-thin bg-card flex flex-col">
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />

      {/* Compact tips banner — sits above the form without disturbing it */}
      <div className="px-4 pt-4">
        <Carousel
          compact
          autoplayMs={7000}
          ariaLabel="Resume writing tips"
          slideLabels={EDITOR_TIPS.map((t) => t.title)}
          slides={EDITOR_TIPS.map((tip) => (
            <div key={tip.title} className="flex items-center gap-2 px-3.5 py-2 min-w-0">
              <Lightbulb className="h-3.5 w-3.5 text-accent shrink-0" />
              <span className="text-[11.5px] font-semibold text-foreground shrink-0">{tip.title}</span>
              <span className="text-[11.5px] text-muted-foreground truncate">{tip.text}</span>
            </div>
          ))}
        />
      </div>

      {/* Onboarding — compact */}
      {showOnboarding && (
        <div className="px-4 pt-4 pb-2">
          <div className="rounded-lg border border-accent/15 bg-accent/[0.03] p-3">
            <div className="text-[12px] font-semibold text-foreground mb-2">Let's build your resume</div>
            <div className="flex flex-wrap gap-1.5">
              {essentials.map((step, i) => (
                <button
                  key={step.label}
                  onClick={() => navigateToField(step.target.section, step.target.field)}
                  disabled={step.done}
                  className={cn('flex items-center gap-1.5 text-[11px] rounded-full px-2.5 py-1 transition-colors',
                    step.done ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground')}
                >
                  {step.done ? <CheckCircle2 className="h-3 w-3" /> : <span className="text-[9px] font-bold">{i + 1}</span>}
                  {step.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sections — accordion (only one open at a time) */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3 space-y-0.5">
        {order.map((id, idx) => {
          const meta = sectionMeta(id);
          const Icon = SECTION_ICONS[id];
          const Component = SECTION_COMPONENTS[id];
          const hidden = isSectionHidden(resume, id);
          const completeness = sectionCompleteness(resume, id);
          const errors = issues.filter(i => i.section === id && i.severity === 'error');
          const isOpen = openSection === id && !hidden;

          return (
            <div
              key={id}
              ref={(el) => { sectionRefs.current[id] = el; }}
              draggable
              onDragStart={() => setDragFrom(id)}
              onDragOver={(e) => { e.preventDefault(); setDragOver(id); }}
              onDragLeave={() => setDragOver((cur) => (cur === id ? null : cur))}
              onDrop={() => handleDrop(id)}
              onDragEnd={() => { setDragFrom(null); setDragOver(null); }}
              className={cn('rounded-lg transition-all duration-150',
                dragOver === id && dragFrom !== id && 'ring-2 ring-accent/30',
                dragFrom === id && 'opacity-40')}
            >
              <Collapsible open={isOpen} onOpenChange={() => toggleSection(id)}>
                <div className="flex items-center gap-0.5 pr-1">
                  <CollapsibleTrigger className={cn(
                    'flex items-center gap-2 flex-1 min-w-0 px-2.5 py-2 text-[12px] font-medium rounded-lg transition-all duration-150 cursor-grab active:cursor-grabbing',
                    isOpen ? 'text-foreground bg-muted/40' : 'text-foreground hover:bg-muted/20')}>
                    <ChevronRight className={cn('h-3 w-3 text-muted-foreground transition-transform duration-150 shrink-0', isOpen && 'rotate-90')} />
                    <Icon className={cn('h-3.5 w-3.5 shrink-0', isOpen ? 'text-accent' : 'text-muted-foreground/60')} />
                    <span className={cn('truncate', hidden && 'line-through text-muted-foreground')}>{meta.title}</span>
                    {errors.length > 0 && !hidden && (
                      <span className="h-4 w-4 rounded-full bg-red-500/10 text-red-500 text-[9px] font-bold flex items-center justify-center shrink-0">{errors.length}</span>
                    )}
                    {completeness === 100 && !hidden && <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0 ml-1" />}
                  </CollapsibleTrigger>
                  <div className="flex items-center shrink-0">
                    <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 focus-within:opacity-100" onClick={() => setResume(prev => nudgeSection(prev, id, -1))} disabled={idx === 0} aria-label={`Move ${meta.title} up`}>
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 focus-within:opacity-100" onClick={() => setResume(prev => nudgeSection(prev, id, 1))} disabled={idx === order.length - 1} aria-label={`Move ${meta.title} down`}>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 focus-within:opacity-100" onClick={() => setResume(prev => toggleSectionHidden(prev, id))} aria-label={hidden ? `Show ${meta.title}` : `Hide ${meta.title}`}>
                      {hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
                <CollapsibleContent className="px-2 pb-3 pt-1 animate-fade-in">
                  <div data-editor-section={id}>
                    {hidden ? (
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground px-3 py-2.5 rounded-lg border border-dashed border-border/60 bg-muted/20">
                        <EyeOff className="h-3 w-3 shrink-0" />
                        <span>Hidden from resume. Click eye to show.</span>
                      </div>
                    ) : (
                      <>
                        {completeness === 0 && <div className="text-[11px] text-muted-foreground px-3 py-2 mb-2 rounded-lg border border-dashed border-border/60 bg-muted/20 text-center">{meta.emptyHint}</div>}
                        <Component />
                      </>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EditorPanel;
