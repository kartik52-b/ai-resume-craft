import { type ResumeData } from '@/types/resume';
import { ACCENTS, SectionBlocks, Contact, Summary } from './shared';
import { Page } from './layouts';

const accent = ACCENTS.gold;

/** Centered serif masthead over a bronze hairline, then a clean single column. */
const MarkTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  return (
    <Page className="font-resume-serif text-[10.5px] leading-[1.5] text-zinc-800">
      <header className="text-center mb-4 pb-2">
        {p.fullName && <h1 className="text-[24px] font-bold tracking-tight text-zinc-900">{p.fullName}</h1>}
        {p.headline && <div className="text-[11px] italic text-zinc-500 mt-0.5">{p.headline}</div>}
        <Contact p={p} variant="dot" className="justify-center text-[9.5px] text-zinc-500 mt-1.5" />
        <div className="mx-auto mt-3 h-[1px] w-16" style={{ background: 'hsl(26 36% 48% / 0.6)' }} />
      </header>
      {p.summary && <Summary text={p.summary} className="text-[10.5px] text-zinc-600 mb-3.5 text-center" />}
      <SectionBlocks
        data={data}
        accent={accent}
        config={{
          heading: 'serif',
          experience: 'standard',
          education: 'standard',
          projects: 'list',
          skills: 'chips',
          certifications: 'inline',
          gap: 'mb-3.5',
        }}
      />
    </Page>
  );
};

export default MarkTemplate;
