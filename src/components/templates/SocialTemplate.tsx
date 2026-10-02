import { type ResumeData } from '@/types/resume';
import { ACCENTS, SectionBlocks, Contact, Summary } from './shared';
import { Page } from './layouts';

const accent = ACCENTS.charcoal;

/** Centered editorial masthead with a short bronze rule, chip skills, one clean column. */
const SocialTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  return (
    <Page className="font-resume-sans text-[10.5px] leading-[1.5] text-zinc-800">
      <header className="text-center mb-4">
        {p.fullName && <h1 className="text-[23px] font-bold tracking-tight text-zinc-900">{p.fullName}</h1>}
        {p.headline && <div className="text-[11px] font-medium text-zinc-500 mt-0.5">{p.headline}</div>}
        <Contact p={p} variant="dot" className="justify-center text-[9.5px] text-zinc-500 mt-1.5" />
        <div className="mx-auto mt-3 w-12 h-xs rounded-full" style={{ background: 'hsl(26 36% 48% / 0.55)' }} />
      </header>
      {p.summary && <Summary text={p.summary} className="text-[10.5px] text-zinc-600 mb-3.5 text-center" />}
      <SectionBlocks
        data={data}
        accent={accent}
        config={{
          heading: 'underline',
          experience: 'standard',
          education: 'standard',
          projects: 'list',
          skills: 'chips',
          certifications: 'inline',
          gap: 'mb-3.5',
        }}
      />
    </Page>
  );
};

export default SocialTemplate;
