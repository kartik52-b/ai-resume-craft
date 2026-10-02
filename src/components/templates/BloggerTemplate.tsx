import { type ResumeData } from '@/types/resume';
import {
  ACCENTS, SectionBlocks, Contact, Summary, hidden, SkillList, CertificationList,
} from './shared';
import { SidebarPage, Page } from './layouts';

const accent = ACCENTS.plum;

/** Left stacked contact + skills rail, small-caps boxed labels, narrative main column. */
const BloggerTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  const showSkills = data.skills.length > 0 && !hidden(data, 'skills');
  const showCerts = data.certifications.length > 0 && !hidden(data, 'certifications');

  return (
    <Page className="font-resume-sans text-[10px] leading-[1.45] text-zinc-800">
      <SidebarPage
        side="left"
        width="narrow"
        bleed={false}
        sidebarClassName="border-r border-fuchsia-200 bg-fuchsia-50/50 p-3 rounded-sm"
        sidebar={
          <div className="text-fuchsia-900">
            {p.fullName && <h1 className="text-[16px] font-bold text-fuchsia-950 leading-tight">{p.fullName}</h1>}
            {p.headline && <div className="text-[9px] text-fuchsia-700 mt-1">{p.headline}</div>}
            <div className="mt-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.16em] mb-1">Contact</div>
              <Contact p={p} variant="stacked" className="text-[8.5px]" />
            </div>
            {showSkills && (
              <div className="mt-3">
                <div className="text-[9px] font-bold uppercase tracking-[0.16em] mb-1">Skills</div>
                <SkillList skills={data.skills} variant="sidebar" accent={accent} className="text-[8.5px]" />
              </div>
            )}
            {showCerts && (
              <div className="mt-3">
                <div className="text-[9px] font-bold uppercase tracking-[0.16em] mb-1">Certifications</div>
                <CertificationList items={data.certifications} variant="list" accent={accent} className="text-[8.5px]" />
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
              omit={['skills', 'certifications']}
              config={{
                heading: 'boxed',
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

export default BloggerTemplate;
