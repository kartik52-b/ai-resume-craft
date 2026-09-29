import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="relative flex min-h-full items-center justify-center overflow-hidden bg-workspace">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="aurora animate-aurora opacity-50" />
        <div className="grid-veil" />
      </div>

      <div className="relative z-10 text-center animate-fade-up">
        <div className="icon-chip mx-auto mb-5 h-16 w-16 rounded-2xl">
          <span className="font-display text-[20px] font-bold">?</span>
        </div>
        <h1 className="font-display mb-2 text-4xl font-bold tracking-tight text-foreground">404</h1>
        <p className="mb-6 text-[15px] text-muted-foreground">Page not found</p>
        <Link
          to="/"
          className="btn-gradient inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold"
        >
          Go to Resume Editor
        </Link>
      </div>
    </div>
  );
}
