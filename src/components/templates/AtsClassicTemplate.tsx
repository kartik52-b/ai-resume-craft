import { type ResumeData } from '@/types/resume';
import { resolveSectionOrder, isSectionHidden, sectionMeta } from '@/lib/sections';
import { resumeToSections } from '@/lib/resumeText';

const AtsClassicTemplate = ({ data }: { data: ResumeData }) => {
  const { personal: p } = data;
  const order = resolveSectionOrder(data);
  const sections = resumeToSections(data);

  return (
    <div className="font-sans text-[10px] leading-[1.6] text-gray-800">
      {/* Header */}
      <div className="mb-3 pb-2 border-b border-gray-300">
        {p.fullName && <h1 className="text-lg font-bold text-black mb-0.5">{p.fullName}</h1>}
        <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[9px] text-gray-600">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>| {p.phone}</span>}
          {p.location && <span>| {p.location}</span>}
          {p.website && <span>| {p.website}</span>}
          {p.linkedin && <span>| {p.linkedin}</span>}
          {p.github && <span>| {p.github}</span>}
        </div>
      </div>

      {/* Summary */}
      {p.summary && (
        <div className="mb-3">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-black mb-1">Summary</h2>
          <p className="text-[9.5px] leading-relaxed">{p.summary}</p>
        </div>
      )}

      {/* Sections */}
      {order.filter(id => id !== 'personal').map(id => {
        const section = sections.find(s => s.id === id);
        if (!section || isSectionHidden(data, id)) return null;
        return (
          <div key={id} className="mb-3">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-black mb-1">{section.title}</h2>
            {section.lines.map((line, i) => (
              <p key={i} className="text-[9.5px] leading-relaxed">{line}</p>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default AtsClassicTemplate;
