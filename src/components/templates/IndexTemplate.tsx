import { type ResumeData } from '@/types/resume';
import { ACCENTS, Block, SectionBlocks, Contact, Summary, hidden, SkillList, CertificationList } from './shared';
import { Page, SplitBody } from './layouts';

const IndexTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  const showSkills = data.skills.length > 0 && !hidden(data, 'skills');
  const showCerts = data.certifications.length > 0 && !hidden(data, 'certifications');
  return (
    <Page className="font-resume-sans text-[10px] leading-[1.5] text-stone-800">
      <header className="mb-4 grid grid-cols-[1fr_100px] items-stretch border-y border-stone-300"><div className="py-3 pr-4"><div className="mb-1 text-[8px] font-bold uppercase tracking-[0.2em] text-amber-800">Candidate index / 01</div>{p.fullName && <h1 className="text-[23px] font-bold leading-none text-stone-950">{p.fullName}</h1>}{p.headline && <div className="mt-1.5 text-[10px] text-stone-600">{p.headline}</div>}<Contact p={p} variant="dot" className="mt-2 text-[8px] text-stone-500" /></div><div className="flex items-center justify-center bg-amber-700 px-2 text-center text-[8px] font-bold uppercase text-amber-50">Professional<br />Record</div></header>
      <Summary text={p.summary} className="mb-3 border-b border-dashed border-stone-300 pb-3 text-[10px] text-stone-600" />
      <SplitBody ratio="narrow" asideFirst asideClassName="border-r border-dashed border-stone-300 pr-3"
        aside={<div className="space-y-3">{showSkills && <Block title="Index / Skills" heading="plain" accent={ACCENTS.gold}><SkillList skills={data.skills} variant="grid" accent={ACCENTS.gold} /></Block>}{showCerts && <Block title="Credentials" heading="plain" accent={ACCENTS.gold}><CertificationList items={data.certifications} variant="list" accent={ACCENTS.gold} /></Block>}</div>}
        main={<SectionBlocks data={data} accent={ACCENTS.gold} omit={['skills', 'certifications']} config={{ heading: 'numbered', experience: 'split', education: 'stacked', projects: 'cards', gap: 'mb-3' }} />}
      />
    </Page>
  );
};

export default IndexTemplate;