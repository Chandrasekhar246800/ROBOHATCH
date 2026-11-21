"use client";

import * as React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Global App Providers
 * Wraps the application with tooltip, toast, and theme context providers.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <TooltipProvider delayDuration={200}>
      {children}
      <Toaster position="bottom-right" />
    </TooltipProvider>
  );
}
