import { type ResumeData } from '@/types/resume';
import { ACCENTS, SectionBlocks, Contact, Summary } from './shared';
import { Page } from './layouts';

const accent = ACCENTS.mono;

/** Mono type, wide whitespace, and a left-aligned header where contact sits on its own ruled line. */
const PlainTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  return (
    <Page className="font-resume-mono text-[10px] leading-[1.65] text-zinc-700">
      <header className="mb-5">
        {p.fullName && <h1 className="text-[18px] font-bold tracking-tight text-zinc-900">{p.fullName}</h1>}
        {p.headline && <div className="text-[9.5px] text-zinc-500 mt-0.5">{p.headline}</div>}
        {p.email || p.phone || p.location ? (
          <div className="mt-2 border-t border-zinc-300 pt-1.5 text-[9px] text-zinc-400">
            <Contact p={p} variant="slash" />
          </div>
        ) : null}
      </header>
      {p.summary && <Summary text={p.summary} className="text-[10px] text-zinc-600 mb-4" />}
      <SectionBlocks
        data={data}
        accent={accent}
        config={{
          heading: 'plain',
          experience: 'compact',
          education: 'compact',
          projects: 'inline',
          skills: 'inline',
          certifications: 'inline',
          gap: 'mb-4',
        }}
      />
    </Page>
  );
};

export default PlainTemplate;
