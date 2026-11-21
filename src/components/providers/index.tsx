"use client";

import * as React from "react";

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Global App Providers
 * Wraps the application with necessary context providers.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return <>{children}</>;
}
