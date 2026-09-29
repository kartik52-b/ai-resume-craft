import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { useResume } from '@/context/ResumeContext';
import {
  CURRENT_STORAGE_VERSION,
  parseResumeBackup,
  type StoredEnvelope,
} from '@/lib/storage';
import Carousel from '@/components/Carousel';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  ShieldCheck,
  Download,
  Upload,
  Trash2,
  Database,
  FileText,
  HardDrive,
  Check,
} from 'lucide-react';

/**
 * Settings — appearance, local data and privacy.
 *
 * Rules:
 *  - controls stay directly accessible (never inside a slider)
 *  - the slider below them is supporting information only
 *  - backup/restore/clear operate purely on this browser's local storage
 */

/* ── Supporting privacy slider content ─────────────────────────────────── */

const DATA_SLIDES = [
  {
    icon: ShieldCheck,
    title: 'Your resumes stay in your browser',
    text: 'Everything is stored in this browser’s local storage. Nothing is uploaded, no account is required, and clearing your browser data removes it.',
  },
  {
    icon: Download,
    title: 'Back up your resume data',
    text: 'Download a JSON copy of every resume at any time and keep it wherever you like — a new backup is made with every export.',
  },
  {
    icon: Upload,
    title: 'Restore your saved data',
    text: 'Import a backup to add those resumes back. Restoring always appends — resumes already in this browser are never replaced.',
  },
  {
    icon: Trash2,
    title: 'Clear local data when needed',
    text: 'Remove everything stored in this browser in one confirmed step. Download a backup first if you want to keep a copy.',
  },
];

/* ── Theme options ─────────────────────────────────────────────────────── */

const THEME_OPTIONS = [
  { id: 'light', label: 'Light', Icon: Sun },
  { id: 'dark', label: 'Dark', Icon: Moon },
  { id: 'system', label: 'System', Icon: Monitor },
] as const;

/* ── Page ──────────────────────────────────────────────────────────────── */

