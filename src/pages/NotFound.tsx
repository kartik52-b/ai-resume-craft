import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-full items-center justify-center bg-workspace">
      <div className="text-center">
        <div className="h-14 w-14 rounded-2xl bg-accent/5 border border-accent/10 flex items-center justify-center mx-auto mb-5">
          <span className="text-[20px] font-bold text-accent/40">?</span>
        </div>
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground">404</h1>
        <p className="mb-6 text-[15px] text-muted-foreground">Page not found</p>
        <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity">Go to Resume Editor</Link>
      </div>
    </div>
  );
}
