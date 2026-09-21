import { type ResumeData, createEmptyResume } from "@/types/resume";

/**
 * Sample resume data used ONLY for template previews on the Templates page
 * and for empty-resume demo previews. This is static demo data — never
 * persisted or mutated into the user's actual resume.
 */
export function getSampleResume(): ResumeData {
  const resume = createEmptyResume();
  resume.title = "Software Engineer";
  resume.personal = {
    fullName: "Kartik Bhardwaj",
    email: "kartik@example.com",
    phone: "+91 98765 43210",
    location: "Agra, Uttar Pradesh, India",
    website: "kartik.dev",
    linkedin: "linkedin.com/in/kartikbhardwaj",
    github: "github.com/kartikbhardwaj",
    summary:
      "Full-stack software engineer with 5+ years of experience building scalable web applications. Passionate about clean code, developer experience, and delivering high-impact products.",
  };
  resume.experience = [
    {
      id: "exp-1",
      position: "Senior Software Engineer",
      company: "TechCorp India Pvt. Ltd.",
      location: "Noida, India",
      startDate: "Jan 2022",
      endDate: "",
      current: true,
      bullets: [
        "Led migration of monolithic application to microservices architecture, reducing deployment time by 60%",
        "Designed and implemented real-time collaboration features serving 50K+ daily active users",
        "Mentored team of 4 junior engineers and established code review best practices",
      ],
    },
    {
      id: "exp-2",
      position: "Software Engineer",
      company: "StartupXYZ",
      location: "Remote",
      startDate: "Jun 2019",
      endDate: "Dec 2021",
      current: false,
      bullets: [
        "Built customer-facing dashboard that increased user engagement by 35%",
        "Developed RESTful APIs handling 10K+ requests per second with 99.9% uptime",
        "Implemented CI/CD pipeline reducing release cycle from weekly to daily",
      ],
    },
  ];
  resume.education = [
    {
      id: "edu-1",
      school: "Dr. B.R. Ambedkar University, Agra",
      degree: "B.Tech",
      field: "Computer Science",
      startDate: "2015",
      endDate: "2019",
      gpa: "8.5",
    },
  ];
  resume.skills = [
    "TypeScript",
    "React",
    "Node.js",
    "Python",
    "PostgreSQL",
    "AWS",
    "Docker",
    "GraphQL",
  ];
  resume.projects = [
    {
      id: "proj-1",
      name: "Open Source CLI Tool",
      link: "github.com/kartikbhardwaj/cli-tool",
      description:
        "Developer productivity CLI with 2K+ GitHub stars. Built with Rust and distributed via Homebrew.",
      technologies: "Rust, TypeScript",
    },
  ];
  resume.certifications = [
    {
      id: "cert-1",
      name: "AWS Solutions Architect",
      issuer: "Amazon Web Services",
      date: "Mar 2023",
      link: "",
    },
  ];
  return resume;
}
