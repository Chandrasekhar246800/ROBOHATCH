import * as React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MainContainer } from "@/components/layout";
import { Breadcrumb } from "@/components/common";
import { CheckoutView } from "@/features/checkout";
import type { CheckoutAddress } from "@/features/checkout";

export const metadata: Metadata = {
  title: "Secure Checkout | RoboHatch",
  description: "Complete your RoboHatch 3D-printed fabrication order.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CheckoutPage() {
  // 1. Strict server-side authentication check
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/checkout");
  }

  // 2. Fetch authenticated customer's saved delivery addresses from PostgreSQL
  const rawAddresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  const addresses: CheckoutAddress[] = rawAddresses.map((addr) => ({
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
    <MainContainer size="xl" className="space-y-6 py-6 sm:py-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Shopping Cart", href: "/cart" },
          { label: "Checkout", href: "/checkout" },
        ]}
      />

      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Checkout
        </h1>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Specify your delivery destination and review your custom fabrication
          specifications.
        </p>
      </div>

      <CheckoutView initialAddresses={addresses} user={session.user} />
    </MainContainer>
  );
}
