import { useState, useCallback } from "react";
import { useResume } from "@/context/ResumeContext";
import { useAiAction } from "@/components/ai/useAiAction";
import { aiRewrite, type RewriteMode } from "@/lib/aiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, FileText, Briefcase, GraduationCap, FolderOpen, AlertCircle, Brain, Target, FileOutput, Lightbulb, X } from "lucide-react";
import { cn } from "@/lib/utils";

type CoachAction = { id: string; label: string; description: string; mode: RewriteMode; icon: typeof Brain; category: "improve" | "ats" | "concise" | "impact" };
const COACH_ACTIONS: CoachAction[] = [
  { id: "professional", label: "Make professional", description: "Polish the writing to a professional standard", mode: "professional", icon: Brain, category: "improve" },
  { id: "concise", label: "Make concise", description: "Tighten the wording without losing meaning", mode: "concise", icon: FileOutput, category: "concise" },
  { id: "achievement", label: "Improve impact", description: "Emphasize concrete achievements and results", mode: "achievement", icon: Target, category: "impact" },
  { id: "grammar", label: "Fix grammar", description: "Correct grammar, spelling, and clarity issues", mode: "grammar", icon: CheckCircle, category: "improve" },
  { id: "ats", label: "ATS-friendly", description: "Rewrite for clear, factual, ATS-parseable text", mode: "ats", icon: FileText, category: "ats" },
];
type TextSource = { id: string; label: string; icon: typeof Briefcase; getText: () => string; onAccept: (text: string) => void; };

