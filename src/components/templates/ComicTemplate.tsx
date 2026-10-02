import { type ResumeData } from '@/types/resume';
import { ACCENTS, SectionBlocks, Contact, Summary } from './shared';
import { ColumnsPage, Page } from './layouts';

const accent = ACCENTS.burgundy;

/** Bold header rule, chip skills, two-column flowing body — expressive but still A4-professional. */
const ComicTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  return (
    <Page className="font-resume-sans text-[10px] leading-[1.45] text-zinc-800">
      <header className="mb-3">
        <div className="flex items-baseline justify-between">
          <div>
            {p.fullName && <h1 className="text-[21px] font-bold text-rose-900">{p.fullName}</h1>}
            {p.headline && <div className="text-[10px] font-medium text-rose-700">{p.headline}</div>}
          </div>
          <Contact p={p} variant="pipes" className="text-[9px] text-zinc-500" />
        </div>
        <div className="mt-1.5 h-[2px] w-24 rounded-full" style={{ background: 'hsl(350 60% 45% / 0.5)' }} />
      </header>
      {p.summary && <Summary text={p.summary} className="text-[10px] text-zinc-600 mb-3" />}
      <SectionBlocks
        data={data}
        accent={accent}
        config={{
          heading: 'rule',
          experience: 'standard',
          education: 'compact',
          projects: 'list',
          skills: 'chips',
          certifications: 'inline',
          gap: 'mb-3',
        }}
      />
    </Page>
  );
};

export default ComicTemplate;
