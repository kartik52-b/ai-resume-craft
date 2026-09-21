import { useResume } from '@/context/ResumeContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import SummaryGenerator from '@/components/ai/SummaryGenerator';
import AiToolbar from '@/components/ai/AiToolbar';
import { resumeToPlainText } from '@/lib/resumeText';
import { User, Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

/**
 * Personal information form. New resumes arrive pre-filled with DEFAULT_PERSONAL_INFO
 * (see src/types/resume.ts) — these placeholders only apply if a field is later
 * cleared, and never leak into the resume data itself.
 */
const PersonalSection = () => {
  const { resume, updatePersonal } = useResume();
  const p = resume.personal;

  const fields = [
    { key: 'fullName', label: 'Full Name', icon: User, placeholder: 'Your full name' },
    { key: 'email', label: 'Email', icon: Mail, placeholder: 'you@example.com' },
    { key: 'phone', label: 'Phone', icon: Phone, placeholder: '+91 XXXXX XXXXX' },
    { key: 'location', label: 'Location', icon: MapPin, placeholder: 'City, State, India' },
    { key: 'website', label: 'Website', icon: Globe, placeholder: 'https://yourwebsite.com' },
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'linkedin.com/in/yourname' },
    { key: 'github', label: 'GitHub', icon: Github, placeholder: 'github.com/yourname' },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-x-3 gap-y-3">
        {fields.map(({ key, label, icon: Icon, placeholder }) => (
          <div key={key} className="space-y-1.5">
            <Label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
              <Icon className="h-3 w-3 opacity-50" />{label}
            </Label>
            <Input data-editor-focus-target={key} value={p[key]} onChange={(e) => updatePersonal(key, e.target.value)} placeholder={placeholder}
              className="h-9 text-[13px] bg-background/50 border-border/60 focus:border-accent/50 focus:ring-accent/20 transition-colors" />
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-[11px] font-medium text-muted-foreground">Professional Summary</Label>
          <SummaryGenerator resumeText={resumeToPlainText(resume)} currentSummary={p.summary} onAccept={(text) => updatePersonal('summary', text)} />
        </div>
        <div className="relative">
          <Textarea value={p.summary} onChange={(e) => updatePersonal('summary', e.target.value)}
            placeholder="Experienced software engineer with 5+ years..."
            className="text-[13px] bg-background/50 border-border/60 resize-none min-h-[80px] pr-2 focus:border-accent/50 focus:ring-accent/20 transition-colors" />
          <div className="flex justify-end mt-0.5">
            <AiToolbar text={p.summary} onAccept={(text) => updatePersonal('summary', text)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalSection;
