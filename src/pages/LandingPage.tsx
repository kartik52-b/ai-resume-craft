import { useNavigate } from 'react-router-dom';
import { useResume } from '@/context/ResumeContext';
import { Button } from '@/components/ui/button';
import { Sparkles, FileText, Shield, Target, LayoutTemplate, ArrowRight, Check, PenLine, Download, Search } from 'lucide-react';

const FEATURES = [
  { icon: LayoutTemplate, title: 'Professional Templates', desc: '25+ uniquely designed templates for every industry and career stage.' },
  { icon: Sparkles, title: 'AI-Powered Writing', desc: 'Improve summaries, experience bullets, and resume wording with AI.' },
  { icon: Shield, title: 'Resume Health', desc: 'Find missing information and improve your resume quality with real-time scoring.' },
  { icon: Target, title: 'Job Match', desc: 'Compare your resume against job descriptions to find skill gaps.' },
  { icon: FileText, title: 'Live Preview', desc: 'See changes instantly while editing. Export a polished PDF in one click.' },
];

const STEPS = [
  { num: '01', title: 'Create your resume', desc: 'Start with your contact info, experience, and skills.' },
  { num: '02', title: 'Choose your template', desc: 'Pick from 25+ professional designs that match your career.' },
  { num: '03', title: 'Improve with AI', desc: 'Get AI suggestions to strengthen your content and wording.' },
  { num: '04', title: 'Export your PDF', desc: 'Download a polished, ATS-ready resume in seconds.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { createResumeAction } = useResume();

  const handleCreate = () => {
    createResumeAction();
    navigate('/editor');
  };

  return (
    <div className="min-h-full bg-workspace overflow-y-auto">
      {/* Hero */}
      <div className="relative px-4 lg:px-8 pt-16 pb-16 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-[12px] font-medium mb-6">
          <Sparkles className="h-3.5 w-3.5" /> AI-POWERED RESUME BUILDER
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight max-w-3xl mx-auto">
          Build a resume that gets you noticed
        </h1>
        <p className="text-lg text-muted-foreground mt-5 max-w-2xl mx-auto leading-relaxed">
          Create a professional, ATS-friendly resume with premium templates,
          AI-assisted writing and a live resume preview.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <Button size="lg" className="btn-gradient h-12 px-8 text-[15px] font-semibold rounded-xl gap-2" onClick={handleCreate}>
            Create My Resume <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 text-[15px] rounded-xl" onClick={() => navigate('/templates')}>
            Explore Templates
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="px-4 lg:px-8 pb-16 max-w-5xl mx-auto">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-border/60 bg-card p-5 card-hover">
              <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                <Icon className="h-4.5 w-4.5 text-accent" />
              </div>
              <h3 className="text-[14px] font-semibold mb-1">{title}</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="px-4 lg:px-8 pb-16 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold tracking-tight text-center mb-8">How it works</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ num, title, desc }) => (
            <div key={num} className="text-center">
              <div className="text-[28px] font-bold text-accent/30 mb-2">{num}</div>
              <h3 className="text-[14px] font-semibold mb-1">{title}</h3>
              <p className="text-[12px] text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 lg:px-8 pb-16 max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold tracking-tight mb-3">Ready to build your resume?</h2>
        <p className="text-[14px] text-muted-foreground mb-6">Create your professional resume with AI.</p>
        <Button size="lg" className="btn-gradient h-12 px-8 text-[15px] font-semibold rounded-xl gap-2" onClick={handleCreate}>
          Create My Resume <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
