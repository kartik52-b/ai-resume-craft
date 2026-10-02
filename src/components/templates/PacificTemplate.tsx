import { type ResumeData } from '@/types/resume';
import {
  ACCENTS, Block, SectionBlocks, Contact, Summary, hidden, SkillList, CertificationList,
} from './shared';
import { SplitBody, Page } from './layouts';

const accent = ACCENTS.teal;

/** Tinted left panel for skills and certifications, rule headings, main narrative column. */
const PacificTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  const showSkills = data.skills.length > 0 && !hidden(data, 'skills');
  const showCerts = data.certifications.length > 0 && !hidden(data, 'certifications');

  return (
    <Page className="font-resume-sans text-[10px] leading-[1.45] text-zinc-800">
      <header className="mb-3">
        <div className="flex justify-between items-end gap-4">
          <div>
            {p.fullName && <h1 className="text-[20px] font-bold text-teal-900">{p.fullName}</h1>}
            {p.headline && <div className="text-[10px] font-medium text-teal-700">{p.headline}</div>}
          </div>
          <Contact p={p} variant="stacked" className="text-[9px] text-zinc-500 text-right shrink-0" />
        </div>
        <div className="mt-1.5 h-[1px] border-t border-teal-200" />
      </header>
      {p.summary && <Summary text={p.summary} className="text-[10px] text-zinc-600 mb-3" />}

      <SplitBody
        ratio="medium"
        asideFirst
        asideClassName="border-r border-teal-100 bg-teal-50/50 p-3 rounded-sm"
        aside={
          <div className="space-y-3 text-teal-900">
            {showSkills && (
              <Block title="Skills" heading="rule" accent={accent}>
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
          <div className="pl-3">
            <SectionBlocks
              data={data}
              accent={accent}
              omit={['skills', 'certifications']}
              config={{
                heading: 'rule',
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

export default PacificTemplate;
