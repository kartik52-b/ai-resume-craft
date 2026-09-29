import { type ResumeData } from '@/types/resume';
import { ACCENTS, SectionBlocks, Contact, Summary } from './shared';
import { Page } from './layouts';

const accent = ACCENTS.charcoal;

/** Serif classic: strong name header, ruled uppercase sections, conservative type. */
const ProfessionalTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  return (
    <Page className="font-resume-serif text-[10.5px] leading-[1.45] text-zinc-800">
      <header className="mb-3 pb-2 border-b-2 border-zinc-800">
        {p.fullName && <h1 className="text-[24px] font-bold text-zinc-900 leading-none">{p.fullName}</h1>}
        {p.headline && <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-600 mt-1.5">{p.headline}</div>}
        <Contact p={p} variant="pipes" className="text-[9.5px] text-zinc-600 mt-1.5" />
      </header>
      {p.summary && <Summary text={p.summary} className="text-[10.5px] text-zinc-700 mb-3" />}
      <SectionBlocks
        data={data}
        accent={accent}
        config={{
          heading: 'rule',
          experience: 'standard',
          education: 'standard',
          projects: 'list',
          skills: 'inline',
          certifications: 'list',
          gap: 'mb-3',
        }}
      />
    </Page>
  );
};

export default ProfessionalTemplate;
