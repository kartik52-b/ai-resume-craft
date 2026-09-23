import { type ResumeData, type SectionId } from '@/types/resume';
import { resolveSectionOrder, isSectionHidden } from '@/lib/sections';

const FinanceTemplate = ({ data }: { data: ResumeData }) => {
  const { personal: p, experience, education, skills, projects, certifications } = data;
  const order = resolveSectionOrder(data).filter((id) => !isSectionHidden(data, id) && id !== 'personal');

  const renderSection = (id: SectionId): React.ReactNode => {
    switch (id) {
      case 'experience': return experience.length > 0 && (
        <div className="mb-3 break-inside-avoid">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-800 mb-1.5 border-b border-gray-300 pb-0.5">Professional Experience</h2>
          {experience.map(exp => (
            <div key={exp.id} className="mb-2.5 last:mb-0">
              <div className="flex justify-between"><span className="font-bold text-gray-900 text-[12px]">{exp.position}</span><span className="text-[9px] text-gray-400 italic">{exp.startDate}{exp.startDate && (exp.endDate || exp.current) && ' – '}{exp.current ? 'Present' : exp.endDate}</span></div>
              <div className="text-[10px] text-gray-500 italic mb-0.5">{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
              {exp.bullets.filter(Boolean).length > 0 && <ul className="space-y-0.5 text-[10.5px] text-gray-600 list-disc list-outside ml-3.5">{exp.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}</ul>}
            </div>
          ))}
        </div>
      );
      case 'education': return education.length > 0 && (
        <div className="mb-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-800 mb-1.5 border-b border-gray-300 pb-0.5">Education</h2>
          {education.map(edu => (
            <div key={edu.id} className="mb-1.5 last:mb-0 flex justify-between items-baseline">
              <div><span className="font-bold text-gray-900">{edu.school}</span>{(edu.degree || edu.field) && <span className="text-gray-500 text-[10px]"> — {[edu.degree, edu.field].filter(Boolean).join(', ')}</span>}</div>
              <span className="text-[9px] text-gray-400 italic">{edu.startDate}{edu.startDate && edu.endDate && ' – '}{edu.endDate}</span>
            </div>
          ))}
        </div>
      );
      case 'skills': return skills.length > 0 && (
        <div className="mb-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-800 mb-1.5 border-b border-gray-300 pb-0.5">Core Competencies</h2>
          <div className="grid grid-cols-3 gap-0.5 text-[10px] text-gray-600">{skills.map((s, i) => <span key={i}>{s}</span>)}</div>
        </div>
      );
      case 'projects': return projects.length > 0 && (
        <div className="mb-3 break-inside-avoid">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-800 mb-1.5 border-b border-gray-300 pb-0.5">Projects</h2>
          {projects.map(proj => (
            <div key={proj.id} className="mb-2 last:mb-0">
              <span className="font-bold text-gray-900 text-[11px]">{proj.name}</span>
              {proj.technologies && <span className="text-[9px] text-gray-400 ml-1">| {proj.technologies}</span>}
              {proj.description && <p className="text-[10.5px] text-gray-600 mt-0.5">{proj.description}</p>}
            </div>
          ))}
        </div>
      );
      case 'certifications': return certifications.length > 0 && (
        <div className="mb-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-800 mb-1.5 border-b border-gray-300 pb-0.5">Certifications</h2>
          {certifications.map(cert => <div key={cert.id} className="mb-1 last:mb-0 flex justify-between"><span className="font-semibold text-gray-900 text-[10.5px]">{cert.name}{cert.issuer ? `, ${cert.issuer}` : ''}</span><span className="text-[9px] text-gray-400 italic">{cert.date}</span></div>)}
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="font-serif text-[10.5px] leading-[1.5] text-gray-800">
      <div className="text-center mb-4 pb-3 border-b-2 border-gray-800">
        {p.fullName && <h1 className="text-xl font-bold text-gray-900 tracking-wide uppercase">{p.fullName}</h1>}
        {p.headline && <div className="text-[10.5px] italic text-gray-600 mt-0.5">{p.headline}</div>}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 mt-1 text-[9.5px] text-gray-500">
          {p.email && <span>{p.email}</span>}{p.phone && <span>· {p.phone}</span>}{p.location && <span>· {p.location}</span>}
          {p.linkedin && <span>· {p.linkedin}</span>}{p.github && <span>· {p.github}</span>}{p.website && <span>· {p.website}</span>}
        </div>
        {p.summary && <p className="mt-2 text-gray-600 text-[10.5px] italic text-center max-w-md mx-auto">{p.summary}</p>}
      </div>
      {order.map((id) => <div key={id}>{renderSection(id)}</div>)}
    </div>
  );
};

export default FinanceTemplate;
