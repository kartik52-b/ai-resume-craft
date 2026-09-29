import { type ResumeData } from '@/types/resume';
import { ACCENTS, SectionBlocks, Contact, Summary } from './shared';
import { Page } from './layouts';

const accent = ACCENTS.charcoal;

/**
 * Classic Clean — the most literal, highly readable layout in the collection.
 * One column, no graphics, plain quiet section labels, generous line height.
 */
const AtsClassicTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  return (
    <Page className="font-resume-sans text-[10.5px] leading-[1.55] text-zinc-800">
      <header className="mb-3">
        {p.fullName && <h1 className="text-[20px] font-bold text-black">{p.fullName}</h1>}
        {p.headline && <div className="text-[10.5px] text-zinc-700">{p.headline}</div>}
        <Contact p={p} variant="pipes" className="text-[9.5px] text-zinc-600 mt-1" />
        <div className="mt-2 h-px bg-zinc-300" />
      </header>
      {p.summary && <Summary text={p.summary} className="text-[10.5px] text-zinc-700 mb-3" />}
      <SectionBlocks
        data={data}
        accent={accent}
        config={{
          heading: 'plain',
          experience: 'standard',
          education: 'standard',
          projects: 'list',
          skills: 'inline',
          certifications: 'list',
          gap: 'mb-3',
        }}
      />
    </Page>
  );
};

export default AtsClassicTemplate;
