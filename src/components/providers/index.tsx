"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Global App Providers
 * Wraps the application with Auth.js SessionProvider, tooltip, and toast providers.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SessionProvider>
      <TooltipProvider delayDuration={200}>
        {children}
        <Toaster position="bottom-right" />
      </TooltipProvider>
    </SessionProvider>
  );
}
