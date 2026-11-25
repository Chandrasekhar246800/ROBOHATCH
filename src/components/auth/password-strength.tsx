"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password?: string;
  className?: string;
}

export function PasswordStrength({ password = "", className }: PasswordStrengthProps) {
  const criteria = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter (A-Z)", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter (a-z)", met: /[a-z]/.test(password) },
    { label: "One number (0-9)", met: /[0-9]/.test(password) },
    { label: "One special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = criteria.filter((c) => c.met).length;

  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "bg-red-500",
    "bg-amber-500",
    "bg-amber-400",
    "bg-emerald-500",
    "bg-emerald-600",
  ];

  if (!password) {
    return null;
  }

  return (
    <div className={cn("space-y-2 pt-1.5", className)}>
      {/* 5-segment Progress Bar */}
      <div className="flex items-center gap-1">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              index < score
                ? strengthColors[score - 1]
                : "bg-neutral-200 dark:bg-neutral-800"
            )}
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Password Strength:</span>
        <span
          className={cn(
            "font-semibold",
            score < 2
              ? "text-red-600 dark:text-red-400"
              : score < 4
                ? "text-amber-600 dark:text-amber-400"
                : "text-emerald-600 dark:text-emerald-400"
          )}
        >
          {score > 0 ? strengthLabels[score - 1] : "Too Short"}
        </span>
      </div>

      {/* Criteria Checklist */}
      <ul className="grid grid-cols-1 gap-1 text-[11px] text-muted-foreground sm:grid-cols-2">
        {criteria.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {c.met ? (
              <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <X className="h-3 w-3 text-muted-foreground/50" />
            )}
            <span className={cn(c.met && "font-medium text-foreground")}>{c.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
