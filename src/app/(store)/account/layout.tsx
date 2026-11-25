import * as React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MainContainer } from "@/components/layout";
import { Breadcrumb } from "@/components/common";
import { AccountNav } from "./account-nav";

export const metadata: Metadata = {
  title: "Customer Account | RoboHatch",
  description: "Manage your RoboHatch account, profile details, and orders.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  // Server-side authentication check
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/account");
  }

  return (
    <MainContainer size="xl" className="space-y-6 py-6 sm:py-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "My Account", href: "/account" },
        ]}
      />

      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12 lg:gap-10">
        {/* Left Column: Account Navigation & Identity */}
        <aside className="md:col-span-4 lg:col-span-3">
          <AccountNav user={session.user} />
        </aside>

        {/* Right Column: Protected Child Content */}
        <div className="min-w-0 md:col-span-8 lg:col-span-9">{children}</div>
      </div>
    </MainContainer>
  );
}
