import { useResume } from '@/context/ResumeContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { createEmptyCertification } from '@/types/resume';
import { Trash2 } from 'lucide-react';

const CertificationsSection = () => {
  const { resume, updateField } = useResume();

  const addCert = () => {
    updateField('certifications', [...resume.certifications, createEmptyCertification()]);
  };

  const removeCert = (id: string) => {
    updateField('certifications', resume.certifications.filter(c => c.id !== id));
  };

  const updateCert = (id: string, field: string, value: string) => {
    updateField('certifications', resume.certifications.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  return (
    <div className="space-y-4">
      {resume.certifications.map((cert) => (
        <div key={cert.id} className="p-3 bg-secondary/50 rounded-lg space-y-3">
          <div className="flex justify-end">
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeCert(cert.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Name</Label>
              <Input value={cert.name} onChange={e => updateCert(cert.id, 'name', e.target.value)} placeholder="AWS Solutions Architect" className="h-8 text-sm bg-card" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Issuer</Label>
              <Input value={cert.issuer} onChange={e => updateCert(cert.id, 'issuer', e.target.value)} placeholder="Amazon" className="h-8 text-sm bg-card" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Date</Label>
              <Input value={cert.date} onChange={e => updateCert(cert.id, 'date', e.target.value)} placeholder="Mar 2024" className="h-8 text-sm bg-card" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Link</Label>
              <Input value={cert.link} onChange={e => updateCert(cert.id, 'link', e.target.value)} placeholder="https://..." className="h-8 text-sm bg-card" />
            </div>
          </div>
        </div>
      ))}
      <button onClick={addCert} className="w-full py-2.5 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-foreground/30 hover:text-foreground/60 transition-colors">
        + Add Certification
      </button>
    </div>
  );
};

export default CertificationsSection;
