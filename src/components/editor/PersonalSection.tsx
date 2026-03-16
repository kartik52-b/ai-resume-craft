import { useResume } from '@/context/ResumeContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

const PersonalSection = () => {
  const { resume, updatePersonal } = useResume();
  const p = resume.personal;

  const fields = [
    { key: 'fullName', label: 'Full Name', icon: User, placeholder: 'John Doe' },
    { key: 'email', label: 'Email', icon: Mail, placeholder: 'john@example.com' },
    { key: 'phone', label: 'Phone', icon: Phone, placeholder: '+1 (555) 000-0000' },
    { key: 'location', label: 'Location', icon: MapPin, placeholder: 'San Francisco, CA' },
    { key: 'website', label: 'Website', icon: Globe, placeholder: 'https://johndoe.com' },
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'linkedin.com/in/johndoe' },
    { key: 'github', label: 'GitHub', icon: Github, placeholder: 'github.com/johndoe' },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {fields.map(({ key, label, icon: Icon, placeholder }) => (
          <div key={key} className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Icon className="h-3 w-3" />
              {label}
            </Label>
            <Input
              value={p[key]}
              onChange={(e) => updatePersonal(key, e.target.value)}
              placeholder={placeholder}
              className="h-8 text-sm bg-card border-border"
            />
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Professional Summary</Label>
        <Textarea
          value={p.summary}
          onChange={(e) => updatePersonal('summary', e.target.value)}
          placeholder="Experienced software engineer with 5+ years..."
          className="text-sm bg-card border-border resize-none min-h-[80px]"
        />
      </div>
    </div>
  );
};

export default PersonalSection;
