import { type ResumeData } from '@/types/resume';
import {
  ACCENTS, SectionBlocks, Contact, Heading, SkillList, CertificationList, Summary, hidden,
} from './shared';
import { SidebarPage, Page } from './layouts';

const accent = ACCENTS.teal;

/** Teal full-bleed rail: identity, stack and credentials sit apart from the narrative. */
const TwoColumnTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  const showSkills = data.skills.length > 0 && !hidden(data, 'skills');
  const showCerts = data.certifications.length > 0 && !hidden(data, 'certifications');

  return (
    <Page className="font-resume-sans text-[10px] leading-[1.45] text-zinc-800">
      <SidebarPage
        side="left"
        width="medium"
        bleed
        sidebarClassName="bg-teal-800"
        sidebar={
          <div className="text-teal-50">
            {p.fullName && <h1 className="text-[17px] font-bold text-white leading-tight">{p.fullName}</h1>}
            {p.headline && <div className="text-[9px] text-teal-200 mt-1">{p.headline}</div>}
            <div className="mt-3.5">
              <Heading title="Contact" variant="side" accent={accent} />
              <Contact p={p} variant="stacked" className="text-[8.5px] text-teal-100" />
            </div>
            {showSkills && (
              <div className="mt-3.5">
                <Heading title="Skills" variant="side" accent={accent} />
                <SkillList skills={data.skills} variant="sidebar" accent={accent} className="text-[8.5px]" />
              </div>
            )}
            {showCerts && (
              <div className="mt-3.5">
                <Heading title="Certifications" variant="side" accent={accent} />
                <CertificationList items={data.certifications} variant="list" accent={accent} className="text-[8.5px]" />
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
              config={{ heading: 'underline', experience: 'standard', education: 'twoline', projects: 'list', gap: 'mb-3' }}
            />
          </div>
        }
      />
    </Page>
  );
};

export default TwoColumnTemplate;
