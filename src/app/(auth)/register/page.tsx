import * as React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create an Account | RoboHatch",
  description:
    "Register for a RoboHatch account to manage your 3D-printed orders, save shipping preferences, and access exclusive design drops.",
  alternates: {
    canonical: "/register",
  },
};

export default async function RegisterPage() {
  // If already authenticated, redirect to account dashboard
  const session = await auth();
  if (session?.user) {
    redirect("/account");
  }

  return <RegisterForm />;
}
