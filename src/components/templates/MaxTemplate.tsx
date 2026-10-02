import { type ResumeData } from '@/types/resume';
import { ACCENTS, SectionBlocks, Contact, Summary } from './shared';
import { Page } from './layouts';

const accent = ACCENTS.steel;

/** Strong left-aligned masthead with a header rule, timeline-style experience, one column. */
const MaxTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  return (
    <Page className="font-resume-sans text-[10px] leading-[1.45] text-zinc-800">
      <header className="mb-3">
        <div className="flex items-baseline justify-between">
          <div>
            {p.fullName && <h1 className="text-[21px] font-bold text-zinc-900">{p.fullName}</h1>}
            {p.headline && <div className="text-[10px] font-medium text-zinc-500">{p.headline}</div>}
          </div>
          <Contact p={p} variant="slash" className="text-[9px] text-zinc-500" />
        </div>
        <div className="mt-2 h-[1px] border-t border-zinc-300" />
      </header>
      {p.summary && <Summary text={p.summary} className="text-[10px] text-zinc-600 mb-3" />}
      <SectionBlocks
        data={data}
        accent={accent}
        config={{
          heading: 'rule',
          experience: 'timeline',
          education: 'compact',
          projects: 'list',
          skills: 'bullets',
          certifications: 'list',
          gap: 'mb-3',
        }}
      />
    </Page>
  );
};

export default MaxTemplate;
