import React, { Suspense, useCallback, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, Link, NavLink, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ResumeProvider, useResume } from "@/context/ResumeContext";
import { ThemeProvider, useTheme } from "next-themes";
import TemplatePickerDialog from "@/components/TemplatePickerDialog";
import SaveStatusIndicator from "@/components/SaveStatusIndicator";
import { downloadResumePdf } from "@/lib/pdfEngine";
import { toast } from "sonner";
import {
  Home, FilePlus2, LayoutTemplate, LayoutDashboard, PenLine,
  Sun, Moon, Monitor, Menu, X, Download, Undo2, Redo2, Palette,
  ChevronRight, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LandingPage = React.lazy(() => import("./pages/LandingPage.tsx"));
const Onboarding = React.lazy(() => import("./pages/Onboarding.tsx"));
const Index = React.lazy(() => import("./pages/Index.tsx"));
const Dashboard = React.lazy(() => import("./pages/Dashboard.tsx"));
const NotFound = React.lazy(() => import("./pages/NotFound.tsx"));
const TemplatesPage = React.lazy(() => import("./pages/TemplatesPage.tsx"));
const SettingsPage = React.lazy(() => import("./pages/SettingsPage.tsx"));

function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center py-24" role="status" aria-label="Loading page">
      <span className="h-7 w-7 rounded-full border-2 border-border border-t-accent animate-spin" aria-hidden />
    </div>
  );
}

/* ── Theme toggle (light → dark → system) ─────────────────────────────── */

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <span className={cn("h-8 w-8", className)} aria-hidden />;
  const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className={cn(
        "h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors",
        className,
      )}
      aria-label="Toggle theme"
      title={`Theme: ${theme} (click for ${next})`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

/* ── Logo ─────────────────────────────────────────────────────────────── */

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="AI Resume Craft — Home">
      <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
        <PenLine className="h-4 w-4 text-white" aria-hidden />
      </span>        <span className="leading-tight">
          <span className="block text-[14px] font-bold tracking-tight text-foreground">AI Resume Craft</span>
          <span className="hidden sm:block text-[11px] text-muted-foreground font-medium">Create a resume that gets you noticed.</span>
        </span>
    </Link>
  );
}

/* ── Header navigation ────────────────────────────────────────────────── */

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/create", icon: FilePlus2, label: "Create Resume" },
  { href: "/templates", icon: LayoutTemplate, label: "Templates" },
  { href: "/resumes", icon: LayoutDashboard, label: "My Resumes" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

function SiteHeader() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes.
  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 h-14 flex items-center justify-between gap-4">
        <div className={cn("flex items-center gap-2.5 shrink-0", menuOpen && "invisible sm:visible")}>
          <Logo />
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          {NAV_ITEMS.map(({ href, label }) => (
            <NavLink
              key={href}
              to={href}
              end={href === "/"}
              className={({ isActive }) =>
                cn(
                  "px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors duration-150",
                  isActive
                    ? "text-accent bg-accent/10 shadow-sm shadow-accent/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/create"
            className="btn-gradient hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-[13px] font-semibold"
          >
            <FilePlus2 className="h-3.5 w-3.5" /> Create Resume
          </Link>
          <button
            type="button"
            className="lg:hidden h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav id="mobile-nav" className="lg:hidden border-t border-border/60 bg-background px-4 py-3 space-y-1 animate-fade-in" aria-label="Mobile navigation">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
            <NavLink
              key={href}
              to={href}
              end={href === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-colors duration-150",
                  isActive
                    ? "text-accent bg-accent/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0 opacity-70" /> {label}
            </NavLink>
          ))}
          <Link to="/create" className="btn-gradient mt-2 flex items-center justify-center gap-1.5 h-10 rounded-xl text-[13.5px] font-semibold">
            <FilePlus2 className="h-4 w-4" /> Create Resume
          </Link>
        </nav>
      )}
    </header>
  );
}

/* ── Editor toolbar (only on /editor) ─────────────────────────────────── */

