import { type ResumeData } from '@/types/resume';
import { ACCENTS, SectionBlocks, Contact, Summary } from './shared';
import { Page } from './layouts';

const accent = ACCENTS.gold;

/** Premium restraint: wide-tracked masthead, serif type, lots of air. */
const ElegantTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  return (
    <Page className="font-resume-serif text-[10.5px] leading-[1.6] text-zinc-800">
      <header className="text-center mb-6">
        {p.fullName && <h1 className="text-[26px] uppercase tracking-[0.14em] text-zinc-900 leading-none">{p.fullName}</h1>}
        {p.headline && <div className="text-[10px] uppercase tracking-[0.3em] text-amber-800 mt-2">{p.headline}</div>}
        <Contact p={p} variant="dot" className="justify-center text-[9px] text-zinc-500 mt-2" />
      </header>
      {p.summary && <Summary text={p.summary} className="text-[10.5px] italic text-zinc-600 mb-6 text-center" />}
      <SectionBlocks
        data={data}
        accent={accent}
        config={{
          heading: 'plain',
          experience: 'standard',
          education: 'standard',
          projects: 'list',
          skills: 'inline',
          certifications: 'inline',
          gap: 'mb-5',
        }}
      />
    </Page>
  );
};

export default ElegantTemplate;
