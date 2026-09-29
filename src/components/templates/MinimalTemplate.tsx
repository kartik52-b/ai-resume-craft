import { type ResumeData, type SectionId } from '@/types/resume';
import { resolveSectionOrder, isSectionHidden } from '@/lib/sections';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-3 break-inside-avoid">
    <h2 className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 mb-1">{title}</h2>
    {children}
  </div>
);

const MinimalTemplate = ({ data }: { data: ResumeData }) => {
  const { personal: p, experience, education, skills, projects, certifications } = data;
  const order = resolveSectionOrder(data).filter((id) => !isSectionHidden(data, id) && id !== 'personal');

  const sections: Record<SectionId, React.ReactNode> = {
    personal: null,
    experience: experience.length > 0 && (
      <Section title="EXPERIENCE">
        {experience.map(exp => (
          <div key={exp.id} className="mb-2.5 last:mb-0 break-inside-avoid">
            <div className="font-bold text-zinc-900">{exp.position} {exp.company && `@ ${exp.company}`}</div>
            <div className="text-[9px] text-zinc-400">{[exp.location, `${exp.startDate}${exp.endDate || exp.current ? ` – ${exp.current ? 'Present' : exp.endDate}` : ''}`].filter(Boolean).join(' | ')}</div>
            {exp.bullets.filter(Boolean).length > 0 && (
              <ul className="mt-1 space-y-0.5">
                {exp.bullets.filter(Boolean).map((b, i) => <li key={i}>– {b}</li>)}
              </ul>
            )}
          </div>
        ))}
      </Section>
    ),
    education: education.length > 0 && (
      <Section title="EDUCATION">
        {education.map(edu => (
          <div key={edu.id} className="mb-1 last:mb-0">
            <span className="font-bold text-zinc-900">{edu.school}</span>
            {(edu.degree || edu.field) && <span> — {[edu.degree, edu.field].filter(Boolean).join(', ')}</span>}
            {edu.gpa && <span className="text-zinc-400"> ({edu.gpa})</span>}
            <span className="text-zinc-400 text-[9px] ml-2">{edu.startDate}{edu.endDate && ` – ${edu.endDate}`}</span>
          </div>
        ))}
      </Section>
    ),
    skills: skills.length > 0 && (
      <Section title="SKILLS"><p>{skills.join(', ')}</p></Section>
    ),
    projects: projects.length > 0 && (
      <Section title="PROJECTS">
        {projects.map(proj => (
          <div key={proj.id} className="mb-1.5 last:mb-0 break-inside-avoid">
            <span className="font-bold text-zinc-900">{proj.name}</span>
            {proj.technologies && <span className="text-zinc-400"> [{proj.technologies}]</span>}
            {proj.description && <p className="mt-0.5">{proj.description}</p>}
          </div>
        ))}
      </Section>
    ),
    certifications: certifications.length > 0 && (
      <Section title="CERTIFICATIONS">
        {certifications.map(cert => (
          <div key={cert.id} className="mb-0.5 last:mb-0">
            <span className="font-bold text-zinc-900">{cert.name}</span>
            {cert.issuer && <span> — {cert.issuer}</span>}
            {cert.date && <span className="text-zinc-400"> ({cert.date})</span>}
          </div>
        ))}
      </Section>
    ),
  };

  return (
    <div className="font-resume-mono text-[10.5px] leading-[1.6] text-zinc-700">
      {/* Header (always first) */}
      <div className="mb-4">
        {p.fullName && <h1 className="text-lg font-bold text-zinc-900">{p.fullName}</h1>}
        {p.headline && <div className="text-[10px] text-zinc-500 mt-0.5">{p.headline}</div>}
        <div className="text-[10px] text-zinc-400 space-x-2">
          {[p.email, p.phone, p.location, p.website, p.linkedin, p.github].filter(Boolean).map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>
      </div>

      {p.summary && <Section title="SUMMARY"><p>{p.summary}</p></Section>}

      {order.map((id) => (
        <div key={id}>{sections[id]}</div>
      ))}
    </div>
  );
};

export default MinimalTemplate;
