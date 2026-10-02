import { useState, useRef } from 'react';
import { useResume } from '@/context/ResumeContext';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Monitor, Moon, Sun, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STORAGE_KEY, clearStoredResume } from '@/lib/storage';
import { toast } from 'sonner';

/** A settings section: hairline rule, quiet label, no card chrome. */
function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border pt-6 first:border-t-0 first:pt-0">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {hint && <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** A single premium information row: label + value, aligned. */
function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 border-b border-border last:border-b-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className={cn('text-foreground text-right', mono && 'font-mono text-xs')}>{value}</dd>
    </div>
  );
}

export default function SettingsPage() {
  const { resumes, activeId, resume, switchResume, loadStatus, updatePersonal } = useResume();
  const { theme, setTheme } = useTheme();
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [clearting, setClearing] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const statusLabel =
    loadStatus === 'restored' ? 'Restored' : loadStatus === 'salvaged' ? 'Recovered' : loadStatus === 'fresh' ? 'New' : loadStatus === 'corrupted' ? 'Corrupted' : 'Unknown';

  const handleExport = () => {
    const data = window.localStorage.getItem(STORAGE_KEY);
    if (!data) { toast.info('No data to export'); return; }
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-resume-craft-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        JSON.parse(text);
        window.localStorage.setItem(STORAGE_KEY, text);
        toast.success('Data imported — refreshing...');
        setTimeout(() => window.location.reload(), 500);
      } catch {
        toast.error('Invalid backup file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClear = () => {
    setClearing(true);
    clearStoredResume();
    toast.success('All data cleared — refreshing...');
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="min-h-full bg-background overflow-x-hidden">
      <div className="mx-auto max-w-3xl px-5 py-10 lg:px-8 lg:py-12 space-y-1">
        <header className="animate-fade-up">
          <p className="eyebrow mb-3">Preferences</p>
          <h1 className="font-display text-2xl font-semibold leading-tight text-foreground lg:text-3xl">
            Settings
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Everything runs in this browser. Your resumes are stored locally and never uploaded.
          </p>
        </header>

        <div className="space-y-1 animate-fade-up">
          {/* Appearance — kept exactly as before, only tightened rhythm. */}
          <Section hint="System follows your operating system setting.">
            <div className="inline-flex rounded-lg border border-border bg-secondary/70 p-[3px]">
              {([
                { value: 'light', label: 'Light', icon: Sun },
                { value: 'dark', label: 'Dark', icon: Moon },
                { value: 'system', label: 'System', icon: Monitor },
              ] as const).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  aria-pressed={theme === value}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3.5 py-1.5 text-sm transition-colors',
                    theme === value
                      ? 'bg-card text-foreground shadow-xs ring-1 ring-border'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </Section>

          {/* Account — edit the active resume's contact details. */}
          <Section
            title="Account"
            hint="These are the contact details of your active resume. New resumes always start blank and are filled in through the create flow."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="settings-name" className="text-xs text-muted-foreground">Full name</Label>
                <Input
                  id="settings-name"
                  value={resume.personal.fullName}
                  onChange={(e) => updatePersonal('fullName', e.target.value)}
                  placeholder="Your full name"
                  className="h-10 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="settings-email" className="text-xs text-muted-foreground">Email</Label>
                <Input
                  id="settings-email"
                  value={resume.personal.email}
                  onChange={(e) => updatePersonal('email', e.target.value)}
                  placeholder="you@example.com"
                  className="h-10 text-sm"
                />
              </div>
            </div>
          </Section>

          {/* Data & Privacy — clean info rows + one consistent action row. */}
          <Section
            title="Data & Privacy"
            hint="Resumes are saved automatically to this browser's local storage. Data leaves your device only when you explicitly request help with wording."
          >
            <dl className="divide-y divide-border">
              <InfoRow label="Stored resumes" value={resumes.length} />
              <InfoRow label="Storage state" value={statusLabel} />
              <InfoRow label="Sign-in" value="Not required" />
            </dl>

            {resumes.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {resumes.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => switchResume(r.id)}
                    aria-pressed={r.id === activeId}
                    className={cn(
                      'rounded border px-2.5 py-1 text-xs transition-colors',
                      r.id === activeId
                        ? 'border-bronze bg-bronze-soft text-foreground'
                        : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground',
                    )}
                  >
                    {r.title}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" className="h-9 gap-1.5 text-sm min-w-[120px]" onClick={handleExport}>
                Export all data
              </Button>
              <Button variant="secondary" size="sm" className="h-9 gap-1.5 text-sm min-w-[120px]" onClick={() => importRef.current?.click()}>
                Import data
              </Button>
              <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
              <Button
                variant="destructive"
                size="sm"
                className="h-9 gap-1.5 text-sm min-w-[120px]"
                onClick={() => setConfirmClearOpen(true)}
              >
                Clear all data
              </Button>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Clearing your browser data also removes stored resumes.
            </p>
          </Section>

          {/* AI — user-friendly, with setup and help links kept functional. */}
          <Section
            title="AI Writing Assistance"
            hint="Get optional help improving your resume summary and bullet points."
          >
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm font-medium text-foreground">Optional help when you want it.</p>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                You can ask for suggestions on your summary and bullet points. Every
                suggestion is shown to you before it is applied, and nothing is sent from
                your browser without your explicit request.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <a
                  href="https://ai.google.dev/pricing"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground shadow-xs transition-colors hover:border-border-strong hover:bg-secondary/60"
                >
                  Set up AI
                </a>
                <a
                  href="https://ai.google.dev/gemini-api/docs/api-key"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-bronze"
                >
                  How to get a key
                </a>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                AI assistance is optional. Your resume editor, templates, saving, and PDF export work without it.
              </p>
            </div>
          </Section>

          {/* Environment — compact reference rows. */}
          <Section title="Environment" hint="What this app runs on, and where your work is kept.">
            <dl className="divide-y divide-border">
              <InfoRow label="Runs in" value="This browser — no server round-trips for your data" />
              <InfoRow label="Storage key" value={STORAGE_KEY} mono />
              <InfoRow label="Export" value="A4 PDF, selectable text" />
              <InfoRow label="Writing assistance" value="Optional · server-side proxy" />
            </dl>
          </Section>
        </div>
      </div>

      {/* Clear-data confirmation dialog — one explicit confirmation step. */}
      <Dialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
              Clear all data?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              This removes every stored resume and resets the active workspace. The change
              cannot be undone, and clearing your browser data also removes stored resumes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="secondary" size="sm" className="h-9" onClick={() => setConfirmClearOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-9 gap-1.5"
              onClick={handleClear}
              disabled={clearting}
            >
              {clearting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              {clearting ? 'Clearing...' : 'Clear all data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
