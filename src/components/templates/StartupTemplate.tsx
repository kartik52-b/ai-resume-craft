import { type ResumeData } from '@/types/resume';
import { ACCENTS, SectionBlocks, Contact, Summary } from './shared';
import { ColumnsPage, Page } from './layouts';

const accent = ACCENTS.blue;

/** Bold rule header, two flowing columns, project-forward and casual. */
const StartupTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  return (
    <Page className="font-resume-sans text-[10.5px] leading-[1.45] text-zinc-800">
      <header className="mb-3 pb-2 flex items-end justify-between gap-3 border-b-2 border-sky-700">
        <div className="min-w-0">
          {p.fullName && <h1 className="text-[22px] font-extrabold tracking-tight text-sky-900 leading-none">{p.fullName}</h1>}
          {p.headline && <div className="text-[10.5px] font-semibold text-sky-700 mt-1">{p.headline}</div>}
        </div>
        <Contact p={p} variant="stacked" className="text-[8.5px] text-zinc-500 text-right shrink-0" />
      </header>
      {p.summary && <Summary text={p.summary} className="text-[10.5px] text-zinc-600 mb-3" />}
      <ColumnsPage columns={2} className="[column-gap:6mm]">
        <SectionBlocks
          data={data}
          accent={accent}
          config={{
            heading: 'underline',
            experience: 'standard',
            education: 'compact',
            projects: 'list',
            skills: 'chips',
            certifications: 'inline',
            gap: 'mb-3',
          }}
        />
      </ColumnsPage>
    </Page>
  );
};

export default StartupTemplate;
