import { type ResumeData } from '@/types/resume';
import { ACCENTS, SectionBlocks, Contact, Summary, hidden, SkillList, CertificationList } from './shared';
import { Page, SidebarPage } from './layouts';

const FrontierTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  const showSkills = data.skills.length > 0 && !hidden(data, 'skills');
  const showCerts = data.certifications.length > 0 && !hidden(data, 'certifications');
  return (
    <Page className="font-resume-sans text-[10px] leading-[1.5] text-zinc-800">
      <SidebarPage side="right" width="medium" bleed sidebarClassName="bg-emerald-950 text-emerald-50" mainClassName="pr-3"
        sidebar={<div className="space-y-3">{p.fullName && <h1 className="break-words text-[20px] font-bold leading-tight">{p.fullName}</h1>}{p.headline && <div className="text-[9px] font-medium text-emerald-200">{p.headline}</div>}<div className="h-px bg-emerald-700" /><Contact p={p} variant="stacked" className="break-words text-[8px] text-emerald-100" />{showSkills && <section><h2 className="mb-1.5 text-[8px] font-bold uppercase tracking-[0.16em] text-emerald-300">Capabilities</h2><SkillList skills={data.skills} variant="sidebar" accent={ACCENTS.forest} /></section>}{showCerts && <section><h2 className="mb-1.5 text-[8px] font-bold uppercase tracking-[0.16em] text-emerald-300">Credentials</h2><CertificationList items={data.certifications} variant="list" accent={ACCENTS.forest} /></section>}</div>}
        main={<div className="pt-1"><div className="mb-3 border-b-2 border-emerald-900 pb-2 text-[8px] font-bold uppercase tracking-[0.2em] text-emerald-900">Experience / outcomes</div><Summary text={p.summary} className="mb-3 text-[10px] text-zinc-600" /><SectionBlocks data={data} accent={ACCENTS.forest} omit={['skills', 'certifications']} config={{ heading: 'plain', experience: 'timeline', education: 'twoline', projects: 'list', gap: 'mb-3.5' }} /></div>}
      />
    </Page>
  );
};

export default FrontierTemplate;