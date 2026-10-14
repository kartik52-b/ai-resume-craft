import { type ResumeData } from '@/types/resume';
import { ACCENTS, SectionBlocks, Contact, Summary } from './shared';
import { Page } from './layouts';

const FieldnotesTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  return (
    <Page className="font-resume-serif text-[10.5px] leading-[1.55] text-stone-800">
      <header className="mb-4 border-y-2 border-emerald-900 py-3"><div className="flex items-start gap-4"><div className="pt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-800">Field<br />notes</div><div className="min-w-0 flex-1 border-l border-stone-300 pl-4">{p.fullName && <h1 className="text-[25px] font-semibold leading-none text-stone-900">{p.fullName}</h1>}{p.headline && <div className="mt-1.5 font-resume-sans text-[10px] text-stone-600">{p.headline}</div>}<Contact p={p} variant="dot" className="mt-2 font-resume-sans text-[8.5px] text-stone-500" /></div></div></header>
      {p.summary && <Summary text={p.summary} className="mb-4 border-b border-stone-200 pb-3 text-[11px] italic text-stone-700" />}
      <div className="grid grid-cols-[28px_1fr] gap-x-3"><div className="border-r border-emerald-200 text-center font-resume-sans text-[8px] font-bold leading-6 text-emerald-800">01<br />02<br />03<br />04</div><SectionBlocks data={data} accent={ACCENTS.forest} config={{ heading: 'serif', experience: 'timeline', education: 'stacked', projects: 'list', skills: 'bullets', certifications: 'list', numbered: true, gap: 'mb-3.5' }} /></div>
    </Page>
  );
};

export default FieldnotesTemplate;