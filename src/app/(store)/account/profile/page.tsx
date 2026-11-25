import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ShieldCheck, Calendar, ArrowLeft, Clock, Fingerprint } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileForms } from "./profile-forms";

export const metadata: Metadata = {
  title: "Profile & Identity | RoboHatch",
  description: "View and manage your RoboHatch account profile and credentials.",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/profile");
  }

  // Retrieve user record from database (passwordHash is strictly omitted)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const memberSince = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(user.createdAt));

  const lastUpdated = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(user.updatedAt));

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col gap-2 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Customer Profile & Security
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Manage your customer display name, password credentials, and account
            attributes.
          </p>
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="gap-1.5 self-start text-xs sm:self-auto"
        >
          <Link href="/account">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </Button>
      </div>

      {/* Interactive Forms: Name Edit & Password Change */}
      <ProfileForms initialUser={user} />

      {/* System Identity & Metadata Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-base font-bold text-foreground">System Account Attributes</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Immutable and system-generated database records.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Customer Identifier */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Fingerprint className="h-3.5 w-3.5 text-[#E87536]" />
              <span className="font-semibold uppercase tracking-wider">Customer ID</span>
            </div>
            <p
              className="truncate font-mono text-xs text-muted-foreground"
              title={user.id}
            >
              {user.id}
            </p>
          </div>

          {/* Account Role */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-[#E87536]" />
              <span className="font-semibold uppercase tracking-wider">Account Role</span>
            </div>
            <div>
              <Badge
                variant="outline"
                className="border-border/80 bg-secondary/50 text-xs font-semibold text-foreground"
              >
                {user.role}
              </Badge>
            </div>
          </div>

          {/* Registration Date */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-semibold uppercase tracking-wider">Member Since</span>
            </div>
            <p className="text-xs text-muted-foreground sm:text-sm">{memberSince}</p>
          </div>

          {/* Last Activity */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-semibold uppercase tracking-wider">
                Last Activity
              </span>
            </div>
            <p className="text-xs text-muted-foreground sm:text-sm">{lastUpdated}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
