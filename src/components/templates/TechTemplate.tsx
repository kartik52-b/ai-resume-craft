import { type ResumeData } from '@/types/resume';
import { resolveSectionOrder, isSectionHidden, sectionMeta } from '@/lib/sections';
import { resumeToSections } from '@/lib/resumeText';

const TechTemplate = ({ data }: { data: ResumeData }) => {
  const { personal: p } = data;
  const sections = resumeToSections(data);

  return (
    <div className="font-mono text-[9.5px] leading-[1.55] text-gray-800">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between">
          {p.fullName && <h1 className="text-lg font-bold text-black">{p.fullName}</h1>}
        </div>
        <div className="text-[8.5px] text-gray-500 mt-0.5">
          {[p.email, p.phone, p.location, p.website, p.linkedin, p.github].filter(Boolean).join(' · ')}
        </div>
      </div>

      {/* Skills bar (if present, always show first for tech roles) */}
      {data.skills.length > 0 && !isSectionHidden(data, 'skills') && (
        <div className="mb-3 p-2 bg-gray-50 border-l-2 border-gray-300">
          <div className="text-[8.5px] font-bold uppercase tracking-widest text-gray-500 mb-1">Tech Stack</div>
          <p className="text-[9px] leading-relaxed">{data.skills.join(' · ')}</p>
        </div>
      )}

      {/* Summary */}
      {p.summary && !isSectionHidden(data, 'personal') && (
        <div className="mb-3">
          <p className="text-[9.5px] leading-relaxed">{p.summary}</p>
        </div>
      )}

      {/* Sections */}
      {sections.filter(s => s.id !== 'personal' && s.id !== 'skills').map(section => (
        <div key={section.id} className="mb-3">
          <h2 className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">{section.title}</h2>
          {section.lines.map((line, i) => (
            <p key={i} className="text-[9.5px] leading-relaxed">{line}</p>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TechTemplate;
