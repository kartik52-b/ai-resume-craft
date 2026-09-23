import React, { Suspense, useState, useCallback } from "react";
import { BrowserRouter, Route, Routes, Link, useLocation, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ResumeProvider, useResume } from "@/context/ResumeContext";
import { ThemeProvider, useTheme } from "next-themes";
import TemplatePickerDialog from "@/components/TemplatePickerDialog";
import {
  LayoutDashboard, Sparkles, Brain, Palette,
  Settings, PenLine, PanelLeftClose, PanelLeft, Sun, Moon, Monitor,
  ArrowLeft, Undo2, Redo2, Download, Search, ChevronRight, FilePlus2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import SaveStatusIndicator from "@/components/SaveStatusIndicator";
import { downloadResumePdf } from "@/lib/pdfEngine";
import { toast } from "sonner";

const LandingPage = React.lazy(() => import("./pages/LandingPage.tsx"));
const Onboarding = React.lazy(() => import("./pages/Onboarding.tsx"));
const Index = React.lazy(() => import("./pages/Index.tsx"));
const Dashboard = React.lazy(() => import("./pages/Dashboard.tsx"));
const JobMatchPage = React.lazy(() => import("./pages/JobMatchPage.tsx"));
const SettingsPage = React.lazy(() => import("./pages/SettingsPage.tsx"));
const NotFound = React.lazy(() => import("./pages/NotFound.tsx"));
const AiCoach = React.lazy(() => import("./pages/AiCoach.tsx"));
const TemplatesPage = React.lazy(() => import("./pages/TemplatesPage.tsx"));

function PageLoader() {
  return (
    <div className="flex-1 p-8 space-y-4">
      <Skeleton className="h-7 w-48 rounded-md" />
      <Skeleton className="h-4 w-64 rounded-md" />
      <Skeleton className="h-[500px] w-full rounded-lg" />
    </div>
  );
}

const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      { href: "/", icon: LayoutDashboard, label: "Home" },
      { href: "/editor", icon: PenLine, label: "Resume Editor" },
      { href: "/resumes", icon: LayoutDashboard, label: "My Resumes" },
      { href: "/create", icon: FilePlus2, label: "Create Resume" },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/job-match", icon: Sparkles, label: "Job Match" },
      { href: "/coach", icon: Brain, label: "AI Coach" },
    ],
  },
  {
    label: "Design",
    items: [
      { href: "/templates", icon: Palette, label: "Templates" },
    ],
  },
];

const BOTTOM_NAV = [
  { href: "/settings", icon: Settings, label: "Settings" },
];

