import * as React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSafeCallbackUrl } from "@/lib/auth/callback-url";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign In | RoboHatch",
  description:
    "Sign in to your RoboHatch account to access your 3D-printed orders, saved items, and personalized settings.",
  alternates: {
    canonical: "/login",
  },
};

interface LoginPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const rawCallback =
    typeof resolvedSearchParams.callbackUrl === "string"
      ? resolvedSearchParams.callbackUrl
      : null;
  const safeCallback = getSafeCallbackUrl(rawCallback, "/account");

  // If already authenticated, redirect immediately
  const session = await auth();
  if (session?.user) {
    redirect(safeCallback);
  }

  const isRegistered = resolvedSearchParams.registered === "true";

  return <LoginForm callbackUrl={safeCallback} isRegistered={isRegistered} />;
}
