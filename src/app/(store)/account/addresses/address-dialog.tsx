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
import { useRouter } from "next/navigation";

export interface AddressRecord {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  apartment: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  type: "SHIPPING" | "BILLING";
}

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addressToEdit?: AddressRecord | null;
}

export function AddressDialog({ open, onOpenChange, addressToEdit }: AddressDialogProps) {
  const router = useRouter();
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

  // Sync state when addressToEdit changes or modal opens
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = addressSchema.safeParse(formData);
    if (!validation.success) {
      const firstIssue =
        validation.error.issues[0]?.message || "Please check your address inputs.";
      setError(firstIssue);
      return;
    }

    setLoading(true);
    try {
      if (isEditing && addressToEdit) {
        const res = await updateAddressAction(addressToEdit.id, validation.data);
        if (!res.success) {
          setError(res.error || "Failed to update address.");
          toast.error("Address Update Failed", { description: res.error });
        } else {
          toast.success("Address Updated", {
            description: "Your address changes have been saved.",
          });
          onOpenChange(false);
          router.refresh();
        }
      } else {
        const res = await createAddressAction(validation.data);
        if (!res.success) {
          setError(res.error || "Failed to save address.");
          toast.error("Address Creation Failed", { description: res.error });
        } else {
          toast.success("Address Added", {
            description: "New delivery address has been saved to your account.",
          });
          onOpenChange(false);
          router.refresh();
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-border bg-card p-6 sm:p-7">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            {isEditing ? "Edit Delivery Address" : "Add New Delivery Address"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Addresses are strictly associated with your customer account and used for
            order fabrication delivery.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Full Name */}
            <div className="space-y-1">
              <label
                htmlFor="fullName"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Recipient Name *
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full legal name"
                className="h-9 border-border bg-background text-xs sm:text-sm"
                required
                disabled={loading}
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label
                htmlFor="phone"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Phone Number *
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className="h-9 border-border bg-background text-xs sm:text-sm"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Street Address */}
          <div className="space-y-1">
            <label
              htmlFor="street"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Street Address *
            </label>
            <Input
              id="street"
              name="street"
              type="text"
              value={formData.street}
              onChange={handleChange}
              placeholder="House/flat number, building, street, area"
              className="h-9 border-border bg-background text-xs sm:text-sm"
              required
              disabled={loading}
            />
          </div>

          {/* Apartment / Landmark */}
          <div className="space-y-1">
            <label
              htmlFor="apartment"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Apartment / Suite / Landmark (Optional)
            </label>
            <Input
              id="apartment"
              name="apartment"
              type="text"
              value={formData.apartment || ""}
              onChange={handleChange}
              placeholder="Nearby landmark, floor, unit"
              className="h-9 border-border bg-background text-xs sm:text-sm"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* City */}
            <div className="space-y-1">
              <label
                htmlFor="city"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                City *
              </label>
              <Input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="h-9 border-border bg-background text-xs sm:text-sm"
                required
                disabled={loading}
              />
            </div>

            {/* State */}
            <div className="space-y-1">
              <label
                htmlFor="state"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                State *
              </label>
              <Input
                id="state"
                name="state"
                type="text"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                className="h-9 border-border bg-background text-xs sm:text-sm"
                required
                disabled={loading}
              />
            </div>

            {/* PIN Code */}
            <div className="space-y-1">
              <label
                htmlFor="postalCode"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                PIN Code *
              </label>
              <Input
                id="postalCode"
                name="postalCode"
                type="text"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="6-digit PIN"
                className="h-9 border-border bg-background text-xs sm:text-sm"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Country (India default) */}
          <div className="space-y-1">
            <label
              htmlFor="country"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Country
            </label>
            <Input
              id="country"
              type="text"
              value="India (IN)"
              disabled
              className="h-9 cursor-not-allowed border-border/60 bg-secondary/40 text-xs text-muted-foreground"
            />
          </div>

          {/* Default Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              id="isDefault"
              name="isDefault"
              type="checkbox"
              checked={formData.isDefault}
              onChange={handleChange}
              disabled={loading}
              className="h-4 w-4 rounded border-border text-[#E87536] focus:ring-[#E87536]"
            />
            <label
              htmlFor="isDefault"
              className="cursor-pointer select-none text-xs font-medium text-foreground"
            >
              Set as primary default delivery address
            </label>
          </div>

          <DialogFooter className="mt-5 gap-2 pt-2 sm:gap-0">
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
              className="gap-2 bg-[#171717] text-xs font-semibold text-white dark:bg-white dark:text-[#171717]"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isEditing ? "Save Address" : "Add Address"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
