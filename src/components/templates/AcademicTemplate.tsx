import { type ResumeData } from '@/types/resume';
import { resolveSectionOrder, isSectionHidden } from '@/lib/sections';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-3 break-inside-avoid">
    <h2 className="text-[10.5px] font-bold text-teal-900 uppercase tracking-[0.2em] border-b border-teal-300 pb-1 mb-2">{title}</h2>
    {children}
  </div>
);

const AcademicTemplate = ({ data }: { data: ResumeData }) => {
  const { personal: p, experience, education, skills, projects, certifications } = data;
  const order = resolveSectionOrder(data).filter((id) => !isSectionHidden(data, id) && id !== 'personal');

  const sections: Record<string, React.ReactNode> = {
    experience: experience.length > 0 && (
      <Section title="Research & Professional Experience">
        {experience.map(exp => (
          <div key={exp.id} className="mb-3 last:mb-0 break-inside-avoid">
            <div className="text-[11px] font-bold text-teal-900">{exp.position}</div>
            <div className="text-[10px] text-zinc-700 italic">{exp.company}{exp.location && `, ${exp.location}`}</div>
            <div className="text-[9px] text-zinc-500 font-medium tracking-wide">{exp.startDate}{(exp.endDate || exp.current) && ` – ${exp.current ? 'Present' : exp.endDate}`}</div>
            {exp.bullets.filter(Boolean).length > 0 && (
              <ul className="mt-1 space-y-1 text-[10px] text-zinc-700 list-disc list-outside ml-4">
                {exp.bullets.filter(Boolean).map((b, i) => <li key={i} className="leading-snug">{b}</li>)}
              </ul>
            )}
          </div>
        ))}
      </Section>
    ),
    education: education.length > 0 && (
      <Section title="Education">
        {education.map(edu => (
          <div key={edu.id} className="mb-2.5 last:mb-0 break-inside-avoid">
            <div className="text-[11px] font-bold text-teal-900">{edu.school}</div>
            <div className="text-[10px] text-zinc-700">{edu.degree}{edu.field && ` in ${edu.field}`}</div>
            <div className="flex justify-between text-[9px] text-zinc-500">
              <span>{edu.startDate}{edu.endDate && ` – ${edu.endDate}`}</span>
              {edu.gpa && <span>GPA: {edu.gpa}</span>}
            </div>
          </div>
        ))}
      </Section>
    ),
    skills: skills.length > 0 && (
      <Section title="Areas of Expertise">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-zinc-700">
          {skills.map((s, i) => <div key={i} className="flex gap-1.5"><span className="text-teal-700">•</span>{s}</div>)}
        </div>
      </Section>
    ),
    projects: projects.length > 0 && (
      <Section title="Research Projects & Publications">
        {projects.map(proj => (
          <div key={proj.id} className="mb-2 last:mb-0 break-inside-avoid">
            <div className="text-[10.5px] font-bold text-teal-900">{proj.name}</div>
            {proj.technologies && <div className="text-[9px] text-zinc-500 italic">{proj.technologies}</div>}
            {proj.description && <p className="text-[10px] text-zinc-700 mt-0.5 leading-snug">{proj.description}</p>}
          </div>
        ))}
      </Section>
    ),
    certifications: certifications.length > 0 && (
      <Section title="Certifications & Awards">
        {certifications.map(c => (
          <div key={c.id} className="mb-1.5 last:mb-0 text-[10px]">
            <span className="font-semibold text-teal-900">{c.name}</span>
            {c.issuer && <span className="text-zinc-600"> — {c.issuer}</span>}
            {c.date && <span className="text-zinc-500 text-[9px]"> ({c.date})</span>}
          </div>
        ))}
      </Section>
    ),
  };

  return (
    <div className="font-resume-serif text-[10.5px] leading-[1.6] text-zinc-800">
      {/* Centered academic header */}
      <div className="text-center pb-3 mb-3 border-b-2 border-teal-800">
        {p.fullName && <h1 className="text-[22px] font-bold tracking-wide text-teal-900">{p.fullName}</h1>}
        <div className="text-[9.5px] text-zinc-600 mt-1 leading-relaxed">
          {[p.email, p.phone, p.location].filter(Boolean).map((item, i) => <span key={i}>{item}{i < 2 && ' · '}</span>)}
        </div>
        <div className="text-[9.5px] text-teal-700 mt-0.5">
          {[p.website, p.linkedin, p.github].filter(Boolean).join(' · ')}
        </div>
      </div>
      {p.summary && <Section title="Research Statement"><p className="text-[10.5px] text-zinc-700 text-justify leading-relaxed">{p.summary}</p></Section>}
      {order.map((id) => <div key={id}>{sections[id]}</div>)}
    </div>
  );
};

export default AcademicTemplate;
