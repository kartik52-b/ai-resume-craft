import { type ResumeData } from '@/types/resume';
import {
  ACCENTS, SectionBlocks, Contact, Summary, hidden, SkillList, CertificationList,
} from './shared';
import { SidebarPage, Page } from './layouts';

const accent = ACCENTS.charcoal;

/** Dark full-bleed left rail with identity + stack, bar headings in the main column. */
const ShelahTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  const showSkills = data.skills.length > 0 && !hidden(data, 'skills');
  const showCerts = data.certifications.length > 0 && !hidden(data, 'certifications');

  return (
    <Page className="font-resume-sans text-[10px] leading-[1.45] text-zinc-800">
      <SidebarPage
        side="left"
        width="medium"
        bleed
        sidebarClassName="bg-zinc-900 rounded-sm"
        sidebar={
          <div className="text-zinc-100">
            {p.fullName && <h1 className="text-[17px] font-bold text-white leading-tight">{p.fullName}</h1>}
            {p.headline && <div className="text-[9px] text-zinc-400 mt-1">{p.headline}</div>}
            <div className="mt-3.5">
              <div className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-1">Contact</div>
              <Contact p={p} variant="stacked" className="text-[8.5px] text-zinc-300" />
            </div>
            {showSkills && (
              <div className="mt-3.5">
                <div className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-1">Skills</div>
                <SkillList skills={data.skills} variant="sidebar" accent={accent} className="text-[8.5px] text-zinc-300" />
              </div>
            )}
            {showCerts && (
              <div className="mt-3.5">
                <div className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-1">Certifications</div>
                <CertificationList items={data.certifications} variant="list" accent={accent} className="text-[8.5px] text-zinc-300" />
              </div>
            )}
          </div>
        }
        main={
          <div className="pl-4 pt-0.5">
            {p.summary && <Summary text={p.summary} className="text-[10px] text-zinc-600 mb-3" />}
            <SectionBlocks
              data={data}
              accent={accent}
              omit={['skills', 'certifications']}
              config={{
                heading: 'bar',
                experience: 'standard',
                education: 'twoline',
                projects: 'list',
                certifications: 'inline',
                gap: 'mb-3',
              }}
            />
          </div>
        }
      />
    </Page>
  );
};

export default ShelahTemplate;
