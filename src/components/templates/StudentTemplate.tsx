import { type ResumeData } from '@/types/resume';
import { resolveSectionOrder, isSectionHidden, sectionMeta } from '@/lib/sections';
import { resumeToSections } from '@/lib/resumeText';

const StudentTemplate = ({ data }: { data: ResumeData }) => {
  const { personal: p } = data;
  const sections = resumeToSections(data);

  return (
    <div className="font-sans text-[10px] leading-[1.5] text-gray-800">
      {/* Header */}
      <div className="text-center mb-4">
        {p.fullName && <h1 className="text-xl font-bold text-slate-900 mb-1">{p.fullName}</h1>}
        {p.headline && <div className="text-[10.5px] font-medium text-slate-600 mb-1">{p.headline}</div>}
        <div className="flex flex-wrap justify-center gap-x-2 text-[9px] text-slate-500">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>•</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>•</span>}
          {p.location && <span>{p.location}</span>}
          {p.linkedin && <span>•</span>}
          {p.linkedin && <span>{p.linkedin}</span>}
          {p.github && <span>•</span>}
          {p.github && <span>{p.github}</span>}
        </div>
      </div>

      {/* Summary */}
      {p.summary && (
        <div className="mb-3 p-2 bg-slate-50 rounded">
          <p className="text-[9.5px] leading-relaxed text-slate-700">{p.summary}</p>
        </div>
      )}

      {/* Sections */}
      {sections.filter(s => s.id !== 'personal').map(section => (
        <div key={section.id} className="mb-3">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1.5">
            {section.title}
          </h2>
          {section.lines.map((line, i) => (
            <p key={i} className="text-[9.5px] leading-relaxed text-slate-700">{line}</p>
          ))}
        </div>
      ))}
    </div>
  );
};

export default StudentTemplate;
