import { type ResumeData } from '@/types/resume';
import { ACCENTS, SectionBlocks, Contact, Summary } from './shared';
import { ColumnsPage, Page } from './layouts';

const accent = ACCENTS.steel;

/** Terminal-flavoured: monospace, two flowing columns, compact technical entries. */
const TechTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  return (
    <Page className="font-resume-mono text-[10px] leading-[1.45] text-zinc-800">
      <header className="mb-3.5 pb-2 border-b border-zinc-300 flex justify-between items-end gap-4">
        <div className="min-w-0">
          {p.fullName && <h1 className="text-[20px] font-bold text-zinc-900 leading-none">{p.fullName}</h1>}
          {p.headline && <div className="text-[10px] text-zinc-600 mt-1">{p.headline}</div>}
        </div>
        <Contact p={p} variant="stacked" className="text-[8.5px] text-zinc-500 text-right shrink-0" />
      </header>
      {p.summary && <Summary text={p.summary} className="text-[10px] text-zinc-600 mb-3.5" />}
      <ColumnsPage columns={2} className="[column-gap:6mm]">
        <SectionBlocks
          data={data}
          accent={accent}
          config={{
            heading: 'bar',
            experience: 'compact',
            education: 'compact',
            projects: 'list',
            skills: 'bullets',
            certifications: 'inline',
            gap: 'mb-3.5',
          }}
        />
      </ColumnsPage>
    </Page>
  );
};

export default TechTemplate;
