import { Link } from "react-router-dom";
import { ArrowRight, FilePlus2, LayoutTemplate, LayoutDashboard, PenLine } from "lucide-react";
import Carousel from "@/components/Carousel";
import { Button } from "@/components/ui/button";

/**
 * 404 — kept simple: an apology, two clear CTAs and a small (non-autoplay)
 * help slider so visitors can still find their way around.
 */

const HELP_SLIDES = [
  {
    icon: PenLine,
    title: "Start a new resume",
    text: "The guided five-step flow takes your details from a blank page to a finished design.",
    cta: { label: "Create Resume", to: "/create" },
  },
  {
    icon: LayoutTemplate,
    title: "Browse 25 templates",
    text: "Preview every design full-page before you decide — your content moves with you.",
    cta: { label: "Explore Templates", to: "/templates" },
  },
  {
    icon: LayoutDashboard,
    title: "Open your resumes",
    text: "Everything you have saved lives in this browser, ready to edit or export.",
    cta: { label: "My Resumes", to: "/resumes" },
  },
];

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-workspace py-16 px-4">
      <div className="w-full max-w-lg text-center">
        <div className="h-14 w-14 rounded-2xl bg-accent/5 border border-accent/10 flex items-center justify-center mx-auto mb-5">
          <span className="text-[20px] font-bold text-accent/40" aria-hidden>?</span>
        </div>
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground">404</h1>
        <p className="mb-7 text-[15px] text-muted-foreground">Page not found</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <Button
            asChild
            size="lg"
            className="btn-gradient h-11 px-6 rounded-xl text-[14px] font-semibold gap-2 w-full sm:w-auto"
          >
            <Link to="/">
              Back to Home <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-11 px-6 rounded-xl text-[14px] gap-2 w-full sm:w-auto"
          >
            <Link to="/create">
              <FilePlus2 className="h-4 w-4" /> Create Resume
            </Link>
          </Button>
        </div>

        {/* Small help slider — no autoplay, always fully reachable */}
        <Carousel
          variant="tips"
          autoplayMs={0}
          ariaLabel="Where to go next"
          slideLabels={HELP_SLIDES.map((s) => s.title)}
          slides={HELP_SLIDES.map(({ icon: Icon, title, text, cta }) => (
            <div key={title} className="px-4 py-3.5 text-left">
              <div className="flex items-center gap-2 mb-1">
                <span className="h-6 w-6 rounded-md bg-accent/10 text-accent flex items-center justify-center shrink-0" aria-hidden>
                  <Icon className="h-3 w-3" />
                </span>
                <span className="text-[13px] font-semibold text-foreground">{title}</span>
              </div>
              <p className="text-[12.5px] text-muted-foreground leading-relaxed mb-2">{text}</p>
              <Link
                to={cta.to}
                className="inline-flex items-center gap-1 text-[12.5px] text-accent hover:underline font-medium"
              >
                {cta.label} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        />
      </div>
    </div>
  );
}
