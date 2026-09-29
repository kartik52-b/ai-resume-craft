import { type ResumeData } from '@/types/resume';
import {
  ACCENTS, SectionBlocks, Contact, Heading, SkillList, Summary, hidden,
} from './shared';
import { SidebarPage, Page } from './layouts';

const accent = ACCENTS.plum;

/** Wide tinted rail: visual identity and toolkit apart from the story. */
const DesignerTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  const showSkills = data.skills.length > 0 && !hidden(data, 'skills');

  return (
    <Page className="font-resume-sans text-[10px] leading-[1.45] text-zinc-800">
      <SidebarPage
        side="left"
        width="wide"
        sidebarClassName="bg-fuchsia-50 rounded-sm"
        sidebar={
          <div className="text-fuchsia-950">
            {p.fullName && <h1 className="text-[18px] font-extrabold tracking-tight text-fuchsia-900 leading-tight">{p.fullName}</h1>}
            {p.headline && <div className="text-[9.5px] font-semibold text-fuchsia-700 mt-1">{p.headline}</div>}
            <div className="mt-3.5">
              <Heading title="Contact" variant="underline" accent={accent} />
              <Contact p={p} variant="stacked" className="text-[8.5px] text-zinc-600" />
            </div>
            {showSkills && (
              <div className="mt-3.5">
                <Heading title="Skills" variant="underline" accent={accent} />
                <SkillList skills={data.skills} variant="chips" accent={accent} />
              </div>
            )}
          </div>
        }
        main={
          <div className="pl-4">
            {p.summary && <Summary text={p.summary} className="text-[10px] text-zinc-600 mb-3" />}
            <SectionBlocks
              data={data}
              accent={accent}
              omit={['skills']}
              config={{ heading: 'bar', experience: 'standard', education: 'compact', projects: 'list', certifications: 'inline', gap: 'mb-3' }}
            />
          </div>
        }
      />
    </Page>
  );
};

export default DesignerTemplate;
