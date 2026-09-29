import { type ResumeData } from '@/types/resume';
import { resolveSectionOrder, isSectionHidden } from '@/lib/sections';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-2 break-inside-avoid">
    <h2 className="text-[8.5px] font-bold text-slate-800 uppercase tracking-[0.12em] border-b border-slate-300 pb-0.5 mb-1">{title}</h2>
    {children}
  </div>
);

const CompactTemplate = ({ data }: { data: ResumeData }) => {
  const { personal: p, experience, education, skills, projects, certifications } = data;
  const order = resolveSectionOrder(data).filter((id) => !isSectionHidden(data, id) && id !== 'personal');

  const sections: Record<string, React.ReactNode> = {
    experience: experience.length > 0 && (
      <Section title="Experience">
        {experience.map(exp => (
          <div key={exp.id} className="mb-1.5 last:mb-0 break-inside-avoid">
            <div className="flex justify-between text-[9.5px]">
              <span><span className="font-bold text-slate-900">{exp.position}</span>{exp.company && <span className="text-slate-600">, {exp.company}</span>}</span>
              <span className="text-slate-500 text-[8.5px]">{exp.startDate}{(exp.endDate || exp.current) && `–${exp.current ? 'Present' : exp.endDate}`}</span>
            </div>
            {exp.bullets.filter(Boolean).length > 0 && (
              <ul className="text-[9px] text-slate-700 mt-0.5 space-y-0 leading-snug">
                {exp.bullets.filter(Boolean).map((b, i) => <li key={i}>• {b}</li>)}
              </ul>
            )}
          </div>
        ))}
      </Section>
    ),
    education: education.length > 0 && (
      <Section title="Education">
        {education.map(edu => (
          <div key={edu.id} className="flex justify-between text-[9.5px] mb-0.5 last:mb-0">
            <span><span className="font-bold text-slate-900">{edu.school}</span> — {edu.degree}{edu.field && `, ${edu.field}`}{edu.gpa && <span className="text-slate-500"> (GPA {edu.gpa})</span>}</span>
            <span className="text-slate-500 text-[8.5px]">{edu.startDate}{edu.endDate && `–${edu.endDate}`}</span>
          </div>
        ))}
      </Section>
    ),
    skills: skills.length > 0 && (
      <Section title="Skills">
        <p className="text-[9px] text-slate-700 leading-tight"><span className="font-semibold text-slate-600">Technical:</span> {skills.join(', ')}</p>
      </Section>
    ),
    projects: projects.length > 0 && (
      <Section title="Projects">
        {projects.map(proj => (
          <div key={proj.id} className="mb-1 last:mb-0 text-[9px] break-inside-avoid">
            <span className="font-bold text-slate-900">{proj.name}</span>
            {proj.technologies && <span className="text-slate-500 italic"> ({proj.technologies})</span>}
            {proj.description && <span className="text-slate-700"> — {proj.description}</span>}
          </div>
        ))}
      </Section>
    ),
    certifications: certifications.length > 0 && (
      <Section title="Certifications">
        <p className="text-[9px] text-slate-700">{certifications.map(c => [c.name, c.issuer, c.date].filter(Boolean).join(' · ')).join(' | ')}</p>
      </Section>
    ),
  };

  return (
    <div className="font-resume-sans text-[9.5px] leading-[1.4] text-slate-700">
      {/* Minimal compact header */}
      <div className="flex justify-between items-baseline pb-1.5 mb-2 border-b-2 border-slate-700">
        <div>
          {p.fullName && <h1 className="text-[16px] font-bold text-slate-900 tracking-tight leading-none">{p.fullName}</h1>}
          {p.headline && <div className="text-[8.5px] font-medium text-slate-600 mt-0.5">{p.headline}</div>}
          <div className="text-[8.5px] text-slate-500 mt-0.5">{[p.email, p.phone].filter(Boolean).join(' · ')}</div>
        </div>
        <div className="text-[8.5px] text-slate-500 text-right leading-tight">
          <div>{p.location}</div>
          <div className="text-slate-600">{[p.website, p.linkedin, p.github].filter(Boolean).join(' · ')}</div>
        </div>
      </div>
      {p.summary && <Section title="Summary"><p className="text-[9px] text-slate-700 leading-snug">{p.summary}</p></Section>}
      {order.map((id) => <div key={id}>{sections[id]}</div>)}
    </div>
  );
};

export default CompactTemplate;
