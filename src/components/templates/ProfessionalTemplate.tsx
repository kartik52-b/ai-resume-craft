import { type ResumeData, type SectionId } from '@/types/resume';
import { resolveSectionOrder, isSectionHidden } from '@/lib/sections';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-3 break-inside-avoid">
    <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider border-b border-zinc-300 pb-0.5 mb-1.5">{title}</h2>
    {children}
  </div>
);

const ProfessionalTemplate = ({ data }: { data: ResumeData }) => {
  const { personal: p, experience, education, skills, projects, certifications } = data;
  const order = resolveSectionOrder(data).filter((id) => !isSectionHidden(data, id) && id !== 'personal');

  const sections: Record<SectionId, React.ReactNode> = {
    personal: null,
    experience: experience.length > 0 && (
      <Section title="Professional Experience">
        {experience.map(exp => (
          <div key={exp.id} className="mb-3 last:mb-0 break-inside-avoid">
            <div className="flex justify-between">
              <div>
                <span className="font-bold text-zinc-900">{exp.company}</span>
                {exp.location && <span className="text-zinc-500"> — {exp.location}</span>}
              </div>
              <span className="text-[10px] text-zinc-500 italic">{exp.startDate}{(exp.endDate || exp.current) && ` – ${exp.current ? 'Present' : exp.endDate}`}</span>
            </div>
            {exp.position && <div className="italic text-zinc-600">{exp.position}</div>}
            {exp.bullets.filter(Boolean).length > 0 && (
              <ul className="mt-1 space-y-0.5 list-disc list-outside ml-4">
                {exp.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            )}
          </div>
        ))}
      </Section>
    ),
    education: education.length > 0 && (
      <Section title="Education">
        {education.map(edu => (
          <div key={edu.id} className="mb-1.5 last:mb-0 flex justify-between">
            <div>
              <span className="font-bold text-zinc-900">{edu.school}</span>
              {(edu.degree || edu.field) && <span className="italic text-zinc-600"> — {[edu.degree, edu.field].filter(Boolean).join(' in ')}</span>}
              {edu.gpa && <span className="text-zinc-400"> (GPA: {edu.gpa})</span>}
            </div>
            <span className="text-[10px] text-zinc-500 italic">{edu.endDate || edu.startDate}</span>
          </div>
        ))}
      </Section>
    ),
    skills: skills.length > 0 && (
      <Section title="Technical Skills">
        <p>{skills.join(' • ')}</p>
      </Section>
    ),
    projects: projects.length > 0 && (
      <Section title="Projects">
        {projects.map(proj => (
          <div key={proj.id} className="mb-2 last:mb-0 break-inside-avoid">
            <span className="font-bold text-zinc-900">{proj.name}</span>
            {proj.technologies && <span className="italic text-zinc-500"> — {proj.technologies}</span>}
            {proj.description && <p className="mt-0.5 text-zinc-600">{proj.description}</p>}
          </div>
        ))}
      </Section>
    ),
    certifications: certifications.length > 0 && (
      <Section title="Certifications">
        {certifications.map(cert => (
          <div key={cert.id} className="mb-0.5 last:mb-0 flex justify-between">
            <div>
              <span className="font-bold text-zinc-900">{cert.name}</span>
              {cert.issuer && <span className="text-zinc-500">, {cert.issuer}</span>}
            </div>
            <span className="text-[10px] text-zinc-500 italic">{cert.date}</span>
          </div>
        ))}
      </Section>
    ),
  };

  return (
    <div className="font-resume-serif text-[11px] leading-[1.55] text-zinc-800">
      {/* Header (always first) */}
      <div className="text-center border-b-2 border-zinc-800 pb-3 mb-3">
        {p.fullName && <h1 className="text-2xl font-bold tracking-tight text-zinc-900 uppercase">{p.fullName}</h1>}
        <div className="flex flex-wrap items-center justify-center gap-x-2 mt-1 text-[10px] text-zinc-500">
          {[p.email, p.phone, p.location].filter(Boolean).map((item, i) => (
            <span key={i}>{i > 0 && '|'} {item}</span>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-2 text-[10px] text-zinc-500">
          {[p.website, p.linkedin, p.github].filter(Boolean).map((item, i) => (
            <span key={i}>{i > 0 && '|'} {item}</span>
          ))}
        </div>
      </div>

      {p.summary && <Section title="Professional Summary"><p className="italic text-zinc-600">{p.summary}</p></Section>}

      {order.map((id) => (
        <div key={id}>{sections[id]}</div>
      ))}
    </div>
  );
};

export default ProfessionalTemplate;
