import { useState, useRef } from 'react';
import { useResume } from "@/context/ResumeContext";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { STORAGE_KEY, clearStoredResume } from "@/lib/storage";
import { toast } from "sonner";

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
    <section className="border-t border-border pt-7 first:border-t-0 first:pt-0">
      <h2 className="text-[13px] font-semibold text-foreground">{title}</h2>
      {hint && <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted-foreground">{hint}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

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

  const statusLabel = loadStatus === 'restored' ? 'restored' : loadStatus === 'salvaged' ? 'recovered' : loadStatus;

  return (
    <div className="min-h-full bg-background overflow-x-hidden">
      <div className="mx-auto max-w-3xl px-5 py-10 lg:px-8 lg:py-14 space-y-7">
        <header className="animate-fade-up">
          <p className="eyebrow mb-3">Preferences</p>
          <h1 className="font-display text-[26px] font-semibold leading-tight text-foreground lg:text-[30px]">
            Settings
          </h1>
          <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
            Everything runs in this browser. Your resumes are stored locally and
            never uploaded.
          </p>
        </header>

        <div className="space-y-7 animate-fade-up">
          <Section title="Appearance" hint="System follows your operating system setting.">
            <div className="inline-flex rounded-lg border border-border bg-secondary/70 p-[3px]">
              {([
                { value: "light", label: "Light", icon: Sun },
                { value: "dark", label: "Dark", icon: Moon },
                { value: "system", label: "System", icon: Monitor },
              ] as const).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  aria-pressed={theme === value}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3.5 py-1.5 text-[12.5px] transition-colors",
                    theme === value
                      ? "bg-card text-foreground shadow-xs ring-1 ring-border"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </Section>

          <Section
            title="Account"
            hint="These are the contact details of your active resume. New resumes always start blank and are filled in through the create flow."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="settings-name" className="text-[12px] text-muted-foreground">Full name</Label>
                <Input
                  id="settings-name"
                  value={resume.personal.fullName}
                  onChange={(e) => updatePersonal('fullName', e.target.value)}
                  placeholder="Your full name"
                  className="h-10 text-[13.5px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="settings-email" className="text-[12px] text-muted-foreground">Email</Label>
                <Input
                  id="settings-email"
                  value={resume.personal.email}
                  onChange={(e) => updatePersonal('email', e.target.value)}
                  placeholder="you@example.com"
                  className="h-10 text-[13.5px]"
                />
              </div>
            </div>
          </Section>

          <Section
            title="Data & Privacy"
            hint="Resumes are saved automatically to this browser's local storage. Data leaves your device only when you explicitly request help with wording."
          >
            <dl className="divide-y divide-border border-y border-border text-[13px]">
              <div className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="text-muted-foreground">Stored resumes</dt>
                <dd className="text-foreground tabular-nums">{resumes.length}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="text-muted-foreground">Storage state</dt>
                <dd className="capitalize text-foreground">{statusLabel}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="text-muted-foreground">Sign-in</dt>
                <dd className="text-foreground">Not required</dd>
              </div>
            </dl>

            {resumes.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {resumes.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => switchResume(r.id)}
                    aria-pressed={r.id === activeId}
                    className={cn(
                      "rounded border px-2.5 py-1 text-[11.5px] transition-colors",
                      r.id === activeId
                        ? "border-bronze bg-bronze-soft text-foreground"
                        : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                    )}
                  >
                    {r.title}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-[12.5px]" onClick={handleExport}>
                Export all data
              </Button>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-[12.5px]" onClick={() => importRef.current?.click()}>
                Import data
              </Button>
              <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
              <Button
                variant="outline"
                size="sm"
                className={cn('h-9 gap-1.5 text-[12.5px]', confirmClear && 'border-destructive text-destructive')}
                onClick={handleClear}
              >
                {confirmClear ? 'Confirm clear' : 'Clear all data'}
              </Button>
            </div>
            <p className="mt-3 text-[12px] text-muted-foreground">
              Clearing your browser data also removes stored resumes.
            </p>
          </Section>

          <Section
            title="AI Configuration"
            hint="Writing assistance is optional. Summaries and bullet points can be rewritten through a server-side proxy — the provider key never reaches the browser, and every suggestion is shown to you before it is applied."
          >
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-[13px] font-medium text-foreground">Writing assistance is optional.</p>
              <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-muted-foreground">
                Set{' '}
                <code className="font-mono text-[11.5px] text-foreground">GOOGLE_API_KEY</code> on the
                server running{' '}
                <code className="font-mono text-[11.5px] text-foreground">api/app.py</code>. If an AI
                action reports that it isn't configured yet, that key is missing. Editing,
                templates, saving and PDF export work fully without it.
              </p>
              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                <a
                  href="https://ai.google.dev/pricing"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-[12px] font-medium text-foreground transition-colors hover:border-border-strong hover:bg-secondary/70"
                >
                  Set up AI
                </a>
                <a
                  href="https://ai.google.dev/gemini-api/docs/api-key"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[12.5px] text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-bronze"
                >
                  How to get a key
                </a>
              </div>
            </div>
          </Section>

          <Section title="Environment" hint="What this app runs on, and where your work is kept.">
            <dl className="divide-y divide-border border-y border-border text-[13px]">
              <div className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="text-muted-foreground">Runs in</dt>
                <dd className="text-foreground text-right">This browser — no server round-trips for your data</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="text-muted-foreground">Storage key</dt>
                <dd className="font-mono text-[11.5px] text-foreground">{STORAGE_KEY}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="text-muted-foreground">Export</dt>
                <dd className="text-foreground text-right">A4 PDF, selectable text</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="text-muted-foreground">Writing assistance</dt>
                <dd className="text-foreground text-right">Optional · server-side proxy</dd>
              </div>
            </dl>
          </Section>
        </div>
      </div>
    </div>
  );
}
