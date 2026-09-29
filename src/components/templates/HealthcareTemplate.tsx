import { type ResumeData } from '@/types/resume';
import {
  ACCENTS, Block, SectionBlocks, Contact, Summary, hidden, CertificationList, SkillList,
} from './shared';
import { SplitBody, Page } from './layouts';

const accent = ACCENTS.blue;

/** Clinical experience in the main column, credentials surfaced on the right. */
const HealthcareTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  const showCerts = data.certifications.length > 0 && !hidden(data, 'certifications');
  const showSkills = data.skills.length > 0 && !hidden(data, 'skills');

  return (
    <Page className="font-resume-sans text-[10.5px] leading-[1.45] text-zinc-800">
      <header className="mb-3 pb-2 border-b border-sky-200">
        {p.fullName && <h1 className="text-[22px] font-bold text-sky-950 leading-none">{p.fullName}</h1>}
        {p.headline && <div className="text-[10.5px] font-medium text-sky-700 mt-1">{p.headline}</div>}
        <Contact p={p} variant="pipes" className="text-[9px] text-zinc-500 mt-1.5" />
      </header>
      {p.summary && <Summary text={p.summary} className="text-[10.5px] text-zinc-600 mb-3" />}

      <SplitBody
        ratio="narrow"
        asideClassName="border-l border-sky-100 pl-3"
        aside={
          <div className="space-y-4">
            {showCerts && (
              <Block title="Credentials" heading="rule" accent={accent}>
                <CertificationList items={data.certifications} variant="list" accent={accent} />
              </Block>
            )}
            {showSkills && (
              <Block title="Clinical Skills" heading="rule" accent={accent}>
                <SkillList skills={data.skills} variant="bullets" accent={accent} />
              </Block>
            )}
          </div>
        }
        main={
          <SectionBlocks
            data={data}
            accent={accent}
            omit={['skills', 'certifications']}
            config={{ heading: 'rule', experience: 'standard', education: 'twoline', projects: 'list', gap: 'mb-3' }}
          />
        }
      />
    </Page>
  );
};

export default HealthcareTemplate;
