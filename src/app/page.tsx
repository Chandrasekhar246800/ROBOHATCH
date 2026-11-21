import { Button } from "@/components/ui/button";
import { Terminal, ShieldCheck, Database, Layers, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto max-w-xl space-y-8 rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E87536]" />
            Phase 0: Technical Architecture & Foundation
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            RoboHatch
          </h1>
          <p className="text-sm text-muted-foreground">
            Premium e-commerce platform for high-precision 3D-printed products. Core
            technical foundation and architecture initialized.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-left text-xs">
          <div className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary/50 p-3">
            <Layers className="h-4 w-4 text-[#E87536]" />
            <div>
              <div className="font-medium text-foreground">Next.js 15 App Router</div>
              <div className="text-muted-foreground">React 19 & TypeScript</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary/50 p-3">
            <Database className="h-4 w-4 text-[#E87536]" />
            <div>
              <div className="font-medium text-foreground">Prisma ORM</div>
              <div className="text-muted-foreground">PostgreSQL Schema Ready</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary/50 p-3">
            <Terminal className="h-4 w-4 text-[#E87536]" />
            <div>
              <div className="font-medium text-foreground">Design System</div>
              <div className="text-muted-foreground">Tailwind CSS & Tokens</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary/50 p-3">
            <ShieldCheck className="h-4 w-4 text-[#E87536]" />
            <div>
              <div className="font-medium text-foreground">Modular Architecture</div>
              <div className="text-muted-foreground">Strict Type Contracts</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            Foundation Status: Ready for Phase 1
          </span>
          <Button variant="brand" size="sm">
            Phase 0 Verified
          </Button>
        </div>
      </div>
    </main>
  );
}
