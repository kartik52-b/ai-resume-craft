import { type ResumeData } from '@/types/resume';
import { ACCENTS, Block, SectionBlocks, Contact, Summary, hidden, SkillList, CertificationList } from './shared';
import { Page, SplitBody } from './layouts';

const accent = ACCENTS.blue;

const BlueprintTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  const showSkills = data.skills.length > 0 && !hidden(data, 'skills');
  const showCerts = data.certifications.length > 0 && !hidden(data, 'certifications');
  return (
    <Page className="font-resume-sans text-[10.5px] leading-[1.5] text-zinc-800">
      <header className="-mt-[18mm] -mx-[20mm] mb-4 bg-sky-950 px-[20mm] pt-[18mm] pb-4 text-white">
        <div className="mb-2 text-[8px] font-bold uppercase tracking-[0.2em] text-sky-200">Professional blueprint / 01</div>
        <div className="flex items-end justify-between gap-4"><div className="min-w-0">{p.fullName && <h1 className="text-[24px] font-bold leading-none">{p.fullName}</h1>}{p.headline && <div className="mt-1.5 text-[11px] text-sky-100">{p.headline}</div>}</div><Contact p={p} variant="stacked" className="max-w-[36%] min-w-0 text-right text-[8.5px] text-sky-100" /></div>
      </header>
      <SplitBody ratio="wide" asideClassName="border-l-2 border-sky-200 pl-3"
        aside={<div className="space-y-3">{showSkills && <Block title="Technical toolkit" heading="boxed" accent={accent}><SkillList skills={data.skills} variant="grid" accent={accent} /></Block>}{showCerts && <Block title="Credentials" heading="boxed" accent={accent}><CertificationList items={data.certifications} variant="list" accent={accent} /></Block>}</div>}
        main={<div><Summary text={p.summary} className="mb-3 border-l-2 border-sky-700 bg-sky-50 px-3 py-2 text-[10px] text-slate-700" /><SectionBlocks data={data} accent={accent} omit={['skills', 'certifications']} config={{ heading: 'numbered', experience: 'standard', education: 'twoline', projects: 'cards', gap: 'mb-3' }} /></div>}
      />
    </Page>
  );
};

export default BlueprintTemplate;