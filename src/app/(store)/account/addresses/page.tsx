import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddressBookView } from "./address-book-view";

export const metadata: Metadata = {
  title: "Delivery Addresses | RoboHatch",
  description: "Manage your saved shipping and delivery addresses.",
};

export default async function AddressesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/addresses");
  }

  // Scoped strictly to the authenticated user ID
  const rawAddresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  const addresses = rawAddresses.map((addr) => ({
    id: addr.id,
    fullName: addr.fullName,
    phone: addr.phone,
    street: addr.street,
    apartment: addr.apartment,
    city: addr.city,
    state: addr.state,
    postalCode: addr.postalCode,
    country: addr.country,
    isDefault: addr.isDefault,
    type: addr.type,
  }));

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col gap-2 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Address Book
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Save and manage delivery locations for your custom 3D-printed fabrications.
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

      {/* Address Book Client View */}
      <AddressBookView initialAddresses={addresses} />
    </div>
  );
}
