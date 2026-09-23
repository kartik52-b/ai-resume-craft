import { type ResumeData } from '@/types/resume';
import { resolveSectionOrder, isSectionHidden } from '@/lib/sections';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-4 break-inside-avoid">
    <h2 className="text-[9px] font-medium text-emerald-900 uppercase tracking-[0.25em] mb-2 text-center">
      <span className="inline-block border-b border-emerald-300 pb-1">{title}</span>
    </h2>
    {children}
  </div>
);

const ElegantTemplate = ({ data }: { data: ResumeData }) => {
  const { personal: p, experience, education, skills, projects, certifications } = data;
  const order = resolveSectionOrder(data).filter((id) => !isSectionHidden(data, id) && id !== 'personal');

  const sections: Record<string, React.ReactNode> = {
    experience: experience.length > 0 && (
      <Section title="Experience">
        {experience.map(exp => (
          <div key={exp.id} className="mb-3.5 last:mb-0 break-inside-avoid">
            <div className="text-center">
              <div className="text-[11.5px] font-semibold text-emerald-950">{exp.position}</div>
              <div className="text-[10px] text-emerald-800/80 italic">{exp.company}{exp.location && ` · ${exp.location}`}</div>
              <div className="text-[8.5px] text-emerald-700/70 tracking-[0.15em] uppercase mt-0.5">{exp.startDate}{(exp.endDate || exp.current) && ` – ${exp.current ? 'Present' : exp.endDate}`}</div>
            </div>
            {exp.bullets.filter(Boolean).length > 0 && (
              <ul className="mt-1.5 space-y-1 text-[10px] text-zinc-600 text-center max-w-[85%] mx-auto">
                {exp.bullets.filter(Boolean).map((b, i) => <li key={i} className="leading-relaxed">{b}</li>)}
              </ul>
            )}
          </div>
        ))}
      </Section>
    ),
    education: education.length > 0 && (
      <Section title="Education">
        {education.map(edu => (
          <div key={edu.id} className="mb-2.5 last:mb-0 text-center break-inside-avoid">
            <div className="text-[11px] font-semibold text-emerald-950">{edu.school}</div>
            <div className="text-[10px] text-zinc-600 italic">{edu.degree}{edu.field && ` in ${edu.field}`}</div>
            <div className="text-[9px] text-emerald-700/70">{edu.startDate}{edu.endDate && ` – ${edu.endDate}`}{edu.gpa && ` · GPA ${edu.gpa}`}</div>
          </div>
        ))}
      </Section>
    ),
    skills: skills.length > 0 && (
      <Section title="Areas of Expertise">
        <p className="text-[10px] text-zinc-600 text-center leading-relaxed max-w-[90%] mx-auto">{skills.join('  ·  ')}</p>
      </Section>
    ),
    projects: projects.length > 0 && (
      <Section title="Selected Projects">
        {projects.map(proj => (
          <div key={proj.id} className="mb-2.5 last:mb-0 text-center break-inside-avoid">
            <div className="text-[10.5px] font-semibold text-emerald-950">{proj.name}</div>
            {proj.technologies && <div className="text-[9px] text-emerald-700/70 italic">{proj.technologies}</div>}
            {proj.description && <p className="text-[10px] text-zinc-600 mt-0.5 max-w-[85%] mx-auto leading-relaxed">{proj.description}</p>}
          </div>
        ))}
      </Section>
    ),
    certifications: certifications.length > 0 && (
      <Section title="Credentials">
        {certifications.map(c => (
          <div key={c.id} className="mb-1.5 last:mb-0 text-[10px] text-center">
            <span className="font-medium text-emerald-950">{c.name}</span>
            {c.issuer && <span className="text-zinc-500"> · {c.issuer}</span>}
            {c.date && <span className="text-emerald-700/60 text-[9px]"> {c.date}</span>}
          </div>
        ))}
      </Section>
    ),
  };

  return (
    <div className="font-resume-serif text-[10.5px] leading-[1.65] text-zinc-700">
      {/* Elegant centered header with letter-spaced name */}
      <div className="text-center pb-4 mb-4">
        {p.fullName && <h1 className="text-[24px] font-light tracking-[0.12em] text-emerald-950 uppercase">{p.fullName}</h1>}
        {p.headline && <div className="text-[9.5px] tracking-[0.2em] uppercase text-emerald-800 mt-1.5">{p.headline}</div>}
        <div className="w-12 h-px bg-emerald-400 mx-auto my-2" />
        <div className="text-[9px] text-zinc-500 tracking-[0.08em] uppercase">
          {[p.email, p.phone, p.location].filter(Boolean).join('   ·   ')}
        </div>
        <div className="text-[9px] text-emerald-800 tracking-[0.08em] uppercase mt-0.5">
          {[p.website, p.linkedin, p.github].filter(Boolean).join('   ·   ')}
        </div>
      </div>
      {p.summary && <Section title="Profile"><p className="text-[10.5px] text-zinc-600 text-center leading-loose max-w-[92%] mx-auto">{p.summary}</p></Section>}
      {order.map((id) => <div key={id}>{sections[id]}</div>)}
    </div>
  );
};

export default ElegantTemplate;
