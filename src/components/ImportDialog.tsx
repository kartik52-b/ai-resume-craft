import { useCallback, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useResume } from '@/context/ResumeContext';
import { parseImportedText, isSupportedImportFile, importErrorMessage, type ImportError } from '@/lib/importResume';
import { extractDocxText } from '@/lib/docxText';
import { Upload, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';

const MAX_FILE_BYTES = 2 * 1024 * 1024;

export const ImportDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  const { resume, setResume, hasResume, importResumeAction } = useResume();
  const [parsed, setParsed] = useState<ReturnType<typeof parseImportedText> | null>(null);
  const [error, setError] = useState<ImportError | null>(null);
  const [parsing, setParsing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => { setParsed(null); setError(null); setParsing(false); if (inputRef.current) inputRef.current.value = ''; }, []);

  const handleFile = useCallback(async (file: File) => {
    setError(null); setParsed(null);
    if (!isSupportedImportFile(file.name)) { setError({ code: 'unsupported_type', message: importErrorMessage('unsupported_type') }); return; }
    if (file.size > MAX_FILE_BYTES) { setError({ code: 'too_large', message: importErrorMessage('too_large') }); return; }
    setParsing(true);
    try {
      let text = '';
      if (file.name.toLowerCase().endsWith('.docx')) { text = await extractDocxText(file); } else { text = await file.text(); }
      const result = parseImportedText(text, resume.template);
      if (result.warnings.length === 1 && result.warnings[0].startsWith('No readable text')) { setError({ code: 'empty', message: importErrorMessage('empty') }); } else { setParsed(result); }
    } catch { setError({ code: 'parse_failed', message: importErrorMessage('parse_failed') }); } finally { setParsing(false); }
  }, [resume.template]);

  // With no resume yet the draft becomes a new resume; otherwise it replaces
  // the active resume's content (the behaviour described in the dialog copy).
  const confirm = useCallback(() => {
    if (!parsed) return;
    if (hasResume) setResume(() => parsed.draft);
    else importResumeAction(parsed.draft);
    onOpenChange(false);
    reset();
  }, [parsed, hasResume, setResume, importResumeAction, onOpenChange, reset]);
  const d = parsed?.draft;
  const count = (n: number | undefined) => n ?? 0;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Import resume</DialogTitle>
          <DialogDescription className="text-[12px]">Import a .txt, .md or .docx file. Review the detected content before it replaces the current resume — nothing is overwritten until you confirm.</DialogDescription>
        </DialogHeader>
        {!parsed && !error && (
          <div role="button" tabIndex={0} onClick={() => inputRef.current?.click()} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) void handleFile(f); }}
            className="border-2 border-dashed border-border/60 rounded-xl p-8 text-center cursor-pointer hover:border-accent/40 hover:bg-accent/[0.02] transition-all duration-150">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground/60" />
            <p className="text-[13px] font-medium mt-2">Click or drop a file</p>
            <p className="text-[11px] text-muted-foreground mt-1">.txt · .md · .docx — up to 2 MB</p>
            <input ref={inputRef} type="file" accept=".txt,.text,.md,.docx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }} />
          </div>
        )}
        {parsing && <p className="text-[13px] text-muted-foreground py-6 text-center">Reading file...</p>}
        {error && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3"><AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" /><div className="text-[13px]"><p className="font-medium text-destructive">{error.message}</p><p className="text-[11px] text-muted-foreground mt-1">Your current resume was not modified.</p></div></div>
            <Button variant="outline" onClick={reset} className="text-[12px]">Try another file</Button>
          </div>
        )}
        {parsed && d && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[13px]"><CheckCircle2 className="h-4 w-4 text-emerald-500" /><span className="font-medium">Detected content</span><Badge variant="secondary" className="ml-auto text-[11px]">{count(d.experience.length)} roles</Badge><Badge variant="secondary" className="text-[11px]">{count(d.education.length)} education</Badge><Badge variant="secondary" className="text-[11px]">{count(d.skills.length)} skills</Badge></div>
            <div className="rounded-lg border border-border p-3 space-y-2 text-[13px] max-h-64 overflow-y-auto">
              <p><span className="text-muted-foreground">Name:</span> {d.personal.fullName || '—'}</p>
              <p><span className="text-muted-foreground">Email:</span> {d.personal.email || '—'}</p>
              {d.experience.slice(0, 4).map((e) => <p key={e.id} className="text-[12px] text-muted-foreground"><FileText className="h-3 w-3 inline mr-1" />{e.position || '(untitled)'}{e.company && ` — ${e.company}`}</p>)}
            </div>
            {parsed.warnings.length > 0 && (<div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-1">{parsed.warnings.map((w, i) => <p key={i} className="text-[11px] text-amber-500 flex items-start gap-1.5"><AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />{w}</p>)}</div>)}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={reset} className="text-[12px]">Choose a different file</Button>
              <Button onClick={confirm} className="text-[12px] font-medium">
                {hasResume ? "Replace current resume with this draft" : "Create my resume from this draft"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
