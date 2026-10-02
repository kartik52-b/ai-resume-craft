import { type ResumeData } from '@/types/resume';
import {
  ACCENTS, Block, SectionBlocks, Contact, Summary, hidden, SkillList, CertificationList,
} from './shared';
import { SplitBody, Page } from './layouts';

const accent = ACCENTS.steel;

/** Expressive asymmetric header, wide tinted left rail, project cards in the main column. */
const GraphicTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  const showSkills = data.skills.length > 0 && !hidden(data, 'skills');
  const showCerts = data.certifications.length > 0 && !hidden(data, 'certifications');
  const showProjects = data.projects.length > 0 && !hidden(data, 'projects');

  return (
    <Page className="font-resume-sans text-[10px] leading-[1.45] text-zinc-800">
      <SplitBody
        header={
          <header className="mb-3">
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0">
                {p.fullName && <h1 className="text-[22px] font-bold text-zinc-900">{p.fullName}</h1>}
                {p.headline && <div className="text-[10px] font-medium text-zinc-500">{p.headline}</div>}
              </div>
              <div className="text-right shrink-0">
                <Contact p={p} variant="stacked" className="text-[9px] text-zinc-500" />
                <div className="mt-1.5 h-[2px] w-12 rounded-full" style={{ background: 'hsl(210 50% 45% / 0.5)' }} />
              </div>
            </div>
          </header>
        }
        ratio="wide"
        asideFirst
        asideClassName="bg-zinc-100 border-r border-zinc-200 p-3 rounded-sm"
        aside={
          <div className="space-y-3 text-zinc-800">
            <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-500 mb-1">Contact</div>
            <Contact p={p} variant="stacked" className="text-[9px]" />
            {showSkills && (
              <Block title="Skills" heading="plain" accent={accent}>
                <SkillList skills={data.skills} variant="chips" accent={accent} />
              </Block>
            )}
            {showProjects && (
              <Block title="Projects" heading="plain" accent={accent}>
                <SectionBlocks
                  data={data}
                  accent={accent}
                  config={{ projects: 'cards', gap: 'mb-0' }}
                />
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
          <div className="pr-3">
            {p.summary && <Summary text={p.summary} className="text-[10px] text-zinc-600 mb-3" />}
            <SectionBlocks
              data={data}
              accent={accent}
              omit={['skills', 'projects', 'certifications']}
              config={{
                heading: 'bar',
                experience: 'standard',
                education: 'twoline',
                gap: 'mb-3',
              }}
            />
          </div>
        }
      />
    </Page>
  );
};

export default GraphicTemplate;
