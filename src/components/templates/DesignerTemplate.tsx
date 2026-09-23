import { type ResumeData, type SectionId } from '@/types/resume';
import { resolveSectionOrder, isSectionHidden } from '@/lib/sections';

const DesignerTemplate = ({ data }: { data: ResumeData }) => {
  const { personal: p, experience, education, skills, projects, certifications } = data;
  const order = resolveSectionOrder(data).filter((id) => !isSectionHidden(data, id) && id !== 'personal');

  const renderSection = (id: SectionId): React.ReactNode => {
    switch (id) {
      case 'experience': return experience.length > 0 && (
        <div className="mb-3 break-inside-avoid">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-rose-700 mb-1.5">Experience</h2>
          {experience.map(exp => (
            <div key={exp.id} className="mb-2.5 last:mb-0">
              <div className="flex justify-between items-baseline"><span className="font-bold text-gray-900 text-[12px]">{exp.position}</span><span className="text-[9px] text-gray-400">{exp.startDate}{exp.startDate && (exp.endDate || exp.current) && ' – '}{exp.current ? 'Present' : exp.endDate}</span></div>
              <div className="text-[10px] text-rose-600">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
              {exp.bullets.filter(Boolean).length > 0 && <ul className="mt-1 space-y-0.5 list-none text-[10.5px] text-gray-600">{exp.bullets.filter(Boolean).map((b, i) => <li key={i} className="pl-3 relative"><span className="absolute left-0 top-1 w-1 h-1 rounded-full bg-rose-300" />{b}</li>)}</ul>}
            </div>
          ))}
        </div>
      );
      case 'skills': return skills.length > 0 && (
        <div className="mb-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-rose-700 mb-1.5">Skills</h2>
          <div className="flex flex-wrap gap-1">{skills.map((s, i) => <span key={i} className="px-2.5 py-0.5 bg-rose-50 text-rose-800 text-[10px] rounded-sm">{s}</span>)}</div>
        </div>
      );
      case 'education': return education.length > 0 && (
        <div className="mb-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-rose-700 mb-1.5">Education</h2>
          {education.map(edu => <div key={edu.id} className="mb-1 last:mb-0"><div className="flex justify-between items-baseline"><span className="font-bold text-gray-900">{edu.school}</span><span className="text-[9px] text-gray-400">{edu.startDate}{edu.startDate && edu.endDate && ' – '}{edu.endDate}</span></div>{(edu.degree || edu.field) && <div className="text-[10px] text-gray-500">{[edu.degree, edu.field].filter(Boolean).join(' in ')}</div>}</div>)}
        </div>
      );
      case 'projects': return projects.length > 0 && (
        <div className="mb-3 break-inside-avoid">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-rose-700 mb-1.5">Projects</h2>
          {projects.map(proj => <div key={proj.id} className="mb-2 last:mb-0"><div className="flex items-baseline gap-2"><span className="font-bold text-gray-900 text-[11px]">{proj.name}</span>{proj.technologies && <span className="text-[9px] text-rose-500">{proj.technologies}</span>}</div>{proj.description && <p className="text-[10.5px] text-gray-600 mt-0.5">{proj.description}</p>}</div>)}
        </div>
      );
      case 'certifications': return certifications.length > 0 && (
        <div className="mb-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-rose-700 mb-1.5">Certifications</h2>
          {certifications.map(cert => <div key={cert.id} className="mb-1 last:mb-0"><span className="font-semibold text-gray-900 text-[10.5px]">{cert.name}</span>{cert.issuer && <span className="text-gray-500 text-[10px]"> — {cert.issuer}</span>}<span className="text-[9px] text-gray-400 ml-2">{cert.date}</span></div>)}
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="font-resume-sans text-[10.5px] leading-[1.5] text-gray-800">
      <div className="flex gap-4">
        {/* Left color bar */}
        <div className="w-1 shrink-0 bg-gradient-to-b from-rose-400 to-pink-400 rounded-full" />
        <div className="flex-1">
          <div className="mb-4">
            {p.fullName && <h1 className="text-xl font-black text-gray-900 tracking-tight">{p.fullName}</h1>}
            {p.headline && <div className="text-[10.5px] font-semibold text-rose-600 mt-0.5">{p.headline}</div>}
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[9.5px] text-gray-400">
              {p.email && <span>{p.email}</span>}{p.phone && <span>· {p.phone}</span>}{p.location && <span>· {p.location}</span>}{p.linkedin && <span>· {p.linkedin}</span>}{p.github && <span>· {p.github}</span>}
            </div>
            {p.summary && <p className="mt-2 text-gray-500 text-[10.5px]">{p.summary}</p>}
          </div>
          {order.map((id) => <div key={id}>{renderSection(id)}</div>)}
        </div>
      </div>
    </div>
  );
};

export default DesignerTemplate;
