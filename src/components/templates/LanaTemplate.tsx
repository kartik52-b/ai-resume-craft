import { type ResumeData } from '@/types/resume';
import {
  ACCENTS, Block, SectionBlocks, Contact, Summary, hidden, SkillList, CertificationList,
} from './shared';
import { SplitBody, Page } from './layouts';

const accent = ACCENTS.forest;

/** Wide left sidebar carries identity, skills and certifications; main column tells the story. */
const LanaTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  const showSkills = data.skills.length > 0 && !hidden(data, 'skills');
  const showCerts = data.certifications.length > 0 && !hidden(data, 'certifications');

  return (
    <Page className="font-resume-sans text-[10px] leading-[1.45] text-zinc-800">
      <SplitBody
        header={
          <header className="mb-3">
            <div className="flex justify-between items-end gap-4">
              <div className="min-w-0">
                {p.fullName && <h1 className="text-[21px] font-bold text-zinc-900">{p.fullName}</h1>}
                {p.headline && <div className="text-[10px] font-medium text-zinc-500">{p.headline}</div>}
              </div>
              <Contact p={p} variant="stacked" className="text-[9px] text-zinc-500 text-right shrink-0" />
            </div>
          </header>
        }
        ratio="wide"
        asideFirst
        asideClassName="border-r border-emerald-100 bg-emerald-50/40 p-3 rounded-sm"
        aside={
          <div className="space-y-3 text-emerald-900">
            <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-700 mb-1">Contact</div>
            <Contact p={p} variant="stacked" className="text-[9px]" />
            {showSkills && (
              <Block title="Skills" heading="plain" accent={accent}>
                <SkillList skills={data.skills} variant="bullets" accent={accent} />
              </Block>
            )}
            {showCerts && (
              <Block title="Certifications" heading="plain" accent={accent}>
                <CertificationList items={data.certifications} variant="list" accent={accent} />
              </Block>
            )}
          </div>
        }
        main={
          <div className="pl-3">
            {p.summary && <Summary text={p.summary} className="text-[10px] text-zinc-600 mb-3" />}
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

export default LanaTemplate;
