import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

/**
 * Shown on resume-dependent pages (Job Match, AI Coach) when the visitor has
 * not created a resume yet — instead of analysing an empty document.
 */
export default function NoResumeNotice({ title, description }: { title: string; description: string }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-full bg-workspace overflow-y-auto">
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-accent/[0.06] border border-accent/10 flex items-center justify-center mx-auto mb-5">
          <FileText className="h-6 w-6 text-accent/40" />
        </div>
        <h1 className="text-[20px] font-semibold tracking-tight">{title}</h1>
        <p className="text-[13.5px] text-muted-foreground mt-2 leading-relaxed">{description}</p>
        <Button className="btn-gradient mt-6 rounded-xl gap-2" onClick={() => navigate('/create')}>
          <Plus className="h-4 w-4" /> Create My Resume
        </Button>
      </div>
    </div>
  );
}
