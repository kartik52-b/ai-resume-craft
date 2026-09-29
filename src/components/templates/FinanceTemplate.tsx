import { type ResumeData } from '@/types/resume';
import {
  ACCENTS, Block, SectionBlocks, Contact, Summary, hidden, SkillList, CertificationList,
} from './shared';
import { SplitBody, Page } from './layouts';

const accent = ACCENTS.forest;

/** Conservative formal: centered masthead, serif type, credentials left column. */
const FinanceTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  const showSkills = data.skills.length > 0 && !hidden(data, 'skills');
  const showCerts = data.certifications.length > 0 && !hidden(data, 'certifications');

  return (
    <Page className="font-resume-serif text-[10.5px] leading-[1.4] text-zinc-800">
      <header className="text-center mb-3 pb-2 border-b-2 border-zinc-800">
        {p.fullName && <h1 className="text-[22px] font-bold tracking-wide text-zinc-900">{p.fullName}</h1>}
        {p.headline && <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 mt-1">{p.headline}</div>}
        <Contact p={p} variant="pipes" className="justify-center text-[9px] text-zinc-600 mt-1" />
      </header>
      {p.summary && <Summary text={p.summary} className="text-[10.5px] text-zinc-700 mb-3" />}

      <SplitBody
        asideFirst
        ratio="narrow"
        asideClassName="border-r border-zinc-200 pr-3"
        aside={
          <div className="space-y-4">
            {showSkills && (
              <Block title="Skills" heading="rule" accent={accent}>
                <SkillList skills={data.skills} variant="bullets" accent={accent} />
              </Block>
            )}
            {showCerts && (
              <Block title="Credentials" heading="rule" accent={accent}>
                <CertificationList items={data.certifications} variant="list" accent={accent} />
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

export default FinanceTemplate;
