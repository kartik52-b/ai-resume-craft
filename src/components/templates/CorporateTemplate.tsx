import { type ResumeData } from '@/types/resume';
import { type ResumeData } from '@/types/resume';
import {
  ACCENTS, Block, SectionBlocks, Contact, Summary, hidden, SkillList, CertificationList,
} from './shared';
import { SplitBody, Page } from './layouts';

const accent = ACCENTS.navy;

/** Structured enterprise layout: formal ruled sections with a credentials column on the right. */
const CorporateTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  const showSkills = data.skills.length > 0 && !hidden(data, 'skills');
  const showCerts = data.certifications.length > 0 && !hidden(data, 'certifications');

  return (
    <Page className="font-resume-sans text-[10px] leading-[1.45] text-zinc-800">
      <header className="mb-3 pb-2 border-b border-zinc-300 flex justify-between items-end gap-4">
        <div className="min-w-0">
          {p.fullName && <h1 className="text-[22px] font-bold text-zinc-900 leading-none">{p.fullName}</h1>}
          {p.headline && <div className="text-[10.5px] font-medium text-zinc-500 mt-1">{p.headline}</div>}
        </div>
        <Contact p={p} variant="stacked" className="text-[9px] text-zinc-500 text-right shrink-0" />
      </header>
      {p.summary && <Summary text={p.summary} className="text-[10px] text-zinc-600 mb-3" />}

      <SplitBody
        ratio="narrow"
        asideFirst={false}
        asideClassName="border-l border-zinc-200 pl-3"
        aside={
          <div className="space-y-4">
            {showSkills && (
              <Block title="Core Skills" heading="rule" accent={accent}>
                <SkillList skills={data.skills} variant="bullets" accent={accent} />
              </Block>
            )}
            {showCerts && (
              <Block title="Certifications" heading="rule" accent={accent}>
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

export default CorporateTemplate;
