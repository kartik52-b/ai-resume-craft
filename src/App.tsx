import React, { Suspense, useState, useCallback } from "react";
import { BrowserRouter, Route, Routes, Link, useLocation, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ResumeProvider, useResume } from "@/context/ResumeContext";
import { ThemeProvider, useTheme } from "next-themes";
import TemplatePickerDialog from "@/components/TemplatePickerDialog";
import {
  Home, FileText, PenLine, LayoutTemplate, Plus,
  Settings, PanelLeftClose, PanelLeft, Sun, Moon, Monitor,
  Undo2, Redo2, Download, ChevronRight,
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
const SettingsPage = React.lazy(() => import("./pages/SettingsPage.tsx"));
const NotFound = React.lazy(() => import("./pages/NotFound.tsx"));
const TemplatesPage = React.lazy(() => import("./pages/TemplatesPage.tsx"));

function PageLoader() {
  return (
    <div className="flex-1 p-8 space-y-4">
      <Skeleton className="h-6 w-44 rounded-md" />
      <Skeleton className="h-3.5 w-60 rounded-md" />
      <Skeleton className="h-[480px] w-full rounded-lg" />
    </div>
  );
}

/**
 * Route transition — keyed on the pathname so each navigation replays a short
 * rise-and-fade. Deliberately CSS-only and short; reduced-motion visitors get
 * an instant swap.
 */
function PageTransition({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="h-full animate-page-enter">
      {children}
    </div>
  );
}

const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      { href: "/", icon: Home, label: "Home" },
      { href: "/resumes", icon: FileText, label: "My Resumes" },
      { href: "/editor", icon: PenLine, label: "Resume Editor" },
    ],
  },
  {
    label: "Design",
    items: [
      { href: "/templates", icon: LayoutTemplate, label: "Templates" },
    ],
  },
];

function BrandMark({ collapsed }: { collapsed: boolean }) {
  return (
    <Link
      to="/"
      className={cn("flex items-center gap-2.5 min-w-0 group", collapsed && "justify-center")}
      aria-label="AI Resume Craft — home"
    >
      <img
        src="/icon.svg"
        alt=""
        aria-hidden="true"
        className="h-8 w-8 shrink-0 rounded-md transition-transform duration-200 group-hover:scale-[1.03]"
      />
      {!collapsed && (
        <span className="min-w-0">
          <span className="block font-display text-[15px] font-semibold leading-tight text-foreground truncate">
            AI Resume Craft
          </span>
          <span className="block text-[10.5px] text-muted-foreground truncate">
            Resumes, designed properly
          </span>
        </span>
      )}
    </Link>
  );
}

