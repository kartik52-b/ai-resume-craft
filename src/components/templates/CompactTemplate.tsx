import { type ResumeData } from '@/types/resume';
import { ACCENTS, SectionBlocks, Contact, Summary } from './shared';
import { ColumnsPage, Page } from './layouts';

const accent = ACCENTS.charcoal;

/** Maximum information per square inch: small type, tight spacing, two columns. */
const CompactTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  return (
    <Page className="font-resume-sans text-[9.5px] leading-[1.35] text-zinc-800">
      <header className="mb-2.5 pb-1.5 border-b border-zinc-300 flex justify-between items-baseline gap-3">
        <div className="min-w-0">
          {p.fullName && <h1 className="text-[18px] font-bold text-zinc-900 leading-none">{p.fullName}</h1>}
          {p.headline && <div className="text-[9.5px] font-medium text-zinc-600 mt-0.5">{p.headline}</div>}
        </div>
        <Contact p={p} variant="dot" className="text-[8.5px] text-zinc-500 shrink-0" />
      </header>
      {p.summary && <Summary text={p.summary} className="text-[9px] text-zinc-600 mb-2.5" />}
      <ColumnsPage columns={2} className="[column-gap:5mm]">
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
            gap: 'mb-2.5',
          }}
        />
      </ColumnsPage>
    </Page>
  );
};

export default CompactTemplate;