function EditorToolbar() {
  const { resume, canUndo, canRedo, undo, redo, renameResumeAction } = useResume();
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(resume.title);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);

  const handleTitleSubmit = useCallback(() => {
    if (titleValue.trim()) renameResumeAction(resume.id, titleValue.trim());
    else setTitleValue(resume.title);
    setEditingTitle(false);
  }, [titleValue, resume.id, resume.title, renameResumeAction]);

  return (
    <div className="h-12 shrink-0 border-b border-border/60 bg-card/80 backdrop-blur-sm flex items-center justify-between px-3 sm:px-4 gap-2">
      {/* Left: breadcrumb + inline rename */}
      <div className="flex items-center gap-1.5 text-[13px] min-w-0">
        <Link to="/resumes" className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
          My Resumes
        </Link>
        <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" aria-hidden />
        {editingTitle ? (
          <input
            autoFocus
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleTitleSubmit();
              if (e.key === "Escape") {
                setTitleValue(resume.title);
                setEditingTitle(false);
              }
            }}
            className="text-foreground font-medium text-[13px] bg-muted/50 rounded px-1.5 py-0.5 outline-none focus:ring-2 focus:ring-accent/30 min-w-[120px] max-w-[200px]"
            aria-label="Resume title"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setTitleValue(resume.title);
              setEditingTitle(true);
            }}
            className="text-foreground font-medium truncate hover:text-accent transition-colors cursor-text"
            title="Click to rename"
          >
            {resume.title}
          </button>
        )}
      </div>

      {/* Right: history, save status, template, export */}
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={undo} disabled={!canUndo} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-30" aria-label="Undo" title="Undo">
          <Undo2 className="h-4 w-4" />
        </button>
        <button onClick={redo} disabled={!canRedo} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-30" aria-label="Redo" title="Redo">
          <Redo2 className="h-4 w-4" />
        </button>
        <div className="h-5 w-px bg-border/60 mx-1" aria-hidden />
        <SaveStatusIndicator />
        <div className="h-5 w-px bg-border/60 mx-1" aria-hidden />
        <ThemeToggle />
        <button
          onClick={() => setTemplatePickerOpen(true)}
          className="h-8 px-2 sm:px-2.5 rounded-lg hidden sm:flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          title="Change the design of this resume"
        >
          <Palette className="h-3.5 w-3.5" /> <span className="hidden md:inline">Change Template</span>
        </button>
        <button
          onClick={() => {
            try {
              downloadResumePdf(resume);
              toast.success("PDF exported", { description: "Check your downloads folder." });
            } catch {
              toast.error("Export failed", { description: "Something went wrong while generating the PDF. Please try again." });
            }
          }}
          className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-[12px] font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity"
        >
          <Download className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Export PDF</span>
        </button>
        <TemplatePickerDialog open={templatePickerOpen} onOpenChange={setTemplatePickerOpen} />
      </div>
    </div>
  );
}

/* ── Layout ───────────────────────────────────────────────────────────── */

function ShellLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const isEditor = pathname === "/editor";

  if (isEditor) {
    // The editor fills the viewport and manages its own internal scrolling.
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-background">
        <EditorToolbar />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:bg-primary focus:text-primary-foreground focus:px-3 focus:py-1.5 focus:rounded-md focus:text-sm">
          Skip to content
        </a>
        <main id="main-content" tabIndex={-1} className="flex-1 min-h-0 flex flex-col outline-none">
          <Suspense fallback={<PageLoader />}>{children}</Suspense>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:bg-primary focus:text-primary-foreground focus:px-3 focus:py-1.5 focus:rounded-md focus:text-sm">
        Skip to content
      </a>
      <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col outline-none">
        <Suspense fallback={<PageLoader />}>{children}</Suspense>
      </main>
    </div>
  );
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <Sonner
      toastOptions={{
        className: "dark:bg-card dark:text-card-foreground dark:border-border/40",
        style: {
          fontSize: "13px",
          fontFamily: "'Inter', system-ui, sans-serif",
        },
      }}
    />
    <ResumeProvider>
      <BrowserRouter>
        <ShellLayout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/create" element={<Onboarding />} />
            <Route path="/editor" element={<Index />} />
            <Route path="/resumes" element={<Dashboard />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ShellLayout>
      </BrowserRouter>
    </ResumeProvider>
  </ThemeProvider>
);

export default App;
