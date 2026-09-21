import { type ResumeData } from '@/types/resume';
import { resolveSectionOrder, isSectionHidden } from '@/lib/sections';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-2.5 break-inside-avoid">
    <h2 className="text-[10px] font-bold text-purple-700 uppercase tracking-[0.15em] pb-1 mb-1.5 relative">
      {title}
      <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 to-coral-500 opacity-70" />
    </h2>
    {children}
  </div>
);

const CreativeTemplate = ({ data }: { data: ResumeData }) => {
  const { personal: p, experience, education, skills, projects, certifications } = data;
  const order = resolveSectionOrder(data).filter((id) => !isSectionHidden(data, id) && id !== 'personal');

  const sections: Record<string, React.ReactNode> = {
    experience: experience.length > 0 && (
      <Section title="Experience">
        {experience.map(exp => (
          <div key={exp.id} className="mb-2.5 last:mb-0 break-inside-avoid">
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-zinc-900 text-[11.5px]">{exp.position}</span>
              <span className="text-[9px] text-purple-600 font-medium">{exp.startDate}{(exp.endDate || exp.current) && ` – ${exp.current ? 'Present' : exp.endDate}`}</span>
            </div>
            <div className="text-[10px] text-purple-700 font-semibold italic">{exp.company}{exp.location && ` · ${exp.location}`}</div>
            {exp.bullets.filter(Boolean).length > 0 && (
              <ul className="mt-1 space-y-0.5 text-[10px] text-zinc-700">
                {exp.bullets.filter(Boolean).map((b, i) => <li key={i} className="flex gap-1.5"><span className="text-purple-500">▸</span><span>{b}</span></li>)}
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
            {edu.degree && <span className="text-zinc-600"> — {edu.degree}{edu.field && ` in ${edu.field}`}</span>}
            {edu.gpa && <span className="text-zinc-500"> (GPA: {edu.gpa})</span>}
          </div>
        ))}
      </Section>
    ),
    skills: skills.length > 0 && (
      <Section title="Skills">
        <div className="flex flex-wrap gap-1">
          {skills.map((s, i) => <span key={i} className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">{s}</span>)}
        </div>
      </Section>
    ),
    projects: projects.length > 0 && (
      <Section title="Projects">
        {projects.map(proj => (
          <div key={proj.id} className="mb-1.5 last:mb-0 text-[10px] break-inside-avoid">
            <span className="font-bold text-zinc-900">{proj.name}</span>
            {proj.technologies && <span className="text-purple-600 italic"> — {proj.technologies}</span>}
            {proj.description && <p className="text-zinc-600 mt-0.5">{proj.description}</p>}
          </div>
        ))}
      </Section>
    ),
    certifications: certifications.length > 0 && (
      <Section title="Certifications">
        {certifications.map(c => (
          <div key={c.id} className="mb-1 last:mb-0 text-[10px]"><span className="font-semibold text-zinc-900">{c.name}</span>{c.issuer && <span className="text-zinc-600"> · {c.issuer}</span>}{c.date && <span className="text-zinc-500"> — {c.date}</span>}</div>
        ))}
      </Section>
    ),
  };

  return (
    <div className="font-resume-sans text-[10.5px] leading-[1.5] text-zinc-700">
      <div className="text-left pb-3 mb-3 border-b-2 border-purple-500 relative">
        <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-coral-100 -z-10" />
        {p.fullName && <h1 className="text-[24px] font-extrabold tracking-tight bg-gradient-to-r from-purple-700 to-coral-500 bg-clip-text text-transparent leading-tight">{p.fullName}</h1>}
        <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1.5 text-[9.5px] text-zinc-600">
          {[p.email, p.phone, p.location].filter(Boolean).map((item, i) => <span key={i}>{item}</span>)}
          {[p.website, p.linkedin, p.github].filter(Boolean).map((item, i) => <span key={`l${i}`} className="text-purple-600">{item}</span>)}
        </div>
      </div>
      {p.summary && <Section title="About Me"><p className="text-[10.5px] text-zinc-700 leading-relaxed">{p.summary}</p></Section>}
      {order.map((id) => <div key={id}>{sections[id]}</div>)}
    </div>
  );
};

export default CreativeTemplate;
