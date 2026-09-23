import { type ResumeData, type SectionId } from '@/types/resume';
import { resolveSectionOrder, isSectionHidden } from '@/lib/sections';

const LegalTemplate = ({ data }: { data: ResumeData }) => {
  const { personal: p, experience, education, skills, projects, certifications } = data;
  const order = resolveSectionOrder(data).filter((id) => !isSectionHidden(data, id) && id !== 'personal');

  const renderSection = (id: SectionId): React.ReactNode => {
    switch (id) {
      case 'experience': return experience.length > 0 && (
        <div className="mb-3 break-inside-avoid">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-stone-800 border-b border-stone-400 pb-0.5 mb-1.5">Professional Experience</h2>
          {experience.map(exp => (
            <div key={exp.id} className="mb-2.5 last:mb-0">
              <div className="flex justify-between items-baseline"><span className="font-bold text-stone-900 text-[12px]">{exp.position}</span><span className="text-[9px] text-stone-400 italic">{exp.startDate}{exp.startDate && (exp.endDate || exp.current) && ' – '}{exp.current ? 'Present' : exp.endDate}</span></div>
              <div className="text-[10px] text-stone-600 italic">{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
              {exp.bullets.filter(Boolean).length > 0 && <ul className="mt-1 space-y-0.5 list-disc list-outside ml-3.5 text-[10.5px] text-stone-600">{exp.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}</ul>}
            </div>
          ))}
        </div>
      );
      case 'education': return education.length > 0 && (
        <div className="mb-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-stone-800 border-b border-stone-400 pb-0.5 mb-1.5">Education</h2>
          {education.map(edu => <div key={edu.id} className="mb-1.5 last:mb-0"><div className="flex justify-between items-baseline"><span className="font-bold text-stone-900">{edu.school}</span><span className="text-[9px] text-stone-400 italic">{edu.startDate}{edu.startDate && edu.endDate && ' – '}{edu.endDate}</span></div>{(edu.degree || edu.field) && <div className="text-[10px] text-stone-600">{[edu.degree, edu.field].filter(Boolean).join(', ')}</div>}{edu.gpa && <div className="text-[9px] text-stone-400">GPA: {edu.gpa}</div>}</div>)}
        </div>
      );
      case 'skills': return skills.length > 0 && (
        <div className="mb-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-stone-800 border-b border-stone-400 pb-0.5 mb-1.5">Areas of Practice</h2>
          <p className="text-[10.5px] text-stone-600">{skills.join('; ')}</p>
        </div>
      );
      case 'certifications': return certifications.length > 0 && (
        <div className="mb-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-stone-800 border-b border-stone-400 pb-0.5 mb-1.5">Bar Admissions & Certifications</h2>
          {certifications.map(cert => <div key={cert.id} className="mb-1 last:mb-0 flex justify-between items-baseline"><div><span className="font-semibold text-stone-900">{cert.name}</span>{cert.issuer && <span className="text-stone-500 text-[10px]"> — {cert.issuer}</span>}</div><span className="text-[9px] text-stone-400 italic">{cert.date}</span></div>)}
        </div>
      );
      case 'projects': return projects.length > 0 && (
        <div className="mb-3 break-inside-avoid">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-stone-800 border-b border-stone-400 pb-0.5 mb-1.5">Publications & Projects</h2>
          {projects.map(proj => <div key={proj.id} className="mb-2 last:mb-0"><span className="font-semibold text-stone-900 text-[11px] italic">{proj.name}</span>{proj.description && <p className="text-[10.5px] text-stone-600 mt-0.5">{proj.description}</p>}</div>)}
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="font-serif text-[10.5px] leading-[1.6] text-stone-800">
      <div className="text-center mb-4 pb-3 border-b border-stone-400">
        {p.fullName && <h1 className="text-xl font-bold text-stone-900 uppercase tracking-wide">{p.fullName}</h1>}
        {p.headline && <div className="text-[10px] italic text-stone-600 mt-0.5">{p.headline}</div>}
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-0.5 mt-1 text-[9.5px] text-stone-400 italic">
          {p.email && <span>{p.email}</span>}{p.phone && <span>· {p.phone}</span>}{p.location && <span>· {p.location}</span>}{p.linkedin && <span>· {p.linkedin}</span>}{p.github && <span>· {p.github}</span>}
        </div>
        {p.summary && <p className="mt-2 text-stone-500 text-[10.5px] italic">{p.summary}</p>}
      </div>
      {order.map((id) => <div key={id}>{renderSection(id)}</div>)}
    </div>
  );
};

export default LegalTemplate;
