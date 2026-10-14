import { type ResumeData } from '@/types/resume';
import { ACCENTS, SectionBlocks, Contact, Summary, hidden, SkillList, CertificationList } from './shared';
import { Page, SidebarPage } from './layouts';

const LedgerTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  const showSkills = data.skills.length > 0 && !hidden(data, 'skills');
  const showCerts = data.certifications.length > 0 && !hidden(data, 'certifications');
  return (
    <Page className="font-resume-sans text-[9.5px] leading-[1.4] text-zinc-800">
      <header className="mb-3 border-b-4 border-zinc-800 pb-2"><div className="flex items-end justify-between gap-3"><div className="min-w-0"><div className="text-[8px] font-bold uppercase tracking-[0.24em] text-zinc-500">Career ledger / Profile</div>{p.fullName && <h1 className="mt-1 text-[22px] font-black uppercase leading-none text-zinc-900">{p.fullName}</h1>}{p.headline && <div className="mt-1 text-[10px] font-semibold text-zinc-700">{p.headline}</div>}</div><Contact p={p} variant="stacked" className="shrink-0 text-right text-[8px] text-zinc-500" /></div></header>
      <SidebarPage width="narrow" sidebarClassName="mr-3 border-r border-zinc-300 pr-3"
        sidebar={<div className="space-y-3">{showSkills && <section><h2 className="mb-1 border-b border-zinc-800 pb-1 text-[9px] font-black uppercase">Inventory</h2><SkillList skills={data.skills} variant="bullets" accent={ACCENTS.charcoal} /></section>}{showCerts && <section><h2 className="mb-1 border-b border-zinc-800 pb-1 text-[9px] font-black uppercase">Credentials</h2><CertificationList items={data.certifications} variant="list" accent={ACCENTS.charcoal} /></section>}</div>}
        main={<div><Summary text={p.summary} className="mb-3 border-l-2 border-zinc-800 pl-2 text-[9.5px] text-zinc-600" /><SectionBlocks data={data} accent={ACCENTS.charcoal} omit={['skills', 'certifications']} config={{ heading: 'rule', experience: 'compact', education: 'compact', projects: 'inline', gap: 'mb-2.5' }} /></div>}
      />
    </Page>
  );
};

export default LedgerTemplate;