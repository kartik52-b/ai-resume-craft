import { type ResumeData } from '@/types/resume';
import { ACCENTS, SectionBlocks, Contact, Summary } from './shared';
import { Page } from './layouts';

const accent = ACCENTS.mono;

/** Mono type, generous whitespace, quiet uppercase section labels. */
const MinimalTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  return (
    <Page className="font-resume-mono text-[10.5px] leading-[1.6] text-zinc-700">
      <header className="mb-5">
        {p.fullName && <h1 className="text-[19px] font-bold tracking-tight text-zinc-900">{p.fullName}</h1>}
        {p.headline && <div className="text-[10px] text-zinc-500 mt-1">{p.headline}</div>}
        <Contact p={p} variant="slash" className="text-[9.5px] text-zinc-400 mt-1.5" />
      </header>
      {p.summary && <Summary text={p.summary} className="text-[10.5px] text-zinc-600 mb-5" />}
      <SectionBlocks
        data={data}
        accent={accent}
        config={{
          heading: 'plain',
          experience: 'standard',
          education: 'compact',
          projects: 'inline',
          skills: 'inline',
          certifications: 'inline',
          gap: 'mb-5',
        }}
      />
    </Page>
  );
};

export default MinimalTemplate;
