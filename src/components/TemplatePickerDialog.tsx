import { useState, useMemo } from 'react';
import { useResume } from '@/context/ResumeContext';
import { TEMPLATE_REGISTRY, type TemplateDefinition, type TemplateCategory } from '@/lib/templateRegistry';
import { getSampleResume } from '@/lib/sampleResume';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type FilterType = 'all' | 'ats' | TemplateCategory;
const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'ats', label: 'ATS Friendly' },
  { value: 'professional', label: 'Professional' },
  { value: 'tech', label: 'Tech' },
  { value: 'creative', label: 'Creative' },
  { value: 'academic', label: 'Academic' },
  { value: 'student', label: 'Student' },
];

function matchesFilter(t: TemplateDefinition, filter: FilterType): boolean {
  if (filter === 'all') return true;
  if (filter === 'ats') return t.atsSafe;
  return t.category === filter;
}

function MiniThumbnail({ template, sample }: { template: TemplateDefinition; sample: ReturnType<typeof getSampleResume> }) {
  return (
    <div className="w-full aspect-[210/297] bg-white overflow-hidden pointer-events-none select-none"
      style={{ width: '286%', height: '286%', position: 'absolute', top: 0, left: 0, transform: 'scale(0.35)', transformOrigin: 'top left' }}>
      <template.Component data={{ ...sample, template: template.id }} />
    </div>
  );
}

interface TemplatePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TemplatePickerDialog({ open, onOpenChange }: TemplatePickerDialogProps) {
  const { resume, setTemplate } = useResume();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const sample = useMemo(() => getSampleResume(), []);

  const filtered = TEMPLATE_REGISTRY.filter((t) => {
    if (!matchesFilter(t, activeFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return t.label.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSelect = (id: string, label: string) => {
    setTemplate(id as never);
    onOpenChange(false);
    toast.success(`${label} template applied`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border/60">
          <DialogTitle className="text-[15px]">Change Template</DialogTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search templates..." className="h-9 pl-9 text-[13px]" />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin mt-2 pb-1">
            {FILTERS.map((f) => (
              <button key={f.value} onClick={() => setActiveFilter(f.value)}
                className={cn("px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all duration-150",
                  activeFilter === f.value ? "bg-accent text-accent-foreground shadow-sm" : "bg-secondary text-secondary-foreground hover:bg-secondary/80")}>
                {f.label}
              </button>
            ))}
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map((t) => {
              const isCurrent = resume.template === t.id;
              return (
                <div key={t.id} className={cn("group relative rounded-lg border bg-card overflow-hidden transition-all duration-150 cursor-pointer",
                  isCurrent ? "border-accent/50 ring-1 ring-accent/20" : "border-border/60 hover:border-border hover:shadow-sm")}
                  onClick={() => !isCurrent && handleSelect(t.id, t.label)}>
                  <div className="relative h-36 bg-muted/20 overflow-hidden flex items-start justify-center pt-3">
                    <div className="relative w-[90px] h-[127px] shadow-sm rounded-sm overflow-hidden border border-border/20 transition-transform duration-150 group-hover:scale-[1.03]">
                      <MiniThumbnail template={t} sample={sample} />
                    </div>
                    {isCurrent && <span className="absolute top-1.5 right-1.5 flex items-center gap-0.5 text-[9px] font-semibold text-accent bg-accent/10 px-1.5 py-0.5 rounded-full"><CheckCircle2 className="h-2.5 w-2.5" /> Active</span>}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="text-[12px] font-semibold truncate">{t.label}</h3>
                      {t.atsSafe ? <Badge variant="outline" className="text-[8px] border-emerald-500/30 text-emerald-500 shrink-0">ATS</Badge> : <Badge variant="outline" className="text-[8px] border-amber-500/30 text-amber-500 shrink-0">Visual</Badge>}
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">{t.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[13px] text-muted-foreground">No templates found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
