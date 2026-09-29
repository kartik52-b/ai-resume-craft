import { type ResumeData, type SectionId } from '@/types/resume';
import { resolveSectionOrder, isSectionHidden } from '@/lib/sections';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-3 break-inside-avoid">
    <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900 border-b border-zinc-200 pb-0.5 mb-1.5">{title}</h2>
    {children}
  </div>
);

const ModernTemplate = ({ data }: { data: ResumeData }) => {
  const { personal: p, experience, education, skills, projects, certifications } = data;
  const hasContact = p.email || p.phone || p.location || p.website || p.linkedin || p.github;
  const order = resolveSectionOrder(data).filter((id) => !isSectionHidden(data, id) && id !== 'personal');

  const sections: Record<SectionId, React.ReactNode> = {
    personal: null,
    experience: experience.length > 0 && (
      <Section title="Experience">
        {experience.map(exp => (
          <div key={exp.id} className="mb-2.5 last:mb-0 break-inside-avoid">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="font-semibold text-zinc-900">{exp.position}</span>
                {exp.company && <span className="text-zinc-500"> · {exp.company}</span>}
              </div>
              <span className="text-[10px] text-zinc-400 shrink-0 ml-2">
                {exp.startDate}{exp.startDate && (exp.endDate || exp.current) && ' – '}{exp.current ? 'Present' : exp.endDate}
              </span>
            </div>
            {exp.location && <div className="text-[10px] text-zinc-400">{exp.location}</div>}
            {exp.bullets.filter(Boolean).length > 0 && (
              <ul className="mt-1 space-y-0.5 list-disc list-outside ml-3.5">
                {exp.bullets.filter(Boolean).map((b, i) => <li key={i} className="text-zinc-600">{b}</li>)}
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
              <span className="font-semibold text-zinc-900">{edu.school}</span>
              {(edu.degree || edu.field) && (
                <span className="text-zinc-500"> — {[edu.degree, edu.field].filter(Boolean).join(' in ')}</span>
              )}
              {edu.gpa && <span className="text-zinc-400 text-[10px]"> (GPA: {edu.gpa})</span>}
            </div>
            <span className="text-[10px] text-zinc-400 shrink-0 ml-2">
              {edu.startDate}{edu.startDate && edu.endDate && ' – '}{edu.endDate}
            </span>
          </div>
        ))}
      </Section>
    ),
    skills: skills.length > 0 && (
      <Section title="Skills">
        <p className="text-zinc-600">{skills.join(' · ')}</p>
      </Section>
    ),
    projects: projects.length > 0 && (
      <Section title="Projects">
        {projects.map(proj => (
          <div key={proj.id} className="mb-2 last:mb-0 break-inside-avoid">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-zinc-900">{proj.name}</span>
              {proj.link && <span className="text-[10px] text-zinc-400">{proj.link}</span>}
            </div>
            {proj.technologies && <div className="text-[10px] text-zinc-400 italic">{proj.technologies}</div>}
            {proj.description && <p className="text-zinc-600 mt-0.5">{proj.description}</p>}
          </div>
        ))}
      </Section>
    ),
    certifications: certifications.length > 0 && (
      <Section title="Certifications">
        {certifications.map(cert => (
          <div key={cert.id} className="mb-1 last:mb-0 flex justify-between items-baseline">
            <div>
              <span className="font-semibold text-zinc-900">{cert.name}</span>
              {cert.issuer && <span className="text-zinc-500"> — {cert.issuer}</span>}
            </div>
            <span className="text-[10px] text-zinc-400">{cert.date}</span>
          </div>
        ))}
      </Section>
    ),
  };

  return (
    <div className="font-resume-sans text-[11px] leading-[1.5] text-zinc-800">
      {/* Header (always first) */}
      <div className="text-center mb-4">
        {p.fullName && <h1 className="text-xl font-bold tracking-tight text-zinc-900">{p.fullName}</h1>}
        {p.headline && <div className="text-[11px] font-medium text-zinc-500 mt-0.5">{p.headline}</div>}
        {hasContact && (
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 mt-1.5 text-[10px] text-zinc-500">
            {p.email && <span className="flex items-center gap-1"><Mail className="h-2.5 w-2.5" />{p.email}</span>}
            {p.phone && <span className="flex items-center gap-1"><Phone className="h-2.5 w-2.5" />{p.phone}</span>}
            {p.location && <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{p.location}</span>}
            {p.website && <span className="flex items-center gap-1"><Globe className="h-2.5 w-2.5" />{p.website}</span>}
            {p.linkedin && <span className="flex items-center gap-1"><Linkedin className="h-2.5 w-2.5" />{p.linkedin}</span>}
            {p.github && <span className="flex items-center gap-1"><Github className="h-2.5 w-2.5" />{p.github}</span>}
          </div>
        )}
      </div>

      {order.map((id) => (
        <div key={id}>{sections[id]}</div>
      ))}
    </div>
  );
};

export default ModernTemplate;
