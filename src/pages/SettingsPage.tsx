import { useState, useRef } from 'react';
import { useResume } from "@/context/ResumeContext";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Database, Sparkles, ExternalLink, Info, Sun, Moon, Monitor, User, Shield, Settings, Download, Upload, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { STORAGE_KEY, clearStoredResume } from "@/lib/storage";
import { toast } from "sonner";

export default function SettingsPage() {
  const { resumes, activeId, resume, switchResume, loadStatus, updatePersonal } = useResume();
  const { theme, setTheme } = useTheme();
  const [confirmClear, setConfirmClear] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = window.localStorage.getItem(STORAGE_KEY);
    if (!data) { toast.info('No data to export'); return; }
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'ai-resume-craft-backup.json'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        JSON.parse(text); // validate JSON
        window.localStorage.setItem(STORAGE_KEY, text);
        toast.success('Data imported — refreshing...');
        setTimeout(() => window.location.reload(), 500);
      } catch { toast.error('Invalid backup file'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClear = () => {
    if (!confirmClear) { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 4000); return; }
    clearStoredResume();
    toast.success('All data cleared — refreshing...');
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="min-h-full bg-workspace overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-8 space-y-6">
        {/* Account */}
        <section className="rounded-xl border border-border/60 bg-card p-5 space-y-3 shadow-card">
          <div className="flex items-center gap-2.5"><div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center"><User className="h-4 w-4 text-accent" /></div><h2 className="text-[14px] font-semibold">Account</h2></div>
          <p className="text-[13px] text-muted-foreground leading-relaxed">Your profile information is used as defaults for new resumes. Changes apply to the active resume only.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-muted-foreground">Full Name</Label>
              <Input
                value={resume.personal.fullName}
                onChange={(e) => updatePersonal('fullName', e.target.value)}
                placeholder="Your full name"
                className="h-9 text-[13px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-muted-foreground">Email</Label>
              <Input
                value={resume.personal.email}
                onChange={(e) => updatePersonal('email', e.target.value)}
                placeholder="you@example.com"
                className="h-9 text-[13px]"
              />
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="rounded-xl border border-border/60 bg-card p-5 space-y-3 shadow-card">
          <div className="flex items-center gap-2.5"><div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center"><Sun className="h-4 w-4 text-accent" /></div><h2 className="text-[14px] font-semibold">Appearance</h2></div>
          <p className="text-[13px] text-muted-foreground">Choose your preferred theme. System follows your operating system setting.</p>
          <div className="flex gap-2 pt-1">
            {([
              { value: "light", label: "Light", icon: Sun },
              { value: "dark", label: "Dark", icon: Moon },
              { value: "system", label: "System", icon: Monitor },
            ] as const).map(({ value, label, icon: Icon }) => (
              <button key={value} onClick={() => setTheme(value)}
                className={cn("flex items-center gap-2 px-4 py-2.5 rounded-lg border text-[13px] font-medium transition-all duration-150",
                  theme === value ? "border-accent/40 bg-accent/5 text-accent shadow-sm" : "border-border/60 bg-background text-muted-foreground hover:border-border hover:text-foreground")}>
                <Icon className="h-4 w-4" />{label}
              </button>
            ))}
          </div>
        </section>

        {/* Data & Privacy */}
        <section className="rounded-xl border border-border/60 bg-card p-5 space-y-3 shadow-card">
          <div className="flex items-center gap-2.5"><div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center"><Database className="h-4 w-4 text-accent" /></div><h2 className="text-[14px] font-semibold">Data & Privacy</h2></div>
          <p className="text-[13px] text-muted-foreground leading-relaxed">Your resumes are saved automatically to this browser's local storage. Data never leaves your device except when you explicitly request an AI action.</p>
          <ul className="text-[12px] text-muted-foreground space-y-1 list-disc list-inside">
            <li>{resumes.length} resume(s) stored</li>
            <li>Clearing your browser data will delete stored resumes</li>
          </ul>
          <Badge variant="secondary" className="text-[11px] capitalize">{loadStatus === "restored" ? "restored" : loadStatus === "salvaged" ? "recovered" : loadStatus}</Badge>
          {resumes.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {resumes.map((r) => (
                <button key={r.id} onClick={() => switchResume(r.id)}
                  className={cn("text-[11px] px-2.5 py-1 rounded-md border transition-all duration-150",
                    r.id === activeId ? "border-accent/50 bg-accent/10 text-accent" : "border-border/60 hover:bg-muted/50 text-muted-foreground hover:text-foreground")}>
                  {r.title}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" size="sm" className="h-8 text-[12px] gap-1.5" onClick={handleExport}><Download className="h-3.5 w-3.5" /> Export all data</Button>
            <Button variant="outline" size="sm" className="h-8 text-[12px] gap-1.5" onClick={() => importRef.current?.click()}><Upload className="h-3.5 w-3.5" /> Import data</Button>
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            <Button variant="outline" size="sm" className={cn('h-8 text-[12px] gap-1.5', confirmClear && 'border-destructive text-destructive bg-destructive/5')} onClick={handleClear}><Trash2 className="h-3.5 w-3.5" /> {confirmClear ? 'Confirm clear' : 'Clear all data'}</Button>
          </div>
        </section>

        {/* AI */}
        <section className="rounded-xl border border-border/60 bg-card p-5 space-y-3 shadow-card">
          <div className="flex items-center gap-2.5"><div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center"><Sparkles className="h-4 w-4 text-accent" /></div><h2 className="text-[14px] font-semibold">AI Features</h2></div>
          <p className="text-[13px] text-muted-foreground leading-relaxed">AI runs through a server-side proxy. The <code className="px-1.5 py-0.5 rounded bg-muted text-[11px] font-mono">GOOGLE_API_KEY</code> is set on the server only.</p>
          <p className="text-[12px] text-muted-foreground">If AI actions return "not configured", the key is missing. The rest of the app works fully without it.</p>
          <a href="https://ai.google.dev/pricing" target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 text-[13px] text-primary hover:underline">Google AI Studio <ExternalLink className="h-3.5 w-3.5" /></a>
        </section>

        <p className="flex items-start gap-2 text-[12px] text-muted-foreground"><Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />Everything in this app runs locally in your browser. The only server component is the optional AI proxy.</p>
      </div>
    </div>
  );
}
