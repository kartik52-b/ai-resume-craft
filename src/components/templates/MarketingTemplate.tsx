import { type ResumeData } from '@/types/resume';
import {
  ACCENTS, Block, SectionBlocks, Contact, Summary, hidden, SkillList, CertificationList,
} from './shared';
import { SplitBody, Page } from './layouts';

const accent = ACCENTS.burgundy;

/** Bold headers, boxed section labels, capabilities grouped in a left column. */
const MarketingTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  const showSkills = data.skills.length > 0 && !hidden(data, 'skills');
  const showCerts = data.certifications.length > 0 && !hidden(data, 'certifications');

  return (
    <Page className="font-resume-sans text-[10.5px] leading-[1.45] text-zinc-800">
      <header className="mb-3 pb-2.5 border-b-2 border-rose-900">
        {p.fullName && <h1 className="text-[24px] font-extrabold tracking-tight text-rose-950 leading-none">{p.fullName}</h1>}
        {p.headline && <div className="text-[11px] font-semibold text-rose-700 mt-1">{p.headline}</div>}
        <Contact p={p} variant="dot" className="text-[9.5px] text-zinc-600 mt-1.5" />
      </header>
      {p.summary && <Summary text={p.summary} className="text-[10.5px] text-zinc-700 mb-3" />}

      <SplitBody
        asideFirst
        ratio="medium"
        asideClassName="border-r border-rose-100 pr-3.5"
        aside={
          <div className="space-y-4">
            {showSkills && (
              <Block title="Capabilities" heading="boxed" accent={accent}>
                <SkillList skills={data.skills} variant="chips" accent={accent} />
              </Block>
            )}
            {showCerts && (
              <Block title="Certifications" heading="boxed" accent={accent}>
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
            config={{ heading: 'boxed', experience: 'standard', education: 'compact', projects: 'list', gap: 'mb-3.5' }}
          />
        }
      />
    </Page>
  );
};

export default MarketingTemplate;
