import { type ResumeData } from '@/types/resume';
import { ACCENTS, SectionBlocks, Contact, Summary } from './shared';
import { Page } from './layouts';

const accent = ACCENTS.charcoal;

/** Authority-forward: dominant name, restrained serif hierarchy, high density. */
const ExecutiveTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  return (
    <Page className="font-resume-serif text-[10px] leading-[1.4] text-zinc-800">
      <header className="text-center mb-3.5 pb-2.5 border-b-4 border-double border-zinc-800">
        {p.fullName && <h1 className="text-[26px] font-bold tracking-wide text-zinc-900 leading-none">{p.fullName}</h1>}
        {p.headline && <div className="text-[10.5px] uppercase tracking-[0.24em] text-zinc-600 mt-1.5">{p.headline}</div>}
        <Contact p={p} variant="dot" className="justify-center text-[9px] text-zinc-600 mt-1.5" />
      </header>
      {p.summary && <Summary text={p.summary} className="text-[10px] italic text-zinc-700 mb-3.5" />}
      <SectionBlocks
        data={data}
        accent={accent}
        config={{
          heading: 'serif',
          experience: 'standard',
          education: 'standard',
          projects: 'list',
          skills: 'inline',
          certifications: 'grid',
          gap: 'mb-3',
        }}
      />
    </Page>
  );
};

export default ExecutiveTemplate;
