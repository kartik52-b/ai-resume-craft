import { type ResumeData } from '@/types/resume';
import { ACCENTS, SectionBlocks, Contact, Summary } from './shared';
import { Page } from './layouts';

const accent = ACCENTS.steel;

/** Engagement history told on a vertical timeline for a clear chronology. */
const ConsultantTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  return (
    <Page className="font-resume-sans text-[10.5px] leading-[1.45] text-zinc-800">
      <header className="mb-3.5 pb-2 border-b border-zinc-300 flex justify-between items-end gap-3">
        <div className="min-w-0">
          {p.fullName && <h1 className="text-[22px] font-bold tracking-tight text-zinc-900 leading-none">{p.fullName}</h1>}
          {p.headline && <div className="text-[10.5px] font-medium text-zinc-600 mt-1">{p.headline}</div>}
        </div>
        <Contact p={p} variant="stacked" className="text-[8.5px] text-zinc-500 text-right shrink-0" />
      </header>
      {p.summary && <Summary text={p.summary} className="text-[10.5px] text-zinc-600 mb-3.5" />}
      <SectionBlocks
        data={data}
        accent={accent}
        config={{
          heading: 'bar',
          experience: 'timeline',
          education: 'compact',
          projects: 'list',
          skills: 'chips',
          certifications: 'list',
          gap: 'mb-3.5',
        }}
      />
    </Page>
  );
};

export default ConsultantTemplate;