export default function AiCoach() {
  const { resume, updateField, updatePersonal } = useResume();
  const { run, loading, error, clearError } = useAiAction();
  const [preview, setPreview] = useState<{ original: string; rewritten: string; action: string } | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");

  const sources: TextSource[] = [
    { id: "summary", label: "Summary", icon: Lightbulb, getText: () => resume.personal.summary, onAccept: (text) => updatePersonal("summary", text) },
    ...resume.experience.flatMap((exp) => exp.bullets.filter(Boolean).length > 0 ? [{ id: `exp-${exp.id}`, label: `${exp.position || "Role"} · ${exp.company || "Company"}`, icon: Briefcase, getText: () => exp.bullets.filter(Boolean).join("\n"), onAccept: (text: string) => updateField("experience", resume.experience.map((e) => e.id === exp.id ? { ...e, bullets: text.split("\n").map((l: string) => l.trim()).filter(Boolean) } : e)) }] : []),
    ...resume.education.map((edu) => ({ id: `edu-${edu.id}`, label: `${edu.degree || "Degree"} · ${edu.school || "School"}`, icon: GraduationCap, getText: () => [edu.school, edu.degree, edu.field, edu.gpa ? `GPA: ${edu.gpa}` : ""].filter(Boolean).join(" — "), onAccept: (text: string) => { const parts = text.split(" — "); updateField("education", resume.education.map((e) => e.id === edu.id ? { ...e, school: parts[0] ?? e.school, degree: parts[1] ?? e.degree, field: parts[2] ?? e.field } : e)); } })),
    ...resume.projects.map((proj) => ({ id: `proj-${proj.id}`, label: proj.name || "Project", icon: FolderOpen, getText: () => [proj.name, proj.description].filter(Boolean).join(": "), onAccept: (text: string) => { const [name, ...descParts] = text.split(":"); updateField("projects", resume.projects.map((p) => p.id === proj.id ? { ...p, name: name?.trim() || p.name, description: descParts.join(":").trim() || p.description } : p)); } })),
  ];

  const activeSource = sources.find((s) => s.id === selectedSource);
  const inputText = selectedSource === "custom" ? customText : activeSource?.getText() ?? "";
  const runAction = useCallback((action: CoachAction) => { if (!inputText.trim()) return; const original = inputText; run(() => aiRewrite(original, action.mode), (result) => { if (result.text?.trim()) setPreview({ original, rewritten: result.text.trim(), action: action.label }); }); }, [inputText, run]);

  return (
    <div className="min-h-full bg-workspace overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8 space-y-5">
        <div><h1 className="text-lg font-semibold tracking-tight flex items-center gap-2"><Brain className="h-5 w-5 text-accent" /> AI Resume Coach</h1><p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">Select text from your resume, choose an improvement, and review every AI suggestion before applying it.</p></div>
        <Card><CardHeader className="pb-3"><CardTitle className="text-[13px]">Select text to improve</CardTitle></CardHeader><CardContent className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {sources.map((s) => <Button key={s.id} variant={selectedSource === s.id ? "default" : "outline"} size="sm" className="h-7 text-[11px]" onClick={() => { setSelectedSource(s.id); clearError(); setPreview(null); }}><s.icon className="h-3 w-3 mr-1" /> {s.label}</Button>)}
            <Button variant={selectedSource === "custom" ? "default" : "outline"} size="sm" className="h-7 text-[11px]" onClick={() => { setSelectedSource("custom"); clearError(); setPreview(null); }}>Custom text</Button>
          </div>
          {selectedSource === "custom" && <Textarea value={customText} onChange={(e) => setCustomText(e.target.value)} placeholder="Paste any text from your resume to improve..." className="text-[13px] min-h-[80px]" />}
        </CardContent></Card>
        {inputText.trim() && (<Card><CardHeader className="pb-3"><CardTitle className="text-[13px]">Choose an improvement</CardTitle><CardDescription className="text-[11px]">Every change is previewed — nothing is applied until you accept.</CardDescription></CardHeader><CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {COACH_ACTIONS.map((action) => (<Button key={action.id} variant="outline" className="h-auto p-3 justify-start text-left gap-3 transition-colors hover:border-accent/30" disabled={loading} onClick={() => runAction(action)}>
            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", action.category === "ats" && "bg-emerald-500/10 text-emerald-500", action.category === "improve" && "bg-blue-500/10 text-blue-500", action.category === "concise" && "bg-amber-500/10 text-amber-500", action.category === "impact" && "bg-accent/10 text-accent")}><action.icon className="h-4 w-4" /></div>
            <div className="min-w-0"><div className="text-[12px] font-semibold">{action.label}</div><div className="text-[11px] text-muted-foreground">{action.description}</div></div>
          </Button>))}
        </CardContent></Card>)}
        {error && <div className="flex items-center gap-2 text-[13px] text-destructive p-3 rounded-lg border border-destructive/20 bg-destructive/5"><AlertCircle className="h-4 w-4 shrink-0" /> {error}</div>}
        {preview && (<Card className="border-accent/30 bg-accent/[0.02] animate-scale-in"><CardHeader className="pb-3"><CardTitle className="text-[13px] flex items-center gap-2"><span className="text-[10px]">✦</span> AI Suggestion: {preview.action}</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div><div className="text-[11px] font-medium text-muted-foreground mb-1.5">Original</div><div className="text-[12px] text-muted-foreground bg-muted/50 rounded-lg p-3 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">{preview.original}</div></div>
            <div><div className="text-[11px] font-medium text-accent mb-1.5">Suggested</div><div className="text-[12px] text-foreground bg-accent/5 rounded-lg p-3 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto border border-accent/20">{preview.rewritten}</div></div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="gap-1.5 font-medium" onClick={() => { activeSource?.onAccept(preview.rewritten); setPreview(null); }}><CheckCircle className="h-3.5 w-3.5" /> Accept & Apply</Button>
            <Button variant="ghost" size="sm" onClick={() => setPreview(null)}><X className="h-3.5 w-3.5 mr-1" /> Discard</Button>
          </div>
        </CardContent></Card>)}
        {!inputText.trim() && !preview && (<div className="text-center py-20"><div className="w-14 h-14 rounded-2xl bg-accent/5 border border-accent/10 flex items-center justify-center mx-auto mb-4"><Brain className="h-6 w-6 text-accent/40" /></div><h3 className="text-[15px] font-semibold mb-2">Select text to get started</h3><p className="text-[13px] text-muted-foreground max-w-md mx-auto leading-relaxed">Choose a section from your resume above, or paste custom text. The AI will suggest improvements you can review before accepting.</p></div>)}
      </div>
    </div>
  );
}
