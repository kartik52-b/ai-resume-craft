import { useResume } from '@/context/ResumeContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { createEmptyCertification } from '@/types/resume';
import { Plus, Trash2 } from 'lucide-react';

const INPUT = "h-9 text-sm";

const CertificationsSection = () => {
  const { resume, updateField } = useResume();
  const addCert = () => updateField('certifications', [...resume.certifications, createEmptyCertification()]);
  const removeCert = (id: string) => updateField('certifications', resume.certifications.filter(c => c.id !== id));
  const updateCert = (id: string, field: string, value: string) => updateField('certifications', resume.certifications.map(c => c.id === id ? { ...c, [field]: value } : c));

  return (
    <div className="space-y-3">
      {resume.certifications.map((cert) => (
        <div key={cert.id} data-entry-id={cert.id} className="group relative space-y-3 rounded-md border border-border bg-muted/30 p-3.5 transition-colors hover:border-foreground/20">
          <div className="flex justify-end"><Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive transition-colors" onClick={() => removeCert(cert.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">Name</Label><Input value={cert.name} onChange={e => updateCert(cert.id, 'name', e.target.value)} placeholder="AWS Solutions Architect" className={INPUT} /></div>
            <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">Issuer</Label><Input value={cert.issuer} onChange={e => updateCert(cert.id, 'issuer', e.target.value)} placeholder="Amazon" className={INPUT} /></div>
            <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">Date</Label><Input value={cert.date} onChange={e => updateCert(cert.id, 'date', e.target.value)} placeholder="Mar 2024" className={INPUT} /></div>
            <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">Link</Label><Input value={cert.link} onChange={e => updateCert(cert.id, 'link', e.target.value)} placeholder="https://..." className={INPUT} /></div>
          </div>
        </div>
      ))}
      <Button
        variant="secondary"
        className="w-full gap-1"
        onClick={addCert}
      >
        <Plus /> Add Certification
      </Button>
    </div>
  );
};

export default CertificationsSection;
