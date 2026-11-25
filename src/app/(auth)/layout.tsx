import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#FAFAF8] px-4 py-8 text-[#171717] selection:bg-[#E87536] selection:text-white dark:bg-background sm:px-6 lg:px-8">
      {/* Top Header / Back Link */}
      <header className="mx-auto flex w-full max-w-md items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Store</span>
        </Link>

        {/* Minimalist Brand Monogram */}
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#171717] font-mono text-xs font-bold text-white dark:bg-white dark:text-[#171717]">
            RH
          </span>
          <span className="font-semibold tracking-tight text-foreground">RoboHatch</span>
        </Link>
      </header>

      {/* Main Auth Content */}
      <main className="my-auto py-8">{children}</main>

      {/* Security & Craft Footer */}
      <footer className="mx-auto w-full max-w-md text-center text-xs text-muted-foreground">
        <p>RoboHatch · Precision Additive Manufacturing & Functional Architecture</p>
        <p className="mt-1 text-[11px] text-muted-foreground/70">
          Secure account access · Zero plaintext password storage · Protected
          authentication
        </p>
      </footer>
    </div>
  );
}