function Sidebar({ onNav, collapsed, onToggle }: { onNav?: () => void; collapsed: boolean; onToggle: () => void }) {
  const location = useLocation();
  const isActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn("flex items-center gap-2.5 shrink-0 border-b border-white/[0.06]", collapsed ? "px-3 py-4 justify-center" : "px-5 py-4")}>
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center shrink-0 shadow-sm">
          <span className="text-white text-[11px] font-bold tracking-tight">AI</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <span className="text-[14px] font-bold tracking-tight text-white block leading-tight">AI Resume Craft</span>
            <span className="text-[10px] text-white/30 font-medium">Build a resume that gets noticed.</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-3 space-y-3 overflow-y-auto scrollbar-thin" aria-label="Main navigation" role="navigation">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="px-3 mb-1.5 nav-group-label">{group.label}</div>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ href, icon: Icon, label }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    to={href}
                    onClick={onNav}
                    title={collapsed ? label : undefined}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg transition-all duration-150",
                      collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2",
                      active
                        ? "bg-accent/15 text-white shadow-sm shadow-accent/5"
                        : "text-white/50 hover:text-white/85 hover:bg-white/[0.04]",
                    )}
                  >
                    <Icon className={cn("shrink-0", active ? "h-[18px] w-[18px] text-accent" : "h-4 w-4")} />
                    {!collapsed && (
                      <span className={cn("text-[13px] truncate", active ? "font-medium" : "font-normal")}>
                        {label}
                      </span>
                    )}
                    {active && !collapsed && (
                      <div className="ml-auto h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto">
        <div className="px-2.5 pb-2 space-y-0.5">
          {BOTTOM_NAV.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                to={href}
                onClick={onNav}
                title={collapsed ? label : undefined}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg transition-all duration-150",
                  collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2",
                  active
                    ? "bg-white/[0.08] text-white"
                    : "text-white/35 hover:text-white/65 hover:bg-white/[0.04]",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="text-[13px]">{label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Collapse + Theme */}
        <div className={cn("flex items-center border-t border-white/[0.06]", collapsed ? "flex-col gap-1 px-1.5 py-2" : "justify-between px-3 py-3")}>
          <button
            onClick={onToggle}
            className="flex items-center gap-2 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.04] transition-colors px-2 py-1.5"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            {!collapsed && <span className="text-[12px]">Collapse</span>}
          </button>
          {!collapsed && <ThemeToggle />}
        </div>
      </div>
    </div>
  );
}

function TopBar({ onMobileMenuOpen }: { onMobileMenuOpen: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { resume, canUndo, canRedo, undo, redo, saveStatus, renameResumeAction } = useResume();
  const { theme, setTheme } = useTheme();
  const isEditor = location.pathname === "/editor";
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(resume.title);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);

  const handleTitleSubmit = useCallback(() => {
    if (titleValue.trim()) renameResumeAction(resume.id, titleValue.trim());
    else setTitleValue(resume.title);
    setEditingTitle(false);
  }, [titleValue, resume.id, resume.title, renameResumeAction]);

  const breadcrumbs = useCallback(() => {
    const parts: { label: string; href?: string; editable?: boolean }[] = [];
    if (location.pathname === "/editor") {
      parts.push({ label: "Resumes", href: "/resumes" });
      parts.push({ label: resume.title, editable: true });
    } else if (location.pathname === "/resumes") {
      parts.push({ label: "My Resumes" });
    } else if (location.pathname === "/job-match") {
      parts.push({ label: "Job Match" });
    } else if (location.pathname === "/coach") {
      parts.push({ label: "AI Coach" });
    } else if (location.pathname === "/templates") {
      parts.push({ label: "Templates" });
    } else if (location.pathname === "/settings") {
      parts.push({ label: "Settings" });
    } else if (location.pathname === "/") {
      parts.push({ label: "Home" });
    } else {
      parts.push({ label: "Not Found" });
    }
    return parts;
  }, [location.pathname, resume.title]);

  const crumbs = breadcrumbs();

  const nextTheme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <div className="h-12 shrink-0 border-b border-border/60 bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 gap-4">
      {/* Left: Breadcrumbs + mobile trigger */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          className="lg:hidden h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          onClick={onMobileMenuOpen}
          aria-label="Open navigation"
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 4h12M2 8h12M2 12h12" />
          </svg>
        </button>
        <nav className="flex items-center gap-1 text-[13px] min-w-0">
          {crumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />}
              {crumb.href ? (
                <Link to={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors truncate">{crumb.label}</Link>
              ) : crumb.editable && editingTitle ? (
                <input
                  autoFocus
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleTitleSubmit(); if (e.key === 'Escape') { setTitleValue(resume.title); setEditingTitle(false); } }}
                  className="text-foreground font-medium text-[13px] bg-muted/50 rounded px-1.5 py-0.5 outline-none focus:ring-2 focus:ring-accent/30 min-w-[120px] max-w-[200px]"
                  aria-label="Resume title"
                />
              ) : crumb.editable ? (
                <button
                  onClick={() => { setTitleValue(resume.title); setEditingTitle(true); }}
                  className="text-foreground font-medium truncate hover:text-accent transition-colors cursor-text"
                  title="Click to rename"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className="text-foreground font-medium truncate">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {isEditor && (
          <>
            <button onClick={undo} disabled={!canUndo} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-30" aria-label="Undo" title="Undo">
              <Undo2 className="h-4 w-4" />
            </button>
            <button onClick={redo} disabled={!canRedo} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-30" aria-label="Redo" title="Redo">
              <Redo2 className="h-4 w-4" />
            </button>
            <div className="h-5 w-px bg-border/60 mx-1" />
            <SaveStatusIndicator />
            <div className="h-5 w-px bg-border/60 mx-1" />
            <button
              onClick={() => setTemplatePickerOpen(true)}
              className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              title="Change the design of this resume"
            >
              <Palette className="h-3.5 w-3.5" /> Change Template
            </button>
            <div className="h-5 w-px bg-border/60 mx-1" />
            <button
              onClick={() => { try { downloadResumePdf(resume); toast.success("PDF exported"); } catch { toast.error("Export failed"); } }}
              className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-[12px] font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              <Download className="h-3.5 w-3.5" /> Export PDF
            </button>
            <TemplatePickerDialog open={templatePickerOpen} onOpenChange={setTemplatePickerOpen} />
          </>
        )}
        <div className="h-5 w-px bg-border/60 mx-1" />
        <button
          onClick={() => setTheme(nextTheme)}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          aria-label="Toggle theme"
          title={`Theme: ${theme}`}
        >
          <ThemeIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ThemeToggleInner() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <button className="h-6 w-6" />;
  const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const icon = theme === "dark" ? <Moon className="h-3.5 w-3.5" /> : theme === "light" ? <Sun className="h-3.5 w-3.5" /> : <Monitor className="h-3.5 w-3.5" />;
  return (
    <button
      onClick={() => setTheme(next)}
      className="h-7 w-7 rounded-md flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/[0.04] transition-colors"
      aria-label="Toggle theme"
      title={`Theme: ${theme} (click to switch to ${next})`}
    >
      {icon}
    </button>
  );
}

function ThemeToggle() {
  return <ThemeToggleInner />;
}

function ShellLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex shrink-0 bg-sidebar border-r border-white/[0.06] flex-col transition-all duration-200 ease-out",
          sidebarCollapsed ? "w-[60px]" : "w-[240px]",
        )}
      >
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(v => !v)} />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-fade-in" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-[260px] bg-sidebar lg:hidden animate-slide-in shadow-2xl">
            <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} onNav={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      {/* Content area */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <TopBar onMobileMenuOpen={() => setMobileOpen(true)} />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:bg-primary focus:text-primary-foreground focus:px-3 focus:py-1.5 focus:rounded-md focus:text-sm">
          Skip to content
        </a>
        <main id="main-content" tabIndex={-1} className="flex-1 min-h-0 overflow-hidden outline-none">
          <Suspense fallback={<PageLoader />}>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <TooltipProvider>
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
            <Route path="/job-match" element={<JobMatchPage />} />
            <Route path="/coach" element={<AiCoach />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ShellLayout>
      </BrowserRouter>
    </ResumeProvider>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
