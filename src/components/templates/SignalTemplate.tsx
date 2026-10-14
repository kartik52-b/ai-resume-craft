import { type ResumeData } from '@/types/resume';
import { ACCENTS, SectionBlocks, Contact, Summary, hidden, SkillList } from './shared';
import { Page } from './layouts';

const SignalTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  const showSkills = data.skills.length > 0 && !hidden(data, 'skills');
  return (
    <Page className="font-resume-sans text-[10.5px] leading-[1.5] text-zinc-800">
      <header className="mb-3 border-b border-rose-300 pb-3"><div className="grid grid-cols-[1fr_auto] items-end gap-3"><div className="min-w-0"><div className="mb-1 flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.2em] text-rose-800"><span className="h-1.5 w-1.5 rounded-full bg-rose-700" />Signal / People & impact</div>{p.fullName && <h1 className="text-[26px] font-extrabold leading-none text-zinc-950">{p.fullName}</h1>}{p.headline && <div className="mt-1 text-[11px] font-medium text-zinc-600">{p.headline}</div>}</div><div className="border-l-2 border-rose-700 pl-2 text-[8px] font-bold uppercase text-rose-800">CV<br />Profile</div></div><Contact p={p} variant="pipes" className="mt-2 text-[8.5px] text-zinc-500" /></header>
      {showSkills && <section className="mb-3 border-y border-rose-200 py-2"><h2 className="mb-1 text-[8px] font-bold uppercase tracking-[0.18em] text-rose-800">Core signals</h2><SkillList skills={data.skills} variant="inline" accent={ACCENTS.burgundy} /></section>}
      <Summary text={p.summary} className="mb-3 text-[10px] text-zinc-600" />
      <SectionBlocks data={data} accent={ACCENTS.burgundy} omit={['skills']} config={{ heading: 'underline', experience: 'boxed', education: 'twoline', projects: 'cards', certifications: 'inline', gap: 'mb-3' }} />
    </Page>
  );
};

export default SignalTemplate;