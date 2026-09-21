import { type ResumeData } from '@/types/resume';
import { resolveSectionOrder, isSectionHidden } from '@/lib/sections';

const SideSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-3 break-inside-avoid">
    <h2 className="text-[8.5px] font-bold text-white uppercase tracking-[0.15em] mb-1.5 opacity-90">{title}</h2>
    {children}
  </div>
);

const MainSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-2.5 break-inside-avoid">
    <h2 className="text-[10px] font-bold text-teal-900 uppercase tracking-[0.1em] border-b-2 border-teal-600 pb-0.5 mb-1.5">{title}</h2>
    {children}
  </div>
);

const TwoColumnTemplate = ({ data }: { data: ResumeData }) => {
  const { personal: p, experience, education, skills, projects, certifications } = data;
  const order = resolveSectionOrder(data).filter((id) => !isSectionHidden(data, id) && id !== 'personal');

  // Sidebar gets skills + certifications; main gets experience, education, projects
  const sidebarSkills = skills.length > 0 && (
    <SideSection title="Skills">
      <div className="space-y-0.5 text-[9px] text-teal-50">
        {skills.map((s, i) => <div key={i} className="flex gap-1.5"><span className="text-teal-300">•</span>{s}</div>)}
      </div>
    </SideSection>
  );

  const sidebarCerts = certifications.length > 0 && (
    <SideSection title="Certifications">
      <div className="space-y-1 text-[8.5px] text-teal-50">
        {certifications.map(c => <div key={c.id}><span className="font-semibold">{c.name}</span>{c.issuer && <div className="opacity-75">{c.issuer}</div>}{c.date && <div className="opacity-60 text-[8px]">{c.date}</div>}</div>)}
      </div>
    </SideSection>
  );

  const mainSections: Record<string, React.ReactNode> = {
    experience: experience.length > 0 && (
      <MainSection title="Experience">
        {experience.map(exp => (
          <div key={exp.id} className="mb-2.5 last:mb-0 break-inside-avoid">
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-teal-950 text-[10.5px]">{exp.position}</span>
              <span className="text-[8.5px] text-teal-700">{exp.startDate}{(exp.endDate || exp.current) && ` – ${exp.current ? 'Present' : exp.endDate}`}</span>
            </div>
            <div className="text-[9.5px] text-slate-600 italic">{exp.company}{exp.location && ` · ${exp.location}`}</div>
            {exp.bullets.filter(Boolean).length > 0 && (
              <ul className="mt-1 space-y-0.5 text-[9.5px] text-slate-700">
                {exp.bullets.filter(Boolean).map((b, i) => <li key={i} className="flex gap-1.5"><span className="text-teal-600">▸</span><span>{b}</span></li>)}
              </ul>
            )}
          </div>
        ))}
      </MainSection>
    ),
    education: education.length > 0 && (
      <MainSection title="Education">
        {education.map(edu => (
          <div key={edu.id} className="mb-2 last:mb-0 break-inside-avoid">
            <div className="font-bold text-teal-950 text-[10.5px]">{edu.school}</div>
            <div className="text-[9.5px] text-slate-600">{edu.degree}{edu.field && ` in ${edu.field}`}{edu.gpa && <span className="text-slate-500"> · GPA {edu.gpa}</span>}</div>
            <div className="text-[8.5px] text-teal-700">{edu.startDate}{edu.endDate && ` – ${edu.endDate}`}</div>
          </div>
        ))}
      </MainSection>
    ),
    projects: projects.length > 0 && (
      <MainSection title="Projects">
        {projects.map(proj => (
          <div key={proj.id} className="mb-2 last:mb-0 break-inside-avoid">
            <span className="font-bold text-teal-950 text-[10px]">{proj.name}</span>
            {proj.technologies && <span className="text-[9px] text-teal-700 italic"> — {proj.technologies}</span>}
            {proj.description && <p className="text-[9.5px] text-slate-700 mt-0.5">{proj.description}</p>}
          </div>
        ))}
      </MainSection>
    ),
  };

  // Sections NOT placed in sidebar or main (fallback into main)
  const fallback = order
    .filter(id => !['experience', 'education', 'projects', 'skills', 'certifications'].includes(id))
    .map(id => <div key={id} className="text-[9.5px] text-slate-700">{id}</div>);

  return (
    <div className="font-resume-sans text-[10px] leading-[1.5] flex min-h-[250mm]">
      {/* Teal sidebar */}
      <aside className="w-[34%] bg-teal-800 text-white px-4 py-4 -my-5 -ml-5 shrink-0">
        {p.fullName && <h1 className="text-[17px] font-bold text-white leading-tight mb-0.5">{p.fullName}</h1>}
        <div className="text-[8.5px] text-teal-100 space-y-0.5 mt-2 break-words">
          {p.email && <div>{p.email}</div>}
          {p.phone && <div>{p.phone}</div>}
          {p.location && <div>{p.location}</div>}
        </div>
        <div className="text-[8.5px] text-teal-200 space-y-0.5 mt-1 break-words">
          {p.website && <div>{p.website}</div>}
          {p.linkedin && <div>{p.linkedin}</div>}
          {p.github && <div>{p.github}</div>}
        </div>
        {p.summary && (
          <div className="mt-3">
            <SideSection title="About">
              <p className="text-[8.5px] text-teal-50 leading-relaxed">{p.summary}</p>
            </SideSection>
          </div>
        )}
        {sidebarSkills}
        {sidebarCerts}
      </aside>
      {/* Main content */}
      <div className="flex-1 px-4 py-0">
        {['experience', 'education', 'projects'].map(id => <div key={id}>{mainSections[id]}</div>)}
        {fallback}
      </div>
    </div>
  );
};

export default TwoColumnTemplate;
