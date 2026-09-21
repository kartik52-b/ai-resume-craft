# AI Resume Craft

A premium, AI-assisted resume creation platform. Build professional, ATS-ready resumes with live preview, 25 professional templates, AI writing assistance, resume health analysis, and high-quality multi-page PDF export.

## Tech Stack

- **Vite 5** + **React 18** + **TypeScript** (strict)
- **Tailwind CSS 3** + **shadcn/ui** (Radix primitives)
- **react-router-dom** for routing
- **jsPDF** for multi-page PDF export
- **Bun** as the package manager
- **Flask** for optional server-side AI proxy

## Getting Started

```sh
# Install dependencies
bun install

# Start dev server
bun run dev

# Run checks
bun tsc -b --noEmit   # TypeScript
bun run test:run      # Unit tests (vitest)
bun run build         # Production build
bun run e2e           # E2E tests (Playwright)
```

## Features

### Resume Editor
- **25 professional templates**: Modern, Minimal, Professional, ATS Classic, Student, Tech, Executive, Creative, Academic, Developer, Corporate, Elegant, Compact, Two Column, Portfolio, Startup, Engineering, Finance, Consultant, Research, Marketing, Designer, Healthcare, Legal, International
- **Section management**: reorder, hide/show, drag-and-drop
- **Inline validation** with real-time feedback
- **Autosave** with debounced persistence
- **Undo/redo** with full history
- **Import** from .txt, .md, .docx files

### AI Assistant (optional)
- AI-powered resume rewrites (professional, concise, achievement-focused, ATS-friendly)
- Bullet point generation from context
- Summary generation from resume content
- Skill suggestions based on role
- Job match commentary

### ATS Analysis
- Transparent 100-point scoring system
- Category breakdown: contact, summary, experience, education, skills, formatting
- Actionable recommendations
- Section-level actionable findings

### Job Matching
- Deterministic keyword and skill matching against job descriptions
- Match/missing skill visualization
- Keyword frequency analysis
- Optional AI commentary

### PDF Export
- Multi-page support with proper A4 page breaks
- Real selectable text (not rasterized)
- Template-specific typography profiles
- Auto-generated page numbers

## AI Proxy Setup

AI features run through a server-side proxy (`api/app.py`). The `GOOGLE_API_KEY` is read only on the server.

```sh
GOOGLE_API_KEY=... python3 api/app.py   # defaults to localhost:5000
```

Without the key, the app works fully for editing, saving, templates, ATS, and job matching. AI buttons show a "not configured" message.

## Project Structure

```
src/
  main.tsx               # App entry point
  App.tsx                # Root layout with sidebar
  pages/                 # Route pages
  context/               # ResumeContext — state + undo/redo + autosave
  types/resume.ts        # ResumeData model + factories
  components/
    EditorPanel.tsx      # Left pane: section editors
    PreviewPanel.tsx     # Right pane: A4 preview + zoom + PDF
    editor/              # Per-section editors
    ai/                  # AI suggestion UI (review-before-apply)
    templates/           # 25 resume templates
    ui/                  # shadcn/ui primitives
  lib/                   # Storage, store ops, PDF engine, ATS, job match
  test/                  # Unit tests (vitest)
e2e/                     # Playwright E2E tests
api/                     # Optional server-side AI proxy (Flask)
```

## Browser Support

- Chrome/Edge 90+
- Firefox 90+
- Safari 15+
