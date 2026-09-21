import { type ResumeData } from '@/types/resume';
import { resolveSectionOrder, isSectionHidden } from '@/lib/sections';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-2.5 break-inside-avoid">
    <h2 className="text-[9.5px] font-bold text-cyan-700 uppercase tracking-[0.18em] mb-1.5 flex items-center gap-2">
      <span className="h-px flex-1 bg-cyan-300" />{title}
    </h2>
    {children}
  </div>
);

const DeveloperTemplate = ({ data }: { data: ResumeData }) => {
  const { personal: p, experience, education, skills, projects, certifications } = data;
  const order = resolveSectionOrder(data).filter((id) => !isSectionHidden(data, id) && id !== 'personal');

  const sections: Record<string, React.ReactNode> = {
    experience: experience.length > 0 && (
      <Section title="Professional Experience">
        {experience.map(exp => (
          <div key={exp.id} className="mb-2.5 last:mb-0 break-inside-avoid pl-2 border-l-2 border-cyan-200">
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-slate-900 text-[11px]">{exp.position}</span>
              <span className="text-[8.5px] text-cyan-700 font-mono">{exp.startDate}{(exp.endDate || exp.current) && ` – ${exp.current ? 'Present' : exp.endDate}`}</span>
            </div>
            <div className="text-[10px] text-slate-600 font-medium">{exp.company}{exp.location && ` · ${exp.location}`}</div>
            {exp.bullets.filter(Boolean).length > 0 && (
              <ul className="mt-1 space-y-0.5 text-[9.5px] text-slate-700">
                {exp.bullets.filter(Boolean).map((b, i) => <li key={i} className="flex gap-1"><span className="text-cyan-600 font-mono">›</span><span>{b}</span></li>)}
              </ul>
            )}
          </div>
        ))}
      </Section>
    ),
    education: education.length > 0 && (
      <Section title="Education">
        {education.map(edu => (
          <div key={edu.id} className="mb-1.5 last:mb-0 text-[10px] pl-2 border-l-2 border-cyan-200">
            <span className="font-bold text-slate-900">{edu.school}</span>
            <span className="text-slate-600"> — {edu.degree}{edu.field && ` in ${edu.field}`}</span>
            <span className="text-slate-500 text-[9px] font-mono"> {edu.startDate}{edu.endDate && `–${edu.endDate}`}</span>
          </div>
        ))}
      </Section>
    ),
    skills: skills.length > 0 && (
      <Section title="Technical Stack">
        <div className="flex flex-wrap gap-1">
          {skills.map((s, i) => <span key={i} className="text-[8.5px] font-mono bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded">{s}</span>)}
        </div>
      </Section>
    ),
    projects: projects.length > 0 && (
      <Section title="Open Source & Projects">
        {projects.map(proj => (
          <div key={proj.id} className="mb-2 last:mb-0 text-[10px] break-inside-avoid">
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-slate-900 font-mono">{proj.name}</span>
              {proj.link && <span className="text-[8.5px] text-cyan-700 font-mono">{proj.link}</span>}
            </div>
            {proj.technologies && <div className="text-[8.5px] text-slate-500 font-mono">[{proj.technologies}]</div>}
            {proj.description && <p className="text-[9.5px] text-slate-700 mt-0.5">{proj.description}</p>}
          </div>
        ))}
      </Section>
    ),
    certifications: certifications.length > 0 && (
      <Section title="Certifications">
        {certifications.map(c => (
          <div key={c.id} className="mb-1 last:mb-0 text-[10px]"><span className="font-semibold text-slate-900">{c.name}</span>{c.issuer && <span className="text-slate-600"> · {c.issuer}</span>}{c.date && <span className="text-slate-500 text-[9px] font-mono"> {c.date}</span>}</div>
        ))}
      </Section>
    ),
  };

  return (
    <div className="font-resume-sans text-[10px] leading-[1.55] text-slate-700">
      {/* Dark navy header band */}
      <div className="bg-slate-900 -mx-5 -mt-5 px-5 pt-4 pb-3 mb-4 rounded-b">
        {p.fullName && <h1 className="text-[20px] font-bold text-white tracking-tight">{p.fullName}</h1>}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[9px] font-mono text-cyan-300">
          {[p.email, p.phone, p.location].filter(Boolean).map((item, i) => <span key={i}>{item}</span>)}
        </div>
        <div className="flex flex-wrap gap-x-3 mt-0.5 text-[9px] font-mono text-cyan-400/80">
          {[p.website, p.linkedin, p.github].filter(Boolean).map((item, i) => <span key={`l${i}`}>{item}</span>)}
        </div>
      </div>
      {p.summary && <Section title="Profile"><p className="text-[10px] text-slate-700 leading-relaxed">{p.summary}</p></Section>}
      {order.map((id) => <div key={id}>{sections[id]}</div>)}
    </div>
  );
};

export default DeveloperTemplate;
