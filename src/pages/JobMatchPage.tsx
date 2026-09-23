import { useMemo, useState } from "react";
import { useResume } from "@/context/ResumeContext";
import { matchJob, requestJobMatch } from "@/lib/jobMatch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, CircleAlert, Loader2, Sparkles, AlertCircle, Target, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import NoResumeNotice from "@/components/NoResumeNotice";

export default function JobMatchPage() {
  const { resume, resumes, activeId, switchResume, hasResume } = useResume();
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<ReturnType<typeof matchJob> | null>(null);
  const [aiState, setAiState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [aiCommentary, setAiCommentary] = useState("");
  const result = useMemo(() => (analysis ? matchJob(resume, jobDescription) : null), [analysis, jobDescription, resume]);
  const requestAi = async () => { setAiState("loading"); try { const text = await requestJobMatch(resume, jobDescription); setAiCommentary(text); setAiState("done"); } catch { setAiState("error"); } };

  if (!hasResume) {
    return (
      <NoResumeNotice
        title="Create a resume to match against a job"
        description="Job Match compares your resume content with a job posting. Create your resume first, then come back and paste the job description."
      />
    );
  }

  return (
    <div className="min-h-full bg-workspace overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8 space-y-5">
        {resumes.length > 1 && (
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-muted-foreground font-medium">Analyzing:</span>
            <select value={activeId ?? ""} onChange={(e) => switchResume(e.target.value)} className="text-[12px] border border-border rounded-md px-2.5 py-1.5 bg-card text-foreground">
              {resumes.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
            </select>
          </div>
        )}
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-card">
          <h2 className="text-[15px] font-semibold mb-1">Paste a Job Description</h2>
          <p className="text-[12px] text-muted-foreground mb-4 leading-relaxed">We extract skills and keywords from the posting and compare them with your resume.</p>
          <Textarea placeholder="Paste the full job description here..." className="min-h-[160px] text-[13px]" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} maxLength={12000} />
          <div className="flex items-center gap-3 mt-4">
            <Button onClick={() => setAnalysis(matchJob(resume, jobDescription))} disabled={jobDescription.trim().length < 40} className="font-medium gap-1.5"><Target className="h-4 w-4" /> Analyze Match</Button>
            <Button variant="ghost" size="sm" onClick={() => { setJobDescription(""); setAnalysis(null); setAiState("idle"); setAiCommentary(""); }} className="text-[12px]">Clear</Button>
            <div className="ml-auto"><Button variant="ghost" size="sm" onClick={requestAi} disabled={aiState === "loading" || !analysis} className="text-[12px] gap-1.5">{aiState === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-[10px]">✦</span>} AI Commentary</Button></div>
          </div>
        </div>
        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-xl border border-border/60 bg-card p-4 text-center shadow-card"><div className="text-2xl font-bold text-accent tabular-nums">{result.keywordCoverage.percent}%</div><div className="text-[11px] text-muted-foreground mt-1">Keyword Match</div></div>
              <div className="rounded-xl border border-border/60 bg-card p-4 text-center shadow-card"><div className="text-2xl font-bold text-emerald-500 tabular-nums">{result.matchedSkills.length}</div><div className="text-[11px] text-muted-foreground mt-1">Matched Skills</div></div>
              <div className="rounded-xl border border-border/60 bg-card p-4 text-center shadow-card"><div className="text-2xl font-bold text-destructive tabular-nums">{result.missingSkills.length}</div><div className="text-[11px] text-muted-foreground mt-1">Missing Skills</div></div>
              <div className="rounded-xl border border-border/60 bg-card p-4 text-center shadow-card"><div className="text-2xl font-bold text-amber-500 tabular-nums">{result.recommendations.length}</div><div className="text-[11px] text-muted-foreground mt-1">Recommendations</div></div>
            </div>
            {result.matchedSkills.length > 0 && (<Card><CardHeader className="pb-2"><CardTitle className="text-[13px] flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Matched Skills</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-1.5">{result.matchedSkills.map((skill) => <Badge key={skill} variant="secondary" className="text-[11px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{skill}</Badge>)}</CardContent></Card>)}
            {result.missingSkills.length > 0 && (<Card><CardHeader className="pb-2"><CardTitle className="text-[13px] flex items-center gap-2"><CircleAlert className="h-4 w-4 text-destructive" /> Missing Skills</CardTitle><CardDescription className="text-[11px]">Only add if you genuinely have the experience.</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-1.5">{result.missingSkills.map((skill) => <Badge key={skill} variant="outline" className="text-[11px] border-destructive/20 text-destructive/80">{skill}</Badge>)}</CardContent></Card>)}
            <Card><CardHeader className="pb-2"><CardTitle className="text-[13px] flex items-center gap-2"><BookOpen className="h-4 w-4 text-blue-500" /> Top Keywords ({result.keywordCoverage.matched}/{result.keywordCoverage.total} matched)</CardTitle></CardHeader><CardContent><div className="space-y-1.5">{result.topKeywords.slice(0, 10).map((kw) => (<div key={kw.keyword} className="flex items-center gap-2 text-[11px]"><span className="font-mono text-muted-foreground w-24 truncate">{kw.keyword}</span><Progress value={Math.min(100, kw.count * 20)} className="h-1.5 flex-1" /><span className="text-muted-foreground tabular-nums w-6 text-right">x{kw.count}</span></div>))}</div></CardContent></Card>
            {result.recommendations.length > 0 && (<Card><CardHeader className="pb-2"><CardTitle className="text-[13px] flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" /> Recommendations</CardTitle></CardHeader><CardContent className="space-y-2">{result.recommendations.map((rec, i) => <div key={i} className="flex items-start gap-2 text-[12px] leading-relaxed"><span className="text-muted-foreground font-medium">{i + 1}.</span><span className="text-muted-foreground">{rec}</span></div>)}</CardContent></Card>)}
            {aiState === "error" && <div className="flex items-center gap-2 text-[13px] text-destructive p-4 rounded-lg border border-destructive/20 bg-destructive/5"><AlertCircle className="h-4 w-4" /> AI commentary unavailable — check Settings.</div>}
            {aiState === "done" && (<Card className="border-accent/30 bg-accent/[0.02]"><CardHeader className="pb-2"><CardTitle className="text-[13px] flex items-center gap-2"><span className="text-[10px]">✦</span> AI Commentary</CardTitle></CardHeader><CardContent><p className="text-[13px] text-muted-foreground whitespace-pre-wrap leading-relaxed">{aiCommentary}</p><Badge variant="outline" className="mt-3 text-[10px]">AI-generated — review before acting</Badge></CardContent></Card>)}
          </div>
        )}
      </div>
    </div>
  );
}
