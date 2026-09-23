import { type ResumeData, type SectionId } from '@/types/resume';
import { resolveSectionOrder, isSectionHidden } from '@/lib/sections';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

const Section = ({ title, accent, children }: { title: string; accent?: boolean; children: React.ReactNode }) => (
  <div className="mb-3 break-inside-avoid">
    <h2 className={`text-[11px] font-bold uppercase tracking-wider ${accent ? 'text-indigo-600' : 'text-slate-800'} border-b-2 ${accent ? 'border-indigo-300' : 'border-slate-200'} pb-0.5 mb-1.5`}>{title}</h2>
    {children}
  </div>
);

const StartupTemplate = ({ data }: { data: ResumeData }) => {
  const { personal: p, experience, education, skills, projects, certifications } = data;
  const order = resolveSectionOrder(data).filter((id) => !isSectionHidden(data, id) && id !== 'personal');

  const sections: Record<SectionId, React.ReactNode> = {
    personal: null,
    experience: experience.length > 0 && (
      <Section title="Experience" accent>
        {experience.map(exp => (
          <div key={exp.id} className="mb-2.5 last:mb-0 break-inside-avoid">
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-slate-900">{exp.position}</span>
              <span className="text-[10px] text-slate-400">{exp.startDate}{exp.startDate && (exp.endDate || exp.current) && ' – '}{exp.current ? 'Present' : exp.endDate}</span>
            </div>
            {exp.company && <div className="text-[10px] text-indigo-600 font-medium">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>}
            {exp.bullets.filter(Boolean).length > 0 && (
              <ul className="mt-1 space-y-0.5 list-none text-[11px] text-slate-600">
                {exp.bullets.filter(Boolean).map((b, i) => <li key={i} className="flex gap-1.5"><span className="text-indigo-400 shrink-0">→</span><span>{b}</span></li>)}
              </ul>
            )}
          </div>
        ))}
      </Section>
    ),
    education: education.length > 0 && (
      <Section title="Education">
        {education.map(edu => (
          <div key={edu.id} className="mb-1.5 last:mb-0 flex justify-between items-baseline">
            <div>
              <span className="font-semibold text-slate-900">{edu.school}</span>
              {(edu.degree || edu.field) && <span className="text-slate-500 text-[11px]"> — {[edu.degree, edu.field].filter(Boolean).join(' in ')}</span>}
              {edu.gpa && <span className="text-slate-400 text-[10px]"> · GPA: {edu.gpa}</span>}
            </div>
            <span className="text-[10px] text-slate-400">{edu.startDate}{edu.startDate && edu.endDate && ' – '}{edu.endDate}</span>
          </div>
        ))}
      </Section>
    ),
    skills: skills.length > 0 && (
      <Section title="Skills">
        <div className="flex flex-wrap gap-1">
          {skills.map((s, i) => <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-medium">{s}</span>)}
        </div>
      </Section>
    ),
    projects: projects.length > 0 && (
      <Section title="Projects" accent>
        {projects.map(proj => (
          <div key={proj.id} className="mb-2 last:mb-0 break-inside-avoid">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-slate-900">{proj.name}</span>
              {proj.link && <span className="text-[9px] text-indigo-500">{proj.link}</span>}
            </div>
            {proj.technologies && <div className="text-[9px] text-indigo-500 font-medium mb-0.5">{proj.technologies}</div>}
            {proj.description && <p className="text-[11px] text-slate-600">{proj.description}</p>}
          </div>
        ))}
      </Section>
    ),
    certifications: certifications.length > 0 && (
      <Section title="Certifications">
        {certifications.map(cert => (
          <div key={cert.id} className="mb-1 last:mb-0 flex justify-between items-baseline">
            <div><span className="font-semibold text-slate-900">{cert.name}</span>{cert.issuer && <span className="text-slate-500 text-[10px]"> — {cert.issuer}</span>}</div>
            <span className="text-[10px] text-slate-400">{cert.date}</span>
          </div>
        ))}
      </Section>
    ),
  };

  return (
    <div className="font-resume-sans text-[11px] leading-[1.5] text-slate-800">
      <div className="mb-4">
        {p.fullName && <h1 className="text-xl font-extrabold tracking-tight text-slate-900">{p.fullName}</h1>}
        {p.headline && <div className="text-[11px] font-semibold text-indigo-600 mt-0.5">{p.headline}</div>}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[10px] text-slate-400">
          {p.email && <span className="flex items-center gap-1"><Mail className="h-2.5 w-2.5" />{p.email}</span>}
          {p.phone && <span className="flex items-center gap-1"><Phone className="h-2.5 w-2.5" />{p.phone}</span>}
          {p.location && <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{p.location}</span>}
          {p.website && <span className="flex items-center gap-1"><Globe className="h-2.5 w-2.5" />{p.website}</span>}
          {p.linkedin && <span className="flex items-center gap-1"><Linkedin className="h-2.5 w-2.5" />{p.linkedin}</span>}
          {p.github && <span className="flex items-center gap-1"><Github className="h-2.5 w-2.5" />{p.github}</span>}
        </div>
        {p.summary && <p className="mt-2 text-slate-500 text-[11px]">{p.summary}</p>}
      </div>
      {order.map((id) => <div key={id}>{sections[id]}</div>)}
    </div>
  );
};

export default StartupTemplate;
