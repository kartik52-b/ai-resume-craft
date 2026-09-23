import { type ResumeData, type SectionId } from '@/types/resume';
import { resolveSectionOrder, isSectionHidden } from '@/lib/sections';

const ResearchTemplate = ({ data }: { data: ResumeData }) => {
  const { personal: p, experience, education, skills, projects, certifications } = data;
  const order = resolveSectionOrder(data).filter((id) => !isSectionHidden(data, id) && id !== 'personal');

  const renderSection = (id: SectionId): React.ReactNode => {
    switch (id) {
      case 'experience': return experience.length > 0 && (
        <div className="mb-3 break-inside-avoid">
          <h2 className="text-[11px] font-bold text-teal-800 border-b border-teal-300 pb-0.5 mb-1.5">Research & Experience</h2>
          {experience.map(exp => (
            <div key={exp.id} className="mb-2.5 last:mb-0">
              <div className="flex justify-between items-baseline"><span className="font-bold text-gray-900 text-[12px]">{exp.position}</span><span className="text-[9px] text-gray-400 italic">{exp.startDate}{exp.startDate && (exp.endDate || exp.current) && ' – '}{exp.current ? 'Present' : exp.endDate}</span></div>
              <div className="text-[10px] text-teal-700">{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
              {exp.bullets.filter(Boolean).length > 0 && <ul className="mt-1 space-y-0.5 list-disc list-outside ml-3.5 text-[10.5px] text-gray-600">{exp.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}</ul>}
            </div>
          ))}
        </div>
      );
      case 'education': return education.length > 0 && (
        <div className="mb-3">
          <h2 className="text-[11px] font-bold text-teal-800 border-b border-teal-300 pb-0.5 mb-1.5">Education</h2>
          {education.map(edu => <div key={edu.id} className="mb-1.5 last:mb-0"><div className="flex justify-between items-baseline"><div><span className="font-bold text-gray-900">{edu.school}</span>{(edu.degree || edu.field) && <span className="text-gray-500 text-[10px]"> — {[edu.degree, edu.field].filter(Boolean).join(', ')}</span>}</div><span className="text-[9px] text-gray-400 italic">{edu.startDate}{edu.startDate && edu.endDate && ' – '}{edu.endDate}</span></div>{edu.gpa && <div className="text-[9px] text-gray-400">GPA: {edu.gpa}</div>}</div>)}
        </div>
      );
      case 'skills': return skills.length > 0 && (
        <div className="mb-3">
          <h2 className="text-[11px] font-bold text-teal-800 border-b border-teal-300 pb-0.5 mb-1.5">Research Skills</h2>
          <p className="text-[10.5px] text-gray-600">{skills.join(' · ')}</p>
        </div>
      );
      case 'projects': return projects.length > 0 && (
        <div className="mb-3 break-inside-avoid">
          <h2 className="text-[11px] font-bold text-teal-800 border-b border-teal-300 pb-0.5 mb-1.5">Publications & Projects</h2>
          {projects.map(proj => <div key={proj.id} className="mb-2 last:mb-0"><span className="font-semibold text-gray-900 text-[11px]">{proj.name}</span>{proj.technologies && <span className="text-[9px] text-teal-600 ml-1">{proj.technologies}</span>}{proj.description && <p className="text-[10.5px] text-gray-600 mt-0.5 italic">{proj.description}</p>}</div>)}
        </div>
      );
      case 'certifications': return certifications.length > 0 && (
        <div className="mb-3">
          <h2 className="text-[11px] font-bold text-teal-800 border-b border-teal-300 pb-0.5 mb-1.5">Certifications & Awards</h2>
          {certifications.map(cert => <div key={cert.id} className="mb-1 last:mb-0"><span className="font-semibold text-gray-900 text-[10.5px]">{cert.name}</span>{cert.issuer && <span className="text-gray-500 text-[10px]"> — {cert.issuer}</span>}<span className="text-[9px] text-gray-400 ml-2">{cert.date}</span></div>)}
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="font-serif text-[10.5px] leading-[1.6] text-gray-800">
      <div className="mb-4">
        {p.fullName && <h1 className="text-xl font-bold text-gray-900">{p.fullName}</h1>}
        {p.headline && <div className="text-[10px] text-teal-700 mt-0.5">{p.headline}</div>}
        <div className="text-[9.5px] text-gray-400 mt-1 flex flex-wrap gap-x-2">
          {p.email && <span>{p.email}</span>}{p.phone && <span>| {p.phone}</span>}{p.location && <span>| {p.location}</span>}{p.linkedin && <span>| {p.linkedin}</span>}{p.github && <span>| {p.github}</span>}
        </div>
        {p.summary && <p className="mt-2 text-gray-500 text-[10.5px]">{p.summary}</p>}
      </div>
      {order.map((id) => <div key={id}>{renderSection(id)}</div>)}
    </div>
  );
};

export default ResearchTemplate;
