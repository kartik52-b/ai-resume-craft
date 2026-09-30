import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-full items-center justify-center bg-background px-6 py-20">
      <div className="w-full max-w-md text-center animate-fade-up">
        <p className="font-display text-[44px] font-semibold leading-none text-foreground">404</p>
        <div className="mx-auto mt-5 h-px w-16 bg-border" aria-hidden />
        <h1 className="mt-5 text-[16px] font-semibold text-foreground">Page not found</h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
          The page you were looking for does not exist, or it has been moved.
        </p>
        <div className="mt-7 flex items-center justify-center gap-2.5">
          <Button asChild className="h-10 rounded-md px-5">
            <Link to="/resumes">Go to My Resumes</Link>
          </Button>
          <Button asChild variant="outline" className="h-10 rounded-md px-5">
            <Link to="/">Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
