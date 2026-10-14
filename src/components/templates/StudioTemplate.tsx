import { type ResumeData } from '@/types/resume';
import { ACCENTS, Block, SectionBlocks, Contact, Summary, hidden, ProjectList, SkillList } from './shared';
import { Page, SplitBody } from './layouts';

const StudioTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  const showProjects = data.projects.length > 0 && !hidden(data, 'projects');
  const showSkills = data.skills.length > 0 && !hidden(data, 'skills');
  return (
    <Page className="font-resume-sans text-[10px] leading-[1.5] text-zinc-800">
      <header className="-mt-[18mm] -mx-[20mm] mb-4 bg-fuchsia-950 px-[20mm] pt-[18mm] pb-4 text-white"><div className="flex items-center gap-4"><div className="h-10 w-1 shrink-0 bg-fuchsia-300" /><div className="min-w-0 flex-1">{p.fullName && <h1 className="text-[24px] font-bold leading-none">{p.fullName}</h1>}{p.headline && <div className="mt-1.5 text-[10px] text-fuchsia-100">{p.headline}</div>}</div><Contact p={p} variant="stacked" className="max-w-[42%] shrink-0 text-right text-[8px] text-fuchsia-100" /></div></header>
      <SplitBody ratio="medium" asideClassName="border-l border-fuchsia-200 pl-3"
        aside={<div className="space-y-3">{showProjects && <Block title="Selected work" heading="boxed" accent={ACCENTS.plum}><ProjectList items={data.projects} variant="cards" accent={ACCENTS.plum} /></Block>}{showSkills && <Block title="Tools" heading="plain" accent={ACCENTS.plum}><SkillList skills={data.skills} variant="bullets" accent={ACCENTS.plum} /></Block>}</div>}
        main={<div><Summary text={p.summary} className="mb-3 text-[10px] italic text-zinc-600" /><SectionBlocks data={data} accent={ACCENTS.plum} omit={['projects', 'skills']} config={{ heading: 'bar', experience: 'split', education: 'stacked', certifications: 'list', gap: 'mb-3' }} /></div>}
      />
    </Page>
  );
};

export default StudioTemplate;