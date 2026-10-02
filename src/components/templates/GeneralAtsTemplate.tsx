import { type ResumeData } from '@/types/resume';
import { ACCENTS, SectionBlocks, Contact, Summary } from './shared';
import { Page } from './layouts';

const accent = ACCENTS.steel;

/** The plainest, most readable structure: one column, no graphics, quiet labels. */
const GeneralAtsTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  return (
    <Page className="font-resume-sans text-[10px] leading-[1.45] text-zinc-800">
      <header className="mb-3">
        {p.fullName && <h1 className="text-[20px] font-bold text-zinc-900">{p.fullName}</h1>}
        {p.headline && <div className="text-[10px] font-medium text-zinc-500 mt-0.5">{p.headline}</div>}
        <Contact p={p} variant="pipes" className="text-[9px] text-zinc-500 mt-0.5" />
      </header>
      {p.summary && <Summary text={p.summary} className="text-[10px] text-zinc-600 mb-3" />}
      <SectionBlocks
        data={data}
        accent={accent}
        config={{
          heading: 'plain',
          experience: 'standard',
          education: 'compact',
          projects: 'list',
          skills: 'inline',
          certifications: 'inline',
          gap: 'mb-3',
        }}
      />
    </Page>
  );
};

export default GeneralAtsTemplate;
