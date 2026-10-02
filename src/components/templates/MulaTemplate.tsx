import { type ResumeData } from '@/types/resume';
import {
  ACCENTS, SectionBlocks, Contact, Summary, hidden, SkillList, CertificationList,
} from './shared';
import { SidebarPage, Page } from './layouts';

const accent = ACCENTS.gold;

/** Accent-bar headings across a two-column main body, right sidebar for skills and certifications. */
const MulaTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  const showSkills = data.skills.length > 0 && !hidden(data, 'skills');
  const showCerts = data.certifications.length > 0 && !hidden(data, 'certifications');

  return (
    <Page className="font-resume-sans text-[10px] leading-[1.45] text-zinc-800">
      <header className="mb-3">
        <div className="flex justify-between items-end gap-4">
          <div>
            {p.fullName && <h1 className="text-[20px] font-bold text-zinc-900">{p.fullName}</h1>}
            {p.headline && <div className="text-[10px] font-medium text-zinc-500">{p.headline}</div>}
          </div>
          <Contact p={p} variant="stacked" className="text-[9px] text-zinc-500 text-right shrink-0" />
        </div>
        <div className="mt-1.5 h-[1px] border-t border-amber-300" />
      </header>
      {p.summary && <Summary text={p.summary} className="text-[10px] text-zinc-600 mb-3" />}

      <SidebarPage
        side="right"
        width="narrow"
        bleed={false}
        sidebarClassName="border-l border-amber-200 bg-amber-50/50 p-3 rounded-sm"
        sidebar={
          <div className="text-amber-900">
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
                heading: 'bar',
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

export default MulaTemplate;
