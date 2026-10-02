import { type ResumeData } from '@/types/resume';
import {
  ACCENTS, SectionBlocks, Contact, Summary, hidden, SkillList, CertificationList,
} from './shared';
import { SidebarPage, Page } from './layouts';

const accent = ACCENTS.plum;

/** Centered masthead over a left narrow rail; boxed skill chips down the page. */
const BelaTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  const showSkills = data.skills.length > 0 && !hidden(data, 'skills');
  const showCerts = data.certifications.length > 0 && !hidden(data, 'certifications');

  return (
    <Page className="font-resume-sans text-[10px] leading-[1.45] text-zinc-800">
      <header className="text-center mb-3">
        {p.fullName && <h1 className="text-[21px] font-bold tracking-tight text-fuchsia-950">{p.fullName}</h1>}
        {p.headline && <div className="text-[10px] font-medium text-fuchsia-700 mt-0.5">{p.headline}</div>}
        <Contact p={p} variant="dot" className="justify-center text-[9px] text-zinc-500 mt-1.5" />
        <div className="mx-auto mt-1.5 h-[1px] w-14 border-t border-fuchsia-200" />
      </header>
      {p.summary && <Summary text={p.summary} className="text-[10px] text-zinc-600 mb-3 text-center" />}

      <SidebarPage
        side="left"
        width="narrow"
        bleed={false}
        sidebarClassName="border-r border-fuchsia-100 bg-fuchsia-50/40 p-3 rounded-sm"
        sidebar={
          <div className="text-fuchsia-900">
            {showSkills && (
              <div className="mb-3">
                <div className="text-[9px] font-bold uppercase tracking-[0.14em] mb-1">Skills</div>
                <SkillList skills={data.skills} variant="chips" accent={accent} />
              </div>
            )}
            {showCerts && (
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[0.14em] mb-1">Certifications</div>
                <CertificationList items={data.certifications} variant="inline" accent={accent} />
              </div>
            )}
          </div>
        }
        main={
          <div className="pr-3">
            <SectionBlocks
              data={data}
              accent={accent}
              omit={['skills', 'certifications']}
              config={{
                heading: 'underline',
                experience: 'standard',
                education: 'twoline',
                projects: 'list',
                gap: 'mb-3',
              }}
            />
          </div>
        }
      />
    </Page>
  );
};

export default BelaTemplate;
