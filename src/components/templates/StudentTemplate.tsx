import { type ResumeData } from '@/types/resume';
import {
  ACCENTS, Block, SectionBlocks, Contact, Summary, hidden, EducationList, ProjectList,
} from './shared';
import { SplitBody, Page } from './layouts';

const accent = ACCENTS.blue;

/** Centered header, then education + projects promoted into the left column. */
const StudentTemplate = ({ data }: { data: ResumeData }) => {
  const p = data.personal;
  const showEdu = data.education.length > 0 && !hidden(data, 'education');
  const showProjects = data.projects.length > 0 && !hidden(data, 'projects');

  return (
    <Page className="font-resume-sans text-[10.5px] leading-[1.5] text-zinc-800">
      <header className="text-center mb-4 pb-3 border-b border-blue-200">
        {p.fullName && <h1 className="text-[23px] font-bold tracking-tight text-blue-950">{p.fullName}</h1>}
        {p.headline && <div className="text-[11px] font-medium text-blue-700 mt-0.5">{p.headline}</div>}
        <Contact p={p} variant="dot" className="justify-center text-[9.5px] text-zinc-500 mt-1.5" />
      </header>
      {p.summary && <Summary text={p.summary} className="text-[10.5px] text-zinc-600 mb-3.5" />}

      <SplitBody
        asideFirst
        ratio="wide"
        asideClassName="border-r border-blue-100 pr-3.5"
        aside={
          <div className="space-y-4">
            {showEdu && (
              <Block title="Education" heading="bar" accent={accent}>
                <EducationList items={data.education} variant="stacked" accent={accent} />
              </Block>
            )}
            {showProjects && (
              <Block title="Projects" heading="bar" accent={accent}>
                <ProjectList items={data.projects} variant="list" accent={accent} />
              </Block>
            )}
          </div>
        }
        main={
          <SectionBlocks
            data={data}
            accent={accent}
            omit={['education', 'projects']}
            config={{ heading: 'bar', experience: 'standard', skills: 'chips', certifications: 'list', gap: 'mb-4' }}
          />
        }
      />
    </Page>
  );
};

export default StudentTemplate;
