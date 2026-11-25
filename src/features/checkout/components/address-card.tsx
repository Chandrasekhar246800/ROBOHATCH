"use client";

import * as React from "react";
import { Check, Edit2, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CheckoutAddress } from "../types/checkout-types";

interface AddressCardProps {
  address: CheckoutAddress;
  isSelected: boolean;
  onSelect: (address: CheckoutAddress) => void;
  onEdit: (address: CheckoutAddress) => void;
}

export function AddressCard({ address, isSelected, onSelect, onEdit }: AddressCardProps) {
  return (
    <div
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={() => onSelect(address)}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onSelect(address);
        }
      }}
      className={`group relative flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition-all sm:p-5 ${
        isSelected
          ? "border-[#E87536] bg-[#FAFAF8] shadow-sm ring-1 ring-[#E87536] dark:bg-card/90"
          : "border-border bg-card hover:border-foreground/30 hover:bg-secondary/20"
      }`}
    >
      <div>
        {/* Header row: Radio indicator, recipient name & default badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                isSelected
                  ? "border-[#E87536] bg-[#E87536] text-white"
                  : "border-muted-foreground/40 bg-background"
              }`}
            >
              {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
            </div>
            <span className="text-sm font-semibold text-foreground sm:text-base">
              {address.fullName}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {address.isDefault && (
              <Badge
                variant="outline"
                className="border-[#E87536]/40 bg-[#E87536]/10 text-[10px] font-semibold text-[#E87536]"
              >
                Default
              </Badge>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(address);
              }}
              aria-label={`Edit address for ${address.fullName}`}
              className="h-8 w-8 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Address Lines */}
        <div className="pl-6.5 mt-3 space-y-0.5 text-xs text-muted-foreground sm:text-sm">
          <p className="text-foreground/90">
            {address.street}
            {address.apartment ? `, ${address.apartment}` : ""}
          </p>
          <p>
            {address.city}, {address.state} – {address.postalCode}
          </p>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground/80">
            {address.country === "IN" ? "India" : address.country}
          </p>
        </div>
      </div>

      {/* Footer: Phone Number */}
      <div className="pl-6.5 mt-4 flex items-center gap-1.5 border-t border-border/60 pt-3 text-xs text-muted-foreground">
        <Phone className="h-3 w-3 shrink-0 text-muted-foreground/70" />
        <span className="font-mono text-[11px] sm:text-xs">{address.phone}</span>
      </div>
    </div>
  );
}
