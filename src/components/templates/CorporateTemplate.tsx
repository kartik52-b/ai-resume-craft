import { type ResumeData } from '@/types/resume';
import { resolveSectionOrder, isSectionHidden } from '@/lib/sections';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-3 break-inside-avoid">
    <h2 className="text-[10px] font-bold text-blue-900 uppercase tracking-wider bg-blue-50 px-2 py-1 mb-2 border-l-4 border-blue-700">{title}</h2>
    {children}
  </div>
);

const CorporateTemplate = ({ data }: { data: ResumeData }) => {
  const { personal: p, experience, education, skills, projects, certifications } = data;
  const order = resolveSectionOrder(data).filter((id) => !isSectionHidden(data, id) && id !== 'personal');

  const sections: Record<string, React.ReactNode> = {
    experience: experience.length > 0 && (
      <Section title="Professional Experience">
        {experience.map(exp => (
          <div key={exp.id} className="mb-3 last:mb-0 break-inside-avoid">
            <div className="flex justify-between items-baseline border-b border-blue-100 pb-1 mb-1.5">
              <div>
                <span className="font-bold text-blue-950 text-[11px]">{exp.position}</span>
                <span className="text-[10px] text-blue-700 font-medium"> · {exp.company}</span>
              </div>
              <span className="text-[9px] text-blue-600 font-medium">{exp.startDate}{(exp.endDate || exp.current) && ` – ${exp.current ? 'Present' : exp.endDate}`}</span>
            </div>
            {exp.location && <div className="text-[9px] text-slate-500 italic mb-1">{exp.location}</div>}
            {exp.bullets.filter(Boolean).length > 0 && (
              <ul className="space-y-1 text-[10px] text-slate-700 list-disc list-outside ml-4">
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
          <div key={edu.id} className="mb-2 last:mb-0 break-inside-avoid">
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-blue-950 text-[10.5px]">{edu.school}</span>
              <span className="text-[9px] text-blue-600">{edu.startDate}{edu.endDate && ` – ${edu.endDate}`}</span>
            </div>
            <div className="text-[10px] text-slate-700">{edu.degree}{edu.field && ` in ${edu.field}`}</div>
            {edu.gpa && <div className="text-[9px] text-slate-500">GPA: {edu.gpa}</div>}
          </div>
        ))}
      </Section>
    ),
    skills: skills.length > 0 && (
      <Section title="Core Competencies">
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[10px] text-slate-700">
          {skills.map((s, i) => <div key={i} className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-blue-600 shrink-0" />{s}</div>)}
        </div>
      </Section>
    ),
    projects: projects.length > 0 && (
      <Section title="Key Projects">
        {projects.map(proj => (
          <div key={proj.id} className="mb-2 last:mb-0 break-inside-avoid">
            <div className="flex justify-between items-baseline"><span className="font-bold text-blue-950 text-[10.5px]">{proj.name}</span>{proj.technologies && <span className="text-[9px] text-blue-600 italic">{proj.technologies}</span>}</div>
            {proj.description && <p className="text-[10px] text-slate-700 mt-0.5">{proj.description}</p>}
          </div>
        ))}
      </Section>
    ),
    certifications: certifications.length > 0 && (
      <Section title="Certifications">
        {certifications.map(c => (
          <div key={c.id} className="mb-1.5 last:mb-0 flex justify-between text-[10px]">
            <span><span className="font-semibold text-blue-950">{c.name}</span>{c.issuer && <span className="text-slate-600"> · {c.issuer}</span>}</span>
            {c.date && <span className="text-[9px] text-blue-600">{c.date}</span>}
          </div>
        ))}
      </Section>
    ),
  };

  return (
    <div className="font-resume-sans text-[10.5px] leading-[1.55] text-slate-700">
      {/* Structured header with left accent bar */}
      <div className="flex gap-3 pb-3 mb-3 border-b-2 border-blue-800">
        <div className="w-1 bg-blue-700 rounded-full shrink-0" />
        <div className="flex-1">
          {p.fullName && <h1 className="text-[21px] font-bold text-blue-950 tracking-tight leading-tight">{p.fullName}</h1>}
          {p.headline && <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 mt-0.5">{p.headline}</div>}
          <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 mt-1 text-[9.5px] text-slate-600">
            {[p.email, p.phone, p.location].filter(Boolean).map((item, i) => <span key={i}>{item}</span>)}
          </div>
          <div className="flex flex-wrap gap-x-2.5 mt-0.5 text-[9.5px] text-blue-700">
            {[p.website, p.linkedin, p.github].filter(Boolean).map((item, i) => <span key={`l${i}`}>{item}</span>)}
          </div>
        </div>
      </div>
      {p.summary && <Section title="Executive Summary"><p className="text-[10.5px] text-slate-700 leading-relaxed">{p.summary}</p></Section>}
      {order.map((id) => <div key={id}>{sections[id]}</div>)}
    </div>
  );
};

export default CorporateTemplate;
