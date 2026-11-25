"use client";

import * as React from "react";
import { Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddressCard } from "./address-card";
import { AddressFormDialog } from "./address-form-dialog";
import type { CheckoutAddress } from "../types/checkout-types";

interface AddressSelectionProps {
  addresses: CheckoutAddress[];
  selectedAddressId: string | null;
  onSelectAddress: (address: CheckoutAddress) => void;
  onAddressListChange: (updatedList: CheckoutAddress[]) => void;
}

export function AddressSelection({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddressListChange,
}: AddressSelectionProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingAddress, setEditingAddress] = React.useState<CheckoutAddress | null>(
    null
  );

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (addr: CheckoutAddress) => {
    setEditingAddress(addr);
    setDialogOpen(true);
  };

  const handleSavedAddress = (saved: CheckoutAddress) => {
    const existingIndex = addresses.findIndex((a) => a.id === saved.id);
    let updatedList: CheckoutAddress[];

    if (existingIndex >= 0) {
      updatedList = [...addresses];
      updatedList[existingIndex] = saved;
    } else {
      updatedList = [saved, ...addresses];
    }

    // If marked default, toggle off other default flags
    if (saved.isDefault) {
      updatedList = updatedList.map((a) =>
        a.id === saved.id ? a : { ...a, isDefault: false }
      );
    }

    onAddressListChange(updatedList);
    onSelectAddress(saved);
  };

  return (
    <section aria-labelledby="shipping-address-heading" className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#171717] text-xs font-bold text-white dark:bg-white dark:text-[#171717]">
            1
          </div>
          <h2
            id="shipping-address-heading"
            className="text-base font-bold text-foreground sm:text-lg"
          >
            Delivery Address
          </h2>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleOpenAdd}
          className="gap-1.5 self-start text-xs font-medium sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5 text-[#E87536]" />
          <span>Add New Address</span>
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center sm:p-8">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
            <MapPin className="h-5 w-5 stroke-[1.75]" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-foreground">
            No Delivery Address Found
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
            Please add a delivery address to complete your 3D-printed fabrication
            checkout.
          </p>
          <div className="mt-4">
            <Button
              type="button"
              size="sm"
              onClick={handleOpenAdd}
              className="gap-1.5 bg-[#171717] px-4 text-xs font-semibold text-white dark:bg-white dark:text-[#171717]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Delivery Address</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              isSelected={selectedAddressId === addr.id}
              onSelect={onSelectAddress}
              onEdit={handleOpenEdit}
            />
          ))}
        </div>
      )}

      {/* Reusable Form Dialog */}
      <AddressFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        addressToEdit={editingAddress}
        onSaved={handleSavedAddress}
      />
    </section>
  );
}
