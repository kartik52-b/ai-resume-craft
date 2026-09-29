import { type ResumeData } from '@/types/resume';
import {
  ACCENTS, SectionBlocks, Contact, Heading, SkillList, Summary, hidden,
} from './shared';
import { SidebarPage, Page } from './layouts';

const accent = ACCENTS.charcoal;

/** Dark full-bleed rail for contact + stack, project-forward main column. */
const DeveloperTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  const showSkills = data.skills.length > 0 && !hidden(data, 'skills');

  return (
    <Page className="font-resume-mono text-[10px] leading-[1.45] text-zinc-800">
      <SidebarPage
        side="left"
        width="narrow"
        bleed
        sidebarClassName="bg-zinc-900"
        sidebar={
          <div className="text-zinc-100">
            {p.fullName && <h1 className="text-[16px] font-bold text-white leading-tight">{p.fullName}</h1>}
            {p.headline && <div className="text-[9px] text-zinc-400 mt-1">{p.headline}</div>}
            <div className="mt-3.5">
              <Heading title="Contact" variant="side" accent={accent} />
              <Contact p={p} variant="stacked" className="text-[8.5px] text-zinc-300" />
            </div>
            {showSkills && (
              <div className="mt-3.5">
                <Heading title="Skills" variant="side" accent={accent} />
                <SkillList skills={data.skills} variant="sidebar" accent={accent} className="text-[8.5px] text-zinc-300" />
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
              omit={['skills']}
              config={{
                heading: 'bar',
                experience: 'compact',
                education: 'compact',
                projects: 'cards',
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

export default DeveloperTemplate;
