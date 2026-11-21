import * as React from "react";
import { cn } from "@/lib/utils";

export interface MainContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  noPadding?: boolean;
}

const sizeClasses = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-full",
};

export function MainContainer({
  as: Component = "div",
  size = "xl",
  noPadding = false,
  className,
  children,
  ...props
}: MainContainerProps) {
  return (
    <Component
      className={cn(
        "mx-auto w-full",
        sizeClasses[size],
        !noPadding && "px-4 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
