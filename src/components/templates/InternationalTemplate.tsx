import { type ResumeData } from '@/types/resume';
import {
  ACCENTS, SectionBlocks, Contact, Heading, SkillList, Summary, hidden,
} from './shared';
import { SidebarPage, Page } from './layouts';

const accent = ACCENTS.navy;

/** Universal, language-neutral layout with a compact identity rail. */
const InternationalTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  const showSkills = data.skills.length > 0 && !hidden(data, 'skills');

  return (
    <Page className="font-resume-sans text-[10px] leading-[1.45] text-zinc-800">
      <SidebarPage
        side="left"
        width="narrow"
        sidebarClassName="bg-blue-50 rounded-sm"
        sidebar={
          <div>
            {p.fullName && <h1 className="text-[16px] font-bold text-blue-950 leading-tight">{p.fullName}</h1>}
            {p.headline && <div className="text-[9px] font-medium text-blue-700 mt-1">{p.headline}</div>}
            <div className="mt-3.5">
              <Heading title="Contact" variant="underline" accent={accent} />
              <Contact p={p} variant="stacked" className="text-[8.5px] text-zinc-600" />
            </div>
            {showSkills && (
              <div className="mt-3.5">
                <Heading title="Skills" variant="underline" accent={accent} />
                <SkillList skills={data.skills} variant="sidebar" accent={accent} className="text-[8.5px] text-zinc-700" />
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
              config={{ heading: 'underline', experience: 'standard', education: 'twoline', projects: 'list', certifications: 'list', gap: 'mb-3' }}
            />
          </div>
        }
      />
    </Page>
  );
};

export default InternationalTemplate;
