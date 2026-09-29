import { type ResumeData } from '@/types/resume';
import { resolveSectionOrder, isSectionHidden } from '@/lib/sections';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-2.5 break-inside-avoid">
    <h2 className="text-[9.5px] font-bold text-violet-900 uppercase tracking-[0.2em] mb-1.5 flex items-center gap-2">
      {title}<span className="h-px flex-1 bg-violet-200" />
    </h2>
    {children}
  </div>
);

const PortfolioTemplate = ({ data }: { data: ResumeData }) => {
  const { personal: p, experience, education, skills, projects, certifications } = data;
  const order = resolveSectionOrder(data).filter((id) => !isSectionHidden(data, id) && id !== 'personal');

  // Portfolio puts projects FIRST — custom render order
  const sections: Record<string, React.ReactNode> = {
    projects: projects.length > 0 && (
      <Section title="Selected Work">
        {projects.map(proj => (
          <div key={proj.id} className="mb-2.5 last:mb-0 break-inside-avoid rounded-lg border border-violet-100 bg-violet-50/40 p-2">
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-violet-950 text-[11px]">{proj.name}</span>
              {proj.technologies && <span className="text-[8.5px] text-pink-600 font-medium">{proj.technologies}</span>}
            </div>
            {proj.description && <p className="text-[9.5px] text-zinc-700 mt-1 leading-snug">{proj.description}</p>}
            {proj.link && <div className="text-[8.5px] text-violet-600 mt-0.5 font-medium">{proj.link}</div>}
          </div>
        ))}
      </Section>
    ),
    experience: experience.length > 0 && (
      <Section title="Experience">
        {experience.map(exp => (
          <div key={exp.id} className="mb-2.5 last:mb-0 break-inside-avoid">
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-zinc-900 text-[10.5px]">{exp.position}</span>
              <span className="text-[8.5px] text-violet-600 font-medium">{exp.startDate}{(exp.endDate || exp.current) && ` – ${exp.current ? 'Present' : exp.endDate}`}</span>
            </div>
            <div className="text-[9.5px] text-zinc-600">{exp.company}{exp.location && ` · ${exp.location}`}</div>
            {exp.bullets.filter(Boolean).length > 0 && (
              <ul className="mt-1 space-y-0.5 text-[9.5px] text-zinc-700">
                {exp.bullets.filter(Boolean).map((b, i) => <li key={i} className="flex gap-1.5"><span className="text-pink-500">▸</span><span>{b}</span></li>)}
              </ul>
            )}
          </div>
        ))}
      </Section>
    ),
    education: education.length > 0 && (
      <Section title="Education">
        {education.map(edu => (
          <div key={edu.id} className="mb-1.5 last:mb-0 text-[10px]">
            <span className="font-bold text-zinc-900">{edu.school}</span>
            <span className="text-zinc-600"> — {edu.degree}{edu.field && ` in ${edu.field}`}</span>
            <span className="text-zinc-500 text-[8.5px]"> {edu.startDate}{edu.endDate && `–${edu.endDate}`}</span>
          </div>
        ))}
      </Section>
    ),
    skills: skills.length > 0 && (
      <Section title="Capabilities">
        <div className="flex flex-wrap gap-1">
          {skills.map((s, i) => <span key={i} className="text-[8.5px] bg-violet-100 text-violet-800 px-2 py-0.5 rounded-full">{s}</span>)}
        </div>
      </Section>
    ),
    certifications: certifications.length > 0 && (
      <Section title="Recognition">
        {certifications.map(c => (
          <div key={c.id} className="mb-1 last:mb-0 text-[10px]"><span className="font-semibold text-zinc-900">{c.name}</span>{c.issuer && <span className="text-zinc-600"> · {c.issuer}</span>}{c.date && <span className="text-zinc-500 text-[8.5px]"> {c.date}</span>}</div>
        ))}
      </Section>
    ),
  };

  // Portfolio order: projects first, then the rest in stored order
  const renderOrder = ['projects', ...order.filter(id => id !== 'projects')];

  return (
    <div className="font-resume-sans text-[10px] leading-[1.55] text-zinc-700">
      {/* Header with violet/pink gradient accent */}
      <div className="pb-3 mb-3 border-b-2 border-violet-500 relative">
        <div className="absolute -top-1 -right-1 w-14 h-14 rounded-full bg-gradient-to-br from-violet-100 via-pink-100 to-transparent" />
        {p.fullName && <h1 className="text-[23px] font-extrabold tracking-tight text-zinc-900 leading-tight">{p.fullName}</h1>}
        {p.headline && <div className="text-[11px] font-semibold text-violet-700 mt-0.5">{p.headline}</div>}
        {p.summary && <p className="text-[10px] text-violet-800 font-medium italic mt-1 max-w-[85%]">{p.summary}</p>}
        <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 mt-1.5 text-[9px] text-zinc-600">
          {[p.email, p.phone, p.location].filter(Boolean).map((item, i) => <span key={i}>{item}</span>)}
          {[p.website, p.linkedin, p.github].filter(Boolean).map((item, i) => <span key={`l${i}`} className="text-violet-600 font-medium">{item}</span>)}
        </div>
      </div>
      {renderOrder.map((id) => <div key={id}>{sections[id]}</div>)}
    </div>
  );
};

export default PortfolioTemplate;
