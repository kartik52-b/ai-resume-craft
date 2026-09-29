import { useResume } from '@/context/ResumeContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { createEmptyCertification } from '@/types/resume';
import { Trash2 } from 'lucide-react';

const INPUT = "h-9 text-[13px] bg-background/50 border-border/60 focus:border-accent/50 focus:ring-accent/20 transition-colors";

const CertificationsSection = () => {
  const { resume, updateField } = useResume();
  const addCert = () => updateField('certifications', [...resume.certifications, createEmptyCertification()]);
  const removeCert = (id: string) => updateField('certifications', resume.certifications.filter(c => c.id !== id));
  const updateCert = (id: string, field: string, value: string) => updateField('certifications', resume.certifications.map(c => c.id === id ? { ...c, [field]: value } : c));

  return (
    <div className="space-y-3">
      {resume.certifications.map((cert) => (
        <div key={cert.id} data-entry-id={cert.id} className="p-3.5 bg-secondary/20 border border-border/40 rounded-xl space-y-3 group relative hover:border-border/60 transition-colors">
          <div className="flex justify-end"><Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive transition-colors" onClick={() => removeCert(cert.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label className="text-[11px] font-medium text-muted-foreground">Name</Label><Input value={cert.name} onChange={e => updateCert(cert.id, 'name', e.target.value)} placeholder="AWS Solutions Architect" className={INPUT} /></div>
            <div className="space-y-1.5"><Label className="text-[11px] font-medium text-muted-foreground">Issuer</Label><Input value={cert.issuer} onChange={e => updateCert(cert.id, 'issuer', e.target.value)} placeholder="Amazon" className={INPUT} /></div>
            <div className="space-y-1.5"><Label className="text-[11px] font-medium text-muted-foreground">Date</Label><Input value={cert.date} onChange={e => updateCert(cert.id, 'date', e.target.value)} placeholder="Mar 2024" className={INPUT} /></div>
            <div className="space-y-1.5"><Label className="text-[11px] font-medium text-muted-foreground">Link</Label><Input value={cert.link} onChange={e => updateCert(cert.id, 'link', e.target.value)} placeholder="https://..." className={INPUT} /></div>
          </div>
        </div>
      ))}
      <button onClick={addCert} className="w-full py-3 border-2 border-dashed border-border/60 rounded-xl text-[13px] text-muted-foreground hover:border-accent/30 hover:text-accent/80 hover:bg-accent/[0.02] transition-all duration-150">+ Add Certification</button>
    </div>
  );
};

export default CertificationsSection;
