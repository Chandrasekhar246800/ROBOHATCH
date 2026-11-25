"use client";

import * as React from "react";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Phone,
  Home,
  Star,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddressDialog, type AddressRecord } from "./address-dialog";
import { deleteAddressAction, setDefaultAddressAction } from "@/lib/account/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AddressBookViewProps {
  initialAddresses: AddressRecord[];
}

export function AddressBookView({ initialAddresses }: AddressBookViewProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingAddress, setEditingAddress] = React.useState<AddressRecord | null>(null);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (addr: AddressRecord) => {
    setEditingAddress(addr);
    setDialogOpen(true);
  };

  const handleSetDefault = async (addrId: string) => {
    setActionLoadingId(`default-${addrId}`);
    try {
      const res = await setDefaultAddressAction(addrId);
      if (!res.success) {
        toast.error("Failed to update default address", { description: res.error });
      } else {
        toast.success("Default Address Updated", {
          description: "This address will be selected for upcoming orders.",
        });
        router.refresh();
      }
    } catch {
      toast.error("An error occurred while updating default address.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (addrId: string) => {
    if (!confirm("Are you sure you want to remove this delivery address?")) {
      return;
    }

    setActionLoadingId(`delete-${addrId}`);
    try {
      const res = await deleteAddressAction(addrId);
      if (!res.success) {
        toast.error("Failed to delete address", { description: res.error });
      } else {
        toast.success("Address Removed", {
          description: "Delivery address has been removed from your account.",
        });
        router.refresh();
      }
    } catch {
      toast.error("An error occurred while deleting address.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground sm:text-lg">
            Delivery Addresses
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage your dispatch destinations and primary shipping location.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={handleOpenAdd}
          className="gap-1.5 self-start bg-[#171717] px-4 text-xs font-semibold text-white dark:bg-white dark:text-[#171717] sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Address</span>
        </Button>
      </div>

      {/* Address Cards Grid or Genuine Empty State */}
      {initialAddresses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center sm:p-14">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/80 text-muted-foreground">
            <MapPin className="h-6 w-6 stroke-[1.75]" />
          </div>
          <h3 className="mt-4 text-sm font-bold text-foreground">
            No Addresses Saved Yet
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
            Add your primary shipping destination for automated address selection during
            fabrication dispatch.
          </p>
          <div className="mt-5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenAdd}
              className="gap-2 text-xs"
            >
              <Plus className="h-3.5 w-3.5 text-[#E87536]" />
              <span>Add Your First Address</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {initialAddresses.map((addr) => {
            const isSettingDefault = actionLoadingId === `default-${addr.id}`;
            const isDeleting = actionLoadingId === `delete-${addr.id}`;

            return (
              <div
                key={addr.id}
                className={`relative flex flex-col justify-between rounded-xl border bg-card p-5 shadow-sm transition-all ${
                  addr.isDefault
                    ? "border-[#E87536]/60 bg-[#FAFAF8] dark:bg-card"
                    : "border-border hover:border-foreground/30"
                }`}
              >
                <div>
                  {/* Card Header: Recipient Name & Default Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-[#E87536]" />
                      <h4 className="text-sm font-bold text-foreground">
                        {addr.fullName}
                      </h4>
                    </div>
                    {addr.isDefault && (
                      <Badge
                        variant="brand"
                        className="gap-1 text-[10px] font-semibold tracking-wide"
                      >
                        <Star className="h-2.5 w-2.5 fill-current" />
                        <span>Default</span>
                      </Badge>
                    )}
                  </div>

                  {/* Address Body */}
                  <div className="mt-3 space-y-1 text-xs leading-relaxed text-muted-foreground">
                    <p className="font-medium text-foreground">{addr.street}</p>
                    {addr.apartment && <p>{addr.apartment}</p>}
                    <p>
                      {addr.city}, {addr.state} – {addr.postalCode}
                    </p>
                    <p>India (IN)</p>
                    <div className="flex items-center gap-1.5 pt-2 font-medium text-foreground/80">
                      <Phone className="h-3 w-3 text-[#E87536]" />
                      <span>{addr.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3">
                  <div>
                    {!addr.isDefault && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isSettingDefault || isDeleting}
                        onClick={() => handleSetDefault(addr.id)}
                        className="h-8 px-2 text-xs text-[#E87536] hover:bg-[#E87536]/10"
                      >
                        {isSettingDefault ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : (
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                        )}
                        <span>Set Default</span>
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isSettingDefault || isDeleting}
                      onClick={() => handleOpenEdit(addr)}
                      className="h-8 gap-1 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                      aria-label={`Edit address for ${addr.fullName}`}
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit</span>
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isSettingDefault || isDeleting}
                      onClick={() => handleDelete(addr.id)}
                      className="h-8 gap-1 px-2.5 text-xs text-destructive hover:bg-destructive/10"
                      aria-label={`Delete address for ${addr.fullName}`}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Dialog Modal */}
      <AddressDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        addressToEdit={editingAddress}
      />
    </div>
  );
}
