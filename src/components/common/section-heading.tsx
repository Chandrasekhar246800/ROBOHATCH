import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  badge?: string;
  title: string;
  description?: string;
  align?: "left" | "center" | "right";
  action?: React.ReactNode;
}

export function SectionHeading({
  badge,
  title,
  description,
  align = "left",
  action,
  className,
  ...props
}: SectionHeadingProps) {
  const isCenter = align === "center";
  const isRight = align === "right";

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "max-w-2xl space-y-2",
          isCenter && "mx-auto text-center",
          isRight && "ml-auto text-right"
        )}
      >
        {badge && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E87536]" />
            {badge}
          </div>
        )}
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="text-base leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>

      {action && (
        <div className={cn("shrink-0 pt-2 sm:pt-0", isCenter && "mx-auto")}>{action}</div>
      )}
    </div>
  );
}
