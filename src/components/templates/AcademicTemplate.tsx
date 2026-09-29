import { type ResumeData } from '@/types/resume';
import {
  ACCENTS, Block, SectionBlocks, Contact, Summary, hidden, SkillList, CertificationList,
} from './shared';
import { SplitBody, Page } from './layouts';

const accent = ACCENTS.navy;

/** Journal style: centered masthead, serif hierarchy, credentials in a side column. */
const AcademicTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  const showSkills = data.skills.length > 0 && !hidden(data, 'skills');
  const showCerts = data.certifications.length > 0 && !hidden(data, 'certifications');

  return (
    <Page className="font-resume-serif text-[10.5px] leading-[1.5] text-zinc-800">
      <header className="text-center mb-3.5 pb-2.5 border-b border-zinc-400">
        {p.fullName && <h1 className="text-[23px] font-bold tracking-wide text-zinc-900">{p.fullName}</h1>}
        {p.headline && <div className="text-[10.5px] uppercase tracking-[0.2em] text-zinc-600 mt-1">{p.headline}</div>}
        <Contact p={p} variant="dot" className="justify-center text-[9.5px] text-zinc-600 mt-1.5" />
      </header>
      {p.summary && <Summary text={p.summary} className="text-[10.5px] text-zinc-700 mb-3.5" />}

      <SplitBody
        ratio="narrow"
        asideClassName="border-l border-zinc-200 pl-3"
        aside={
          <div className="space-y-4">
            {showSkills && (
              <Block title="Skills" heading="serif" accent={accent}>
                <SkillList skills={data.skills} variant="bullets" accent={accent} />
              </Block>
            )}
            {showCerts && (
              <Block title="Certifications" heading="serif" accent={accent}>
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
            config={{ heading: 'serif', experience: 'split', education: 'stacked', projects: 'list', gap: 'mb-3.5' }}
          />
        }
      />
    </Page>
  );
};

export default AcademicTemplate;
