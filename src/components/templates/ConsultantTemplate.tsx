import { type ResumeData, type SectionId } from '@/types/resume';
import { resolveSectionOrder, isSectionHidden } from '@/lib/sections';
import { Mail, Phone, MapPin, Linkedin, Github } from 'lucide-react';

const ConsultantTemplate = ({ data }: { data: ResumeData }) => {
  const { personal: p, experience, education, skills, projects, certifications } = data;
  const order = resolveSectionOrder(data).filter((id) => !isSectionHidden(data, id) && id !== 'personal');

  const renderSection = (id: SectionId): React.ReactNode => {
    switch (id) {
      case 'experience': return experience.length > 0 && (
        <div className="mb-3 break-inside-avoid">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-1.5 pb-0.5 border-b border-emerald-200">Engagements</h2>
          {experience.map(exp => (
            <div key={exp.id} className="mb-2.5 last:mb-0">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-gray-900 text-[12px]">{exp.position}{exp.company && <span className="font-normal text-emerald-700"> · {exp.company}</span>}</span>
                <span className="text-[9px] text-gray-400">{exp.startDate}{exp.startDate && (exp.endDate || exp.current) && ' – '}{exp.current ? 'Present' : exp.endDate}</span>
              </div>
              {exp.location && <div className="text-[9px] text-gray-400 italic">{exp.location}</div>}
              {exp.bullets.filter(Boolean).length > 0 && <ul className="mt-1 space-y-0.5 text-[10.5px] text-gray-600 list-none">{exp.bullets.filter(Boolean).map((b, i) => <li key={i} className="flex gap-1.5"><span className="text-emerald-500 shrink-0">•</span>{b}</li>)}</ul>}
            </div>
          ))}
        </div>
      );
      case 'skills': return skills.length > 0 && (
        <div className="mb-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-1.5 pb-0.5 border-b border-emerald-200">Expertise</h2>
          <div className="flex flex-wrap gap-1">{skills.map((s, i) => <span key={i} className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded text-[10px]">{s}</span>)}</div>
        </div>
      );
      case 'education': return education.length > 0 && (
        <div className="mb-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-1.5 pb-0.5 border-b border-emerald-200">Education</h2>
          {education.map(edu => <div key={edu.id} className="mb-1 last:mb-0 flex justify-between items-baseline"><div><span className="font-semibold text-gray-900">{edu.school}</span>{(edu.degree || edu.field) && <span className="text-gray-500 text-[10px]"> — {[edu.degree, edu.field].filter(Boolean).join(' in ')}</span>}</div><span className="text-[9px] text-gray-400">{edu.startDate}{edu.startDate && edu.endDate && ' – '}{edu.endDate}</span></div>)}
        </div>
      );
      case 'projects': return projects.length > 0 && (
        <div className="mb-3 break-inside-avoid">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-1.5 pb-0.5 border-b border-emerald-200">Key Projects</h2>
          {projects.map(proj => <div key={proj.id} className="mb-2 last:mb-0"><div className="flex items-baseline gap-2"><span className="font-bold text-gray-900 text-[11px]">{proj.name}</span>{proj.technologies && <span className="text-[9px] text-emerald-600">{proj.technologies}</span>}</div>{proj.description && <p className="text-[10.5px] text-gray-600 mt-0.5">{proj.description}</p>}</div>)}
        </div>
      );
      case 'certifications': return certifications.length > 0 && (
        <div className="mb-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-1.5 pb-0.5 border-b border-emerald-200">Certifications</h2>
          {certifications.map(cert => <div key={cert.id} className="mb-1 last:mb-0"><span className="font-semibold text-gray-900 text-[10.5px]">{cert.name}</span>{cert.issuer && <span className="text-gray-500 text-[10px]"> — {cert.issuer}</span>}<span className="text-[9px] text-gray-400 ml-2">{cert.date}</span></div>)}
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="font-resume-sans text-[10.5px] leading-[1.5] text-gray-800">
      <div className="mb-4">
        {p.fullName && <h1 className="text-xl font-bold text-gray-900">{p.fullName}</h1>}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[9.5px] text-gray-400">
          {p.email && <span className="flex items-center gap-1"><Mail className="h-2.5 w-2.5" />{p.email}</span>}
          {p.phone && <span className="flex items-center gap-1"><Phone className="h-2.5 w-2.5" />{p.phone}</span>}
          {p.location && <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{p.location}</span>}
          {p.linkedin && <span className="flex items-center gap-1"><Linkedin className="h-2.5 w-2.5" />{p.linkedin}</span>}
          {p.github && <span className="flex items-center gap-1"><Github className="h-2.5 w-2.5" />{p.github}</span>}
        </div>
        {p.summary && <p className="mt-2 text-gray-500 text-[11px]">{p.summary}</p>}
      </div>
      {order.map((id) => <div key={id}>{renderSection(id)}</div>)}
    </div>
  );
};

export default ConsultantTemplate;
