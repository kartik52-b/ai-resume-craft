import { type ResumeData } from '@/types/resume';
import {
  ACCENTS, SectionBlocks, Contact, Summary, hidden, SkillList, CertificationList,
} from './shared';
import { SidebarPage, Page } from './layouts';

const accent = ACCENTS.navy;

/** Right narrow rail, centered masthead, numbered sections on the main column. */
const KalyTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  const showSkills = data.skills.length > 0 && !hidden(data, 'skills');
  const showCerts = data.certifications.length > 0 && !hidden(data, 'certifications');

  return (
    <Page className="font-resume-sans text-[10px] leading-[1.45] text-zinc-800">
      <header className="text-center mb-3">
        {p.fullName && <h1 className="text-[21px] font-bold tracking-tight text-blue-950">{p.fullName}</h1>}
        {p.headline && <div className="text-[10px] font-medium text-blue-700 mt-0.5">{p.headline}</div>}
        <Contact p={p} variant="pipes" className="justify-center text-[9px] text-zinc-500 mt-1.5" />
        <div className="mx-auto mt-1.5 h-[1px] w-16 border-t border-blue-200" />
      </header>
      {p.summary && <Summary text={p.summary} className="text-[10px] text-zinc-600 mb-3 text-center" />}

      <SidebarPage
        side="right"
        width="narrow"
        bleed={false}
        sidebarClassName="border-l border-blue-100 bg-blue-50/50 p-3 rounded-sm"
        sidebar={
          <div className="text-blue-950">
            {showSkills && (
              <div className="mb-3">
                <div className="text-[9px] font-bold uppercase tracking-[0.14em] mb-1">Skills</div>
                <SkillList skills={data.skills} variant="sidebar" accent={accent} className="text-[8.5px]" />
              </div>
            )}
            {showCerts && (
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[0.14em] mb-1">Certifications</div>
                <CertificationList items={data.certifications} variant="list" accent={accent} className="text-[8.5px]" />
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
                heading: 'numbered',
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

export default KalyTemplate;
