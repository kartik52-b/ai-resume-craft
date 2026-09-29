import { type ResumeData } from '@/types/resume';
import { ACCENTS, SectionBlocks, Contact, Summary } from './shared';
import { Page } from './layouts';

const accent = ACCENTS.steel;

/** Structured and enumerable: numbered sections, grid skills, technical detail. */
const EngineeringTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  return (
    <Page className="font-resume-sans text-[10.5px] leading-[1.45] text-zinc-800">
      <header className="mb-3.5 pb-2 border-b border-zinc-300">
        {p.fullName && <h1 className="text-[22px] font-bold text-zinc-900 leading-none">{p.fullName}</h1>}
        {p.headline && <div className="text-[10.5px] font-medium text-zinc-600 mt-1">{p.headline}</div>}
        <Contact p={p} variant="pipes" className="text-[9px] text-zinc-500 mt-1.5" />
      </header>
      {p.summary && <Summary text={p.summary} className="text-[10.5px] text-zinc-600 mb-3" />}
      <SectionBlocks
        data={data}
        accent={accent}
        config={{
          heading: 'numbered',
          experience: 'standard',
          education: 'twoline',
          projects: 'list',
          skills: 'grid',
          certifications: 'grid',
          gap: 'mb-3',
        }}
      />
    </Page>
  );
};

export default EngineeringTemplate;