export default function SettingsPage() {
  const { hash } = useLocation();
  const { theme, setTheme } = useTheme();
  const { resumes, activeId, saveStatus, restoreResumesAction, clearAllResumesAction } = useResume();

  const [mounted, setMounted] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => setMounted(true), []);

  /* Anchor navigation from the footer (#privacy / #terms). */
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    el?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }, [hash]);

  /* Rough footprint of the stored resume data (in-memory store, which mirrors
     what autosave writes back to local storage). */
  const storageKb = useMemo(
    () => (JSON.stringify({ resumes, activeId }).length / 1024).toFixed(1),
    [resumes, activeId],
  );

  const downloadBackup = () => {
    if (resumes.length === 0) {
      toast.info('Nothing to back up yet', { description: 'Create a resume first.' });
      return;
    }
    try {
      const envelope: StoredEnvelope = {
        version: CURRENT_STORAGE_VERSION,
        savedAt: new Date().toISOString(),
        store: { resumes, activeId },
      };
      const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-resume-craft-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success('Backup downloaded', {
        description: `${resumes.length} resume${resumes.length === 1 ? '' : 's'} saved as a JSON file.`,
      });
    } catch {
      toast.error('Backup failed', { description: 'Something went wrong while creating the file.' });
    }
  };

  const onRestoreFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow choosing the same file again
    if (!file) return;
    try {
      const text = await file.text();
      const result = parseResumeBackup(text);
      if (!result.ok) {
        toast.error('That file is not a valid backup', {
          description:
            result.error === 'not-json'
              ? 'The file is not readable JSON.'
              : result.error === 'unsupported-version'
                ? 'The file was created by a newer version of this app.'
                : 'The file contains no recognisable resumes.',
        });
        return;
      }
      const added = restoreResumesAction(result.resumes);
      toast.success(`Restored ${added} resume${added === 1 ? '' : 's'}`, {
        description: 'Your existing resumes were kept exactly as they were.',
      });
    } catch {
      toast.error('Restore failed', { description: 'The file could not be read.' });
    }
  };

  const saveLabel =
    saveStatus === 'saving'
      ? 'Saving…'
      : saveStatus === 'error'
        ? 'Save failed'
        : resumes.length > 0
          ? 'All changes saved'
          : 'No data yet';

  return (
    <div className="bg-workspace">
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8 lg:py-10 space-y-8">
        {/* ── Header ── */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent mb-1.5">
            Preferences
          </p>
          <h1 className="text-[26px] lg:text-[30px] font-bold tracking-tight text-foreground leading-tight flex items-center gap-2.5">
            <Settings className="h-6 w-6 text-accent" aria-hidden /> Settings
          </h1>
          <p className="text-[14px] text-muted-foreground mt-1.5 max-w-2xl leading-relaxed">
            Appearance, local data and privacy — all handled on this device.
          </p>
        </div>

        {/* ── Supporting privacy slider (controls stay outside the slides) ── */}
        <Carousel
          variant="cards"
          ariaLabel="How your data is handled"
          slideLabels={DATA_SLIDES.map((s) => s.title)}
          slides={DATA_SLIDES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border border-border/60 bg-card p-5 card-hover">
              <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                <Icon className="h-4 w-4 text-accent" aria-hidden />
              </div>
              <h2 className="text-[14px] font-semibold mb-1">{title}</h2>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{text}</p>
            </div>
          ))}
        />

        {/* ── Appearance ── */}
        <section className="rounded-2xl border border-border/60 bg-card p-5 lg:p-6 shadow-card" aria-labelledby="appearance-heading">
          <div className="flex items-center gap-2.5 mb-1">
            <Sun className="h-4 w-4 text-accent" aria-hidden />
            <h2 id="appearance-heading" className="text-[15px] font-semibold">Appearance</h2>
          </div>
          <p className="text-[13px] text-muted-foreground mb-4">
            Choose how AI Resume Craft looks. System follows your device setting.
          </p>
          <div role="group" aria-label="Theme preference" className="flex flex-wrap gap-2">
            {THEME_OPTIONS.map(({ id, label, Icon }) => {
              const active = mounted && theme === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTheme(id)}
                  aria-pressed={active}
                  className={
                    active
                      ? 'inline-flex items-center gap-2 h-10 px-4 rounded-xl text-[13px] font-medium border border-accent/50 bg-accent/10 text-accent transition-colors'
                      : 'inline-flex items-center gap-2 h-10 px-4 rounded-xl text-[13px] font-medium border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors'
                  }
                >
                  <Icon className="h-4 w-4" aria-hidden /> {label}
                  {active && <Check className="h-3.5 w-3.5" aria-hidden />}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Local data ── */}
        <section className="rounded-2xl border border-border/60 bg-card p-5 lg:p-6 shadow-card" aria-labelledby="data-heading">
          <div className="flex items-center gap-2.5 mb-1">
            <Database className="h-4 w-4 text-accent" aria-hidden />
            <h2 id="data-heading" className="text-[15px] font-semibold">Local data</h2>
          </div>
          <p className="text-[13px] text-muted-foreground mb-4">
            Your resumes live in this browser only. Back them up before switching devices or clearing browser data.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <div className="rounded-xl border border-border/60 bg-background/40 p-4">
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground mb-1">
                <FileText className="h-3.5 w-3.5" aria-hidden /> Resumes stored
              </div>
              <div className="text-[20px] font-bold tabular-nums">{resumes.length}</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/40 p-4">
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground mb-1">
                <HardDrive className="h-3.5 w-3.5" aria-hidden /> Storage used
              </div>
              <div className="text-[20px] font-bold tabular-nums">{storageKb} KB</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/40 p-4">
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground mb-1">
                <Check className="h-3.5 w-3.5" aria-hidden /> Save status
              </div>
              <div className="text-[14px] font-semibold leading-8">{saveLabel}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Button
              onClick={downloadBackup}
              disabled={resumes.length === 0}
              className="h-10 px-4 rounded-xl text-[13px] font-medium gap-2"
            >
              <Download className="h-4 w-4" /> Download backup
            </Button>
            <Button
              variant="outline"
              onClick={() => fileRef.current?.click()}
              className="h-10 px-4 rounded-xl text-[13px] font-medium gap-2"
            >
              <Upload className="h-4 w-4" /> Restore from backup
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              aria-label="Choose a backup file"
              onChange={onRestoreFile}
            />
            <Button
              variant="destructive"
              onClick={() => setConfirmClear(true)}
              disabled={resumes.length === 0}
              className="h-10 px-4 rounded-xl text-[13px] font-medium gap-2 ml-auto"
            >
              <Trash2 className="h-4 w-4" /> Clear local data
            </Button>
          </div>
        </section>

        {/* ── Privacy ── */}
        <section id="privacy" className="rounded-2xl border border-border/60 bg-card p-5 lg:p-6 shadow-card scroll-mt-20" aria-labelledby="privacy-heading">
          <h2 id="privacy-heading" className="text-[15px] font-semibold mb-2">Privacy</h2>
          <div className="space-y-2.5 text-[13.5px] text-muted-foreground leading-relaxed">
            <p>
              AI Resume Craft stores your resumes in this browser’s local storage. There is no
              account, no server sync and no analytics: your information never leaves your device
              unless you download a backup yourself.
            </p>
            <p>
              Design previews on marketing and gallery pages use clearly-labelled sample content.
              Sample content is never written into your resume — your resume only ever contains
              what you type.
            </p>
            <p>
              Removing your browser data, using “Clear local data” here, or using a private
              browsing window will remove or prevent storage of your resumes. Keep a downloaded
              backup if you want a copy that outlives this browser.
            </p>
          </div>
        </section>

        {/* ── Terms ── */}
        <section id="terms" className="rounded-2xl border border-border/60 bg-card p-5 lg:p-6 shadow-card scroll-mt-20" aria-labelledby="terms-heading">
          <h2 id="terms-heading" className="text-[15px] font-semibold mb-2">Terms</h2>
          <div className="space-y-2.5 text-[13.5px] text-muted-foreground leading-relaxed">
            <p>
              The resume content you create is yours. The app is provided as-is for creating and
              exporting resumes; always review the exported PDF before sending it to an employer.
            </p>
            <p>
              Backups are ordinary JSON files with no encryption — store them somewhere only you
              can access. Restoring a backup adds its resumes to this browser; it never replaces
              what is already here.
            </p>
            <p>
              No payment, subscription or account features exist in this version — every template
              and feature listed in the app is available to use.
            </p>
          </div>
        </section>
      </div>

      {/* ── Clear-data confirmation ── */}
      <Dialog open={confirmClear} onOpenChange={setConfirmClear}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Clear all local data?</DialogTitle>
            <DialogDescription className="text-[13px] text-muted-foreground leading-relaxed">
              This removes all {resumes.length} resume{resumes.length === 1 ? '' : 's'} stored in
              this browser. It cannot be undone — download a backup first if you want to keep a
              copy.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="sm" onClick={() => setConfirmClear(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                clearAllResumesAction();
                setConfirmClear(false);
                toast.success('Local data cleared', { description: 'This browser has no saved resumes.' });
              }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
