import { useState, useMemo } from 'react';
import { useResume } from '@/context/ResumeContext';
import { TEMPLATE_REGISTRY, ALL_CATEGORIES, type TemplateDefinition, type TemplateCategory } from '@/lib/templateRegistry';
import { getSampleResume } from '@/lib/sampleResume';
import ResumeThumbnail from '@/components/ResumeThumbnail';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type FilterType = 'all' | TemplateCategory;
const FILTERS = ALL_CATEGORIES as { value: FilterType; label: string }[];

function matchesFilter(t: TemplateDefinition, filter: FilterType): boolean {
  if (filter === 'all') return true;
  return t.category === filter;
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
        <DialogHeader className="border-b border-border px-5 pb-3 pt-5">
          <DialogTitle className="text-base">Change template</DialogTitle>
          <p className="text-xs text-muted-foreground">Your resume content stays exactly the same — only the design changes.</p>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-2" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search templates..." className="h-9 pl-9 text-sm" />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin mt-2 pb-1">
            {FILTERS.map((f) => (
              <button key={f.value} onClick={() => setActiveFilter(f.value)}
                className={cn("px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150",
                  activeFilter === f.value ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground")}>
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
                  isCurrent ? "border-bronze" : "border-border hover:border-foreground/30")}
                  onClick={() => !isCurrent && handleSelect(t.id, t.label)}>
                  <div className="relative h-36 bg-muted/20 overflow-hidden flex items-start justify-center pt-3">
                    <div className="relative w-[90px] h-[127px] shadow-sm rounded-sm overflow-hidden border border-border/20 transition-transform duration-150 group-hover:scale-[1.03]">
                      <ResumeThumbnail data={{ ...sample, template: t.id }} />
                    </div>
                    {isCurrent && <span className="absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded bg-bronze px-1.5 py-0.5 text-xs font-medium text-bronze-foreground"><CheckCircle2 className="h-2.5 w-2.5" /> Active</span>}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="text-xs font-semibold truncate">{t.label}</h3>
                      <Badge variant="secondary" className="shrink-0 border-border text-xs capitalize text-muted-foreground">{t.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{t.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">No templates found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
