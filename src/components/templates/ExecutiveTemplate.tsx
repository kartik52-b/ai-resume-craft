import { type ResumeData } from '@/types/resume';
import { resolveSectionOrder, isSectionHidden, sectionMeta } from '@/lib/sections';
import { resumeToSections } from '@/lib/resumeText';

const ExecutiveTemplate = ({ data }: { data: ResumeData }) => {
  const { personal: p } = data;
  const sections = resumeToSections(data);

  return (
    <div className="font-serif text-[10.5px] leading-[1.4] text-gray-800">
      {/* Header */}
      <div className="text-center mb-4 pb-3 border-b-2 border-gray-800">
        {p.fullName && <h1 className="text-2xl font-bold text-black tracking-wide mb-1">{p.fullName}</h1>}
        {p.headline && <div className="text-[11px] uppercase tracking-[0.2em] text-gray-600 mb-1">{p.headline}</div>}
        <div className="flex flex-wrap justify-center gap-x-3 text-[9px] text-gray-600 tracking-wide">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
          {p.linkedin && <span>{p.linkedin}</span>}
          {p.github && <span>{p.github}</span>}
        </div>
      </div>

      {/* Summary */}
      {p.summary && (
        <div className="mb-4">
          <p className="text-[10px] leading-relaxed italic text-gray-700">{p.summary}</p>
        </div>
      )}

      {/* Sections */}
      {sections.filter(s => s.id !== 'personal').map(section => (
        <div key={section.id} className="mb-4">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-0.5 mb-2">
            {section.title}
          </h2>
          {section.lines.map((line, i) => (
            <p key={i} className="text-[10.5px] leading-relaxed">{line}</p>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ExecutiveTemplate;
