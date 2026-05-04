import { Link } from "wouter";
import { Shield } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b border-border bg-white shadow-sm sticky top-0 z-50" data-testid="navbar">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="rounded-lg bg-primary p-1.5">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-foreground">Claim Denial Analyzer</span>
            </div>
          </Link>
          <Link href="/upload">
            <button
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
              data-testid="nav-analyze-btn"
            >
              Analyze My Denial
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
