"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle } from "lucide-react";
import { addressSchema, type AddressInput } from "@/lib/validations/account";
import { createAddressAction, updateAddressAction } from "@/lib/account/actions";
import { toast } from "sonner";
import type { CheckoutAddress } from "../types/checkout-types";

interface AddressFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addressToEdit?: CheckoutAddress | null;
  onSaved: (savedAddress: CheckoutAddress) => void;
}

export function AddressFormDialog({
  open,
  onOpenChange,
  addressToEdit,
  onSaved,
}: AddressFormDialogProps) {
  const isEditing = !!addressToEdit;

  const [formData, setFormData] = React.useState<AddressInput>({
    fullName: "",
    phone: "",
    street: "",
    apartment: "",
    city: "",
    state: "",
    postalCode: "",
    country: "IN",
    isDefault: false,
    type: "SHIPPING",
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (addressToEdit) {
      setFormData({
        fullName: addressToEdit.fullName,
        phone: addressToEdit.phone,
        street: addressToEdit.street,
        apartment: addressToEdit.apartment || "",
        city: addressToEdit.city,
        state: addressToEdit.state,
        postalCode: addressToEdit.postalCode,
        country: addressToEdit.country || "IN",
        isDefault: addressToEdit.isDefault,
        type: addressToEdit.type || "SHIPPING",
      });
    } else {
      setFormData({
        fullName: "",
        phone: "",
        street: "",
        apartment: "",
        city: "",
        state: "",
        postalCode: "",
        country: "IN",
        isDefault: false,
        type: "SHIPPING",
      });
    }
    setError(null);
  }, [addressToEdit, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // 1. Client-side Zod validation
    const validation = addressSchema.safeParse(formData);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Invalid address data";
      setError(firstError);
      return;
    }

    setLoading(true);

    try {
      if (isEditing && addressToEdit) {
        // 2a. Update existing address
        const res = await updateAddressAction(addressToEdit.id, validation.data);
        if (!res.success) {
          setError(res.error || "Failed to update address.");
          toast.error("Address Update Failed", { description: res.error });
          return;
        }

        const updated: CheckoutAddress = {
          id: addressToEdit.id,
          fullName: validation.data.fullName.trim(),
          phone: validation.data.phone.trim(),
          street: validation.data.street.trim(),
          apartment: validation.data.apartment?.trim() || null,
          city: validation.data.city.trim(),
          state: validation.data.state.trim(),
          postalCode: validation.data.postalCode.trim(),
          country: validation.data.country.trim(),
          isDefault: validation.data.isDefault,
          type: validation.data.type,
        };

        toast.success("Delivery Address Updated");
        onSaved(updated);
        onOpenChange(false);
      } else {
        // 2b. Create new address
        const res = await createAddressAction(validation.data);
        if (!res.success) {
          setError(res.error || "Failed to save address.");
          toast.error("Save Address Failed", { description: res.error });
          return;
        }

        const createdData = res.data as CheckoutAddress | undefined;
        const newAddress: CheckoutAddress = createdData || {
          id: `addr_temp_${Date.now()}`,
          fullName: validation.data.fullName.trim(),
          phone: validation.data.phone.trim(),
          street: validation.data.street.trim(),
          apartment: validation.data.apartment?.trim() || null,
          city: validation.data.city.trim(),
          state: validation.data.state.trim(),
          postalCode: validation.data.postalCode.trim(),
          country: validation.data.country.trim(),
          isDefault: validation.data.isDefault,
          type: validation.data.type,
        };

        toast.success("Delivery Address Saved", {
          description: "New address has been selected for this order.",
        });
        onSaved(newAddress);
        onOpenChange(false);
      }
    } catch {
      const fallbackMsg = "An unexpected error occurred. Please try again.";
      setError(fallbackMsg);
      toast.error("Error", { description: fallbackMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 sm:p-7">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            {isEditing ? "Edit Delivery Address" : "Add New Delivery Address"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground sm:text-sm">
            {isEditing
              ? "Update your dispatch coordinates for this order."
              : "Enter delivery details for your custom 3D-printed fabrication order."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name & Phone */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="checkout-fullName"
                className="text-xs font-semibold text-foreground"
              >
                Recipient Full Name *
              </label>
              <Input
                id="checkout-fullName"
                name="fullName"
                placeholder="e.g. Aryan Sharma"
                value={formData.fullName}
                onChange={handleChange}
                disabled={loading}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="checkout-phone"
                className="text-xs font-semibold text-foreground"
              >
                Phone Number *
              </label>
              <Input
                id="checkout-phone"
                name="phone"
                placeholder="e.g. +91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
                required
                className="h-9 font-mono text-xs"
              />
            </div>
          </div>

          {/* Street Address */}
          <div className="space-y-1.5">
            <label
              htmlFor="checkout-street"
              className="text-xs font-semibold text-foreground"
            >
              Street Address *
            </label>
            <Input
              id="checkout-street"
              name="street"
              placeholder="e.g. 42 MG Road, Koramangala 4th Block"
              value={formData.street}
              onChange={handleChange}
              disabled={loading}
              required
              className="h-9 text-xs"
            />
          </div>

          {/* Apartment / Suite */}
          <div className="space-y-1.5">
            <label
              htmlFor="checkout-apartment"
              className="text-xs font-semibold text-foreground"
            >
              Apartment, Suite, Landmark (Optional)
            </label>
            <Input
              id="checkout-apartment"
              name="apartment"
              placeholder="e.g. Flat 302, Green Valley Apartments"
              value={formData.apartment || ""}
              onChange={handleChange}
              disabled={loading}
              className="h-9 text-xs"
            />
          </div>

          {/* City, State & PIN Code */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label
                htmlFor="checkout-city"
                className="text-xs font-semibold text-foreground"
              >
                City *
              </label>
              <Input
                id="checkout-city"
                name="city"
                placeholder="Bengaluru"
                value={formData.city}
                onChange={handleChange}
                disabled={loading}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="checkout-state"
                className="text-xs font-semibold text-foreground"
              >
                State *
              </label>
              <Input
                id="checkout-state"
                name="state"
                placeholder="Karnataka"
                value={formData.state}
                onChange={handleChange}
                disabled={loading}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="checkout-postalCode"
                className="text-xs font-semibold text-foreground"
              >
                PIN Code *
              </label>
              <Input
                id="checkout-postalCode"
                name="postalCode"
                placeholder="560034"
                value={formData.postalCode}
                onChange={handleChange}
                disabled={loading}
                required
                className="h-9 font-mono text-xs"
              />
            </div>
          </div>

          {/* Default Address Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="checkout-isDefault"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleChange}
              disabled={loading}
              className="h-4 w-4 rounded border-border text-[#E87536] focus:ring-[#E87536]"
            />
            <label htmlFor="checkout-isDefault" className="text-xs text-muted-foreground">
              Set as my primary default address for future orders
            </label>
          </div>

          <DialogFooter className="gap-2 pt-3 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="gap-2 bg-[#171717] text-xs font-semibold text-white hover:bg-black dark:bg-white dark:text-[#171717]"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isEditing ? "Update Address" : "Save and Select"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
