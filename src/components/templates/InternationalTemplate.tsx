import { type ResumeData, type SectionId } from '@/types/resume';
import { resolveSectionOrder, isSectionHidden } from '@/lib/sections';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

const InternationalTemplate = ({ data }: { data: ResumeData }) => {
  const { personal: p, experience, education, skills, projects, certifications } = data;
  const order = resolveSectionOrder(data).filter((id) => !isSectionHidden(data, id) && id !== 'personal');

  const renderSection = (id: SectionId): React.ReactNode => {
    switch (id) {
      case 'experience': return experience.length > 0 && (
        <div className="mb-3 break-inside-avoid">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5 pb-0.5 border-b-2 border-slate-300">Work Experience</h2>
          {experience.map(exp => (
            <div key={exp.id} className="mb-2.5 last:mb-0">
              <div className="flex justify-between items-baseline"><span className="font-bold text-gray-900 text-[12px]">{exp.position}</span><span className="text-[9px] text-gray-400">{exp.startDate}{exp.startDate && (exp.endDate || exp.current) && ' – '}{exp.current ? 'Present' : exp.endDate}</span></div>
              <div className="text-[10px] text-slate-600">{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
              {exp.bullets.filter(Boolean).length > 0 && <ul className="mt-1 space-y-0.5 list-disc list-outside ml-3.5 text-[10.5px] text-gray-600">{exp.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}</ul>}
            </div>
          ))}
        </div>
      );
      case 'education': return education.length > 0 && (
        <div className="mb-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5 pb-0.5 border-b-2 border-slate-300">Education</h2>
          {education.map(edu => <div key={edu.id} className="mb-1.5 last:mb-0"><div className="flex justify-between items-baseline"><span className="font-bold text-gray-900">{edu.school}</span><span className="text-[9px] text-gray-400">{edu.startDate}{edu.startDate && edu.endDate && ' – '}{edu.endDate}</span></div>{(edu.degree || edu.field) && <div className="text-[10px] text-gray-500">{[edu.degree, edu.field].filter(Boolean).join(', ')}</div>}{edu.gpa && <div className="text-[9px] text-gray-400">GPA: {edu.gpa}</div>}</div>)}
        </div>
      );
      case 'skills': return skills.length > 0 && (
        <div className="mb-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5 pb-0.5 border-b-2 border-slate-300">Skills & Competencies</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10.5px] text-gray-600">{skills.map((s, i) => <span key={i}>• {s}</span>)}</div>
        </div>
      );
      case 'projects': return projects.length > 0 && (
        <div className="mb-3 break-inside-avoid">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5 pb-0.5 border-b-2 border-slate-300">Projects</h2>
          {projects.map(proj => <div key={proj.id} className="mb-2 last:mb-0"><div className="flex items-baseline gap-2"><span className="font-bold text-gray-900 text-[11px]">{proj.name}</span>{proj.technologies && <span className="text-[9px] text-slate-500">{proj.technologies}</span>}</div>{proj.description && <p className="text-[10.5px] text-gray-600 mt-0.5">{proj.description}</p>}</div>)}
        </div>
      );
      case 'certifications': return certifications.length > 0 && (
        <div className="mb-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5 pb-0.5 border-b-2 border-slate-300">Certifications</h2>
          {certifications.map(cert => <div key={cert.id} className="mb-1 last:mb-0 flex justify-between items-baseline"><div><span className="font-semibold text-gray-900">{cert.name}</span>{cert.issuer && <span className="text-gray-500 text-[10px]"> — {cert.issuer}</span>}</div><span className="text-[9px] text-gray-400">{cert.date}</span></div>)}
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="font-resume-sans text-[10.5px] leading-[1.5] text-gray-800">
      <div className="mb-4">
        {p.fullName && <h1 className="text-xl font-bold text-gray-900 tracking-tight">{p.fullName}</h1>}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-[9.5px] text-gray-400">
          {p.email && <span className="flex items-center gap-1"><Mail className="h-2.5 w-2.5" />{p.email}</span>}
          {p.phone && <span className="flex items-center gap-1"><Phone className="h-2.5 w-2.5" />{p.phone}</span>}
          {p.location && <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{p.location}</span>}
          {p.website && <span className="flex items-center gap-1"><Globe className="h-2.5 w-2.5" />{p.website}</span>}
          {p.linkedin && <span className="flex items-center gap-1"><Linkedin className="h-2.5 w-2.5" />{p.linkedin}</span>}
          {p.github && <span className="flex items-center gap-1"><Github className="h-2.5 w-2.5" />{p.github}</span>}
        </div>
        {p.summary && <p className="mt-2 text-gray-500 text-[10.5px]">{p.summary}</p>}
      </div>
      {order.map((id) => <div key={id}>{renderSection(id)}</div>)}
    </div>
  );
};

export default InternationalTemplate;
