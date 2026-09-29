import { type ResumeData } from '@/types/resume';
import { ACCENTS, SectionBlocks, Contact, Summary } from './shared';
import { ColumnsPage, Page } from './layouts';

const accent = ACCENTS.plum;

/** Asymmetric: a heavy accent rule anchors the header, body flows in two columns. */
const CreativeTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  return (
    <Page className="font-resume-sans text-[10.5px] leading-[1.5] text-zinc-800">
      <header className="flex gap-3 mb-3.5 pb-3 border-b-2 border-fuchsia-900">
        <span className="w-1.5 self-stretch bg-fuchsia-900 rounded-full" aria-hidden />
        <div className="min-w-0 flex-1">
          {p.fullName && <h1 className="text-[26px] font-extrabold tracking-tight text-fuchsia-950 leading-none">{p.fullName}</h1>}
          {p.headline && <div className="text-[11px] font-semibold text-fuchsia-700 mt-1">{p.headline}</div>}
          <Contact p={p} variant="dot" className="text-[9.5px] text-zinc-600 mt-1.5" />
        </div>
      </header>
      {p.summary && <Summary text={p.summary} className="text-[10.5px] text-zinc-700 mb-3.5" />}
      <ColumnsPage columns={2} className="[column-gap:6mm]">
        <SectionBlocks
          data={data}
          accent={accent}
          config={{
            heading: 'boxed',
            experience: 'standard',
            education: 'compact',
            projects: 'list',
            skills: 'chips',
            certifications: 'inline',
            gap: 'mb-3.5',
          }}
        />
      </ColumnsPage>
    </Page>
  );
};

export default CreativeTemplate;
