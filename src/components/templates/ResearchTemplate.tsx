import { type ResumeData } from '@/types/resume';
import { ACCENTS, SectionBlocks, Contact, Summary } from './shared';
import { Page } from './layouts';

const accent = ACCENTS.charcoal;

/** Citation-friendly: numbered sections, serif hierarchy, airy leading. */
const ResearchTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  return (
    <Page className="font-resume-serif text-[10.5px] leading-[1.55] text-zinc-800">
      <header className="mb-4 pb-2.5 border-b border-zinc-300">
        {p.fullName && <h1 className="text-[22px] font-bold text-zinc-900 leading-none">{p.fullName}</h1>}
        {p.headline && <div className="text-[10.5px] uppercase tracking-[0.16em] text-zinc-600 mt-1.5">{p.headline}</div>}
        <Contact p={p} variant="dot" className="text-[9.5px] text-zinc-600 mt-1.5" />
      </header>
      {p.summary && <Summary text={p.summary} className="text-[10.5px] text-zinc-700 mb-3.5" />}
      <SectionBlocks
        data={data}
        accent={accent}
        config={{
          heading: 'numbered',
          experience: 'split',
          education: 'stacked',
          projects: 'list',
          skills: 'inline',
          certifications: 'inline',
          gap: 'mb-3.5',
        }}
      />
    </Page>
  );
};

export default ResearchTemplate;