function Sidebar({ onNav, collapsed, onToggle }: { onNav?: () => void; collapsed: boolean; onToggle: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={cn("shrink-0 border-b border-sidebar-border", collapsed ? "px-3 py-4" : "px-4 py-4")}>
        <BrandMark collapsed={collapsed} />
      </div>

      {/* Primary action */}
      <div className={cn("px-3 pt-4", collapsed && "px-2")}>
        <button
          onClick={() => { onNav?.(); navigate("/create"); }}
          className={cn(
            "w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-medium transition-colors hover:bg-primary/88",
            collapsed ? "h-9 px-0" : "h-9 px-3",
          )}
          title={collapsed ? "Create resume" : undefined}
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Create resume</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-5 overflow-y-auto scrollbar-thin" aria-label="Main navigation" role="navigation">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && <div className="px-2.5 mb-1.5 nav-group-label">{group.label}</div>}
            <div className="space-y-0.5">
              {group.items.map(({ href, icon: Icon, label }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    to={href}
                    onClick={onNav}
                    title={collapsed ? label : undefined}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-2.5 rounded-md transition-colors duration-150",
                      collapsed ? "justify-center px-2 py-2.5" : "px-2.5 py-2",
                      active
                        ? "bg-foreground/[0.055] text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.035]",
                    )}
                  >
                    {/* Active indicator — the one place bronze appears in the nav. */}
                    {active && (
                      <span
                        aria-hidden
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2.5px] rounded-full bg-bronze"
                      />
                    )}
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                      <span className={cn("text-[13px] truncate", active ? "font-medium" : "font-normal")}>
                        {label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-sidebar-border">
        <div className={cn("px-3 py-3", collapsed && "px-2")}>
          <Link
            to="/settings"
            onClick={onNav}
            title={collapsed ? "Settings" : undefined}
            aria-current={isActive("/settings") ? "page" : undefined}
            className={cn(
              "relative flex items-center gap-2.5 rounded-md transition-colors duration-150",
              collapsed ? "justify-center px-2 py-2.5" : "px-2.5 py-2",
              isActive("/settings")
                ? "bg-foreground/[0.055] text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.035]",
            )}
          >
            {isActive("/settings") && (
              <span aria-hidden className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2.5px] rounded-full bg-bronze" />
            )}
            <Settings className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="text-[13px]">Settings</span>}
          </Link>
        </div>

        <div className={cn("flex items-center border-t border-sidebar-border", collapsed ? "flex-col gap-1 px-1.5 py-2" : "justify-between px-3 py-2.5")}>
          <button
            onClick={onToggle}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground hover:text-foreground hover:bg-foreground/[0.035] transition-colors"
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
  const { resume, canUndo, canRedo, undo, redo, renameResumeAction } = useResume();
  const isEditor = location.pathname === "/editor";
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(resume.title);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);

  const handleTitleSubmit = useCallback(() => {
    if (titleValue.trim()) renameResumeAction(resume.id, titleValue.trim());
    else setTitleValue(resume.title);
    setEditingTitle(false);
  }, [titleValue, resume.id, resume.title, renameResumeAction]);

  const crumbs = useCallback(() => {
    const parts: { label: string; href?: string; editable?: boolean }[] = [];
    if (location.pathname === "/editor") {
      parts.push({ label: "Resumes", href: "/resumes" });
      parts.push({ label: resume.title, editable: true });
    } else if (location.pathname === "/resumes") {
      parts.push({ label: "My Resumes" });
    } else if (location.pathname === "/templates") {
      parts.push({ label: "Templates" });
    } else if (location.pathname === "/settings") {
      parts.push({ label: "Settings" });
    } else if (location.pathname === "/") {
      parts.push({ label: "Home" });
    } else {
      parts.push({ label: "Not found" });
    }
    return parts;
  }, [location.pathname, resume.title]);

  const crumbsList = crumbs();

  return (
    <div className="relative z-20 h-12 shrink-0 border-b border-border bg-card flex items-center justify-between px-3 lg:px-4 gap-4">
      {/* Left: mobile trigger + breadcrumbs */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          className="lg:hidden h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          onClick={onMobileMenuOpen}
          aria-label="Open navigation"
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 4h12M2 8h12M2 12h12" />
          </svg>
        </button>
        <nav className="flex items-center gap-1 text-[13px] min-w-0" aria-label="Breadcrumb">
          {crumbsList.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/60 shrink-0" />}
              {crumb.href ? (
                <Link to={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors truncate">{crumb.label}</Link>
              ) : crumb.editable && editingTitle ? (
                <input
                  autoFocus
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleTitleSubmit(); if (e.key === 'Escape') { setTitleValue(resume.title); setEditingTitle(false); } }}
                  className="text-foreground font-medium text-[13px] bg-muted rounded px-1.5 py-0.5 outline-none focus:ring-2 focus:ring-ring/40 min-w-[120px] max-w-[220px]"
                  aria-label="Resume title"
                />
              ) : crumb.editable ? (
                <button
                  onClick={() => { setTitleValue(resume.title); setEditingTitle(true); }}
                  className="text-foreground font-medium truncate hover:text-bronze transition-colors cursor-text"
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

      {/* Right: editor actions */}
      <div className="flex items-center gap-1 shrink-0">
        {isEditor && (
          <>
            <button onClick={undo} disabled={!canUndo} className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:hover:bg-transparent" aria-label="Undo" title="Undo">
              <Undo2 className="h-4 w-4" />
            </button>
            <button onClick={redo} disabled={!canRedo} className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:hover:bg-transparent" aria-label="Redo" title="Redo">
              <Redo2 className="h-4 w-4" />
            </button>
            <div className="h-5 w-px bg-border mx-1 hidden sm:block" />
            <div className="hidden sm:block"><SaveStatusIndicator /></div>
            <div className="h-5 w-px bg-border mx-1 hidden sm:block" />
            <button
              onClick={() => setTemplatePickerOpen(true)}
              className="hidden md:flex h-8 px-2.5 rounded-md items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Change this resume's design"
            >
              <LayoutTemplate className="h-3.5 w-3.5" /> Design
            </button>
            <div className="h-5 w-px bg-border mx-1 hidden md:block" />
            <button
              onClick={() => { try { downloadResumePdf(resume); toast.success("PDF exported"); } catch { toast.error("Export failed"); } }}
              className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-[12px] font-medium flex items-center gap-1.5 hover:bg-primary/88 transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Export</span> PDF
            </button>
            <TemplatePickerDialog open={templatePickerOpen} onOpenChange={setTemplatePickerOpen} />
          </>
        )}
        <div className="h-5 w-px bg-border mx-1" />
        <ThemeToggle />
      </div>
    </div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <span className="h-8 w-8 inline-block" />;
  const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  return (
    <button
      onClick={() => setTheme(next)}
      className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      aria-label="Toggle theme"
      title={`Theme: ${theme} — click to switch to ${next}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function ShellLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop rail */}
      <aside
        className={cn(
          "hidden lg:flex shrink-0 bg-sidebar border-r border-sidebar-border flex-col transition-[width] duration-200 ease-premium",
          sidebarCollapsed ? "w-[64px]" : "w-[236px]",
        )}
      >
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(v => !v)} />
      </aside>

      {/* Mobile rail */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-foreground/25 lg:hidden animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-[264px] bg-sidebar lg:hidden animate-drawer-in shadow-modal">
            <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} onNav={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <TopBar onMobileMenuOpen={() => setMobileOpen(true)} />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:bg-primary focus:text-primary-foreground focus:px-3 focus:py-1.5 focus:rounded-md focus:text-sm">
          Skip to content
        </a>
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scroll-smooth scrollbar-thin outline-none"
        >
          <Suspense fallback={<PageLoader />}>
            <PageTransition>{children}</PageTransition>
          </Suspense>
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
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
