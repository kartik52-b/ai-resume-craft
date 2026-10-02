import { type ResumeData } from '@/types/resume';
import { ACCENTS, SectionBlocks, Contact, Summary } from './shared';
import { Page } from './layouts';

const accent = ACCENTS.charcoal;

/** Serif, centered masthead with a double rule, quiet ruled sections and a lot of air. */
const TimelessTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  return (
    <Page className="font-resume-serif text-[11px] leading-[1.55] text-zinc-800">
      <header className="text-center mb-5">
        {p.fullName && <h1 className="text-[25px] font-bold tracking-wide text-zinc-900">{p.fullName}</h1>}
        {p.headline && <div className="text-[11px] italic text-zinc-500 mt-0.5">{p.headline}</div>}
        <Contact p={p} variant="dot" className="justify-center text-[9.5px] text-zinc-500 mt-1.5" />
        <div className="mx-auto mt-3 border-t border-double border-t-2 border-zinc-300" />
      </header>
      {p.summary && <Summary text={p.summary} className="text-[11px] text-zinc-600 mb-4 text-center italic" />}
      <SectionBlocks
        data={data}
        accent={accent}
        config={{
          heading: 'serif',
          experience: 'standard',
          education: 'standard',
          projects: 'list',
          skills: 'inline',
          certifications: 'inline',
          gap: 'mb-4',
        }}
      />
    </Page>
  );
};

export default TimelessTemplate;
