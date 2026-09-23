import { type ResumeData, createEmptyResume } from '@/types/resume';

/**
 * DEMO DATA — template previews only.
 *
 * This resume is static sample content used to make template thumbnails,
 * galleries and design previews look complete before a user has any data of
 * their own. It is the ONLY place demo content lives.
 *
 * Hard rule: this data is never written into, merged with, or persisted as a
 * user's resume. `createEmptyResume()` is the starting point for real resumes;
 * user content comes exclusively from the onboarding flow or the user's edits.
 */
export function getSampleResume(): ResumeData {
  const resume = createEmptyResume();
  resume.title = 'Sample Resume';
  resume.personal = {
    fullName: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 010-2030',
    location: 'Austin, TX',
    headline: 'Senior Software Engineer',
    website: 'alexmorgan.dev',
    linkedin: 'linkedin.com/in/alexmorgan',
    github: 'github.com/alexmorgan',
    summary:
      'Full-stack software engineer with 6+ years of experience building scalable web applications. Passionate about clean code, developer experience, and delivering high-impact products.',
  };
  resume.experience = [
    {
      id: 'sample-exp-1',
      position: 'Senior Software Engineer',
      company: 'Northwind Labs',
      location: 'Austin, TX',
      startDate: 'Jan 2022',
      endDate: '',
      current: true,
      bullets: [
        'Led migration of a monolithic application to microservices, cutting deployment time by 60%',
        'Designed and implemented real-time collaboration features serving 50K+ daily active users',
        'Mentored four junior engineers and established code review best practices',
      ],
    },
    {
      id: 'sample-exp-2',
      position: 'Software Engineer',
      company: 'Contoso',
      location: 'Remote',
      startDate: 'Jun 2019',
      endDate: 'Dec 2021',
      current: false,
      bullets: [
        'Built a customer-facing dashboard that increased user engagement by 35%',
        'Developed REST APIs handling 10K+ requests per second with 99.9% uptime',
      ],
    },
  ];
  resume.education = [
    {
      id: 'sample-edu-1',
      school: 'University of Texas at Austin',
      degree: 'B.S.',
      field: 'Computer Science',
      startDate: '2015',
      endDate: '2019',
      gpa: '3.8',
    },
  ];
  resume.skills = [
    'TypeScript',
    'React',
    'Node.js',
    'Python',
    'PostgreSQL',
    'AWS',
    'Docker',
    'GraphQL',
  ];
  resume.projects = [
    {
      id: 'sample-proj-1',
      name: 'Open Source CLI Tool',
      link: 'github.com/alexmorgan/cli-tool',
      description:
        'Developer productivity CLI with 2K+ GitHub stars, built with Rust and distributed via Homebrew.',
      technologies: 'Rust, TypeScript',
    },
  ];
  resume.certifications = [
    {
      id: 'sample-cert-1',
      name: 'AWS Solutions Architect',
      issuer: 'Amazon Web Services',
      date: 'Mar 2023',
      link: '',
    },
  ];
  return resume;
}
