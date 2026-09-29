import { type ResumeData } from '@/types/resume';
import { ACCENTS, SectionBlocks, Contact, Summary } from './shared';
import { Page } from './layouts';

const accent = ACCENTS.charcoal;

/** Formal and traditional: centered masthead, serif type, ruled sections. */
const LegalTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  return (
    <Page className="font-resume-serif text-[10.5px] leading-[1.45] text-zinc-800">
      <header className="text-center mb-3 pb-2.5 border-b-4 border-double border-zinc-800">
        {p.fullName && <h1 className="text-[23px] font-bold tracking-wide text-zinc-900">{p.fullName}</h1>}
        {p.headline && <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-600 mt-1">{p.headline}</div>}
        <Contact p={p} variant="pipes" className="justify-center text-[9px] text-zinc-600 mt-1.5" />
      </header>
      {p.summary && <Summary text={p.summary} className="text-[10.5px] text-zinc-700 mb-3" />}
      <SectionBlocks
        data={data}
        accent={accent}
        config={{
          heading: 'rule',
          experience: 'standard',
          education: 'stacked',
          projects: 'list',
          skills: 'inline',
          certifications: 'list',
          gap: 'mb-3',
        }}
      />
    </Page>
  );
};

export default LegalTemplate;
