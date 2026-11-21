/**
 * RoboHatch Core Constants & Design Tokens
 */

export const APP_CONFIG = {
  name: "RoboHatch",
  tagline: "Precision 3D-Printed Design",
  description:
    "Premium e-commerce platform for high-precision, designer 3D-printed products.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  defaultCurrency: "INR",
  currencySymbol: "₹",
} as const;

/**
 * Systematic Design Tokens for RoboHatch Brand & Visual Identity
 */
export const DESIGN_TOKENS = {
  colors: {
    primaryBackground: "#FAFAF8",
    secondaryBackground: "#F1F1EF",
    primaryText: "#171717",
    secondaryText: "#737373",
    accent: "#E87536",
    accentHover: "#D66325",
    accentLight: "#FDF2EC",
    border: "#E5E5E5",
    // Semantic tokens
    semantic: {
      success: "#16A34A",
      successLight: "#F0FDF4",
      warning: "#D97706",
      warningLight: "#FFFBEB",
      destructive: "#DC2626",
      destructiveLight: "#FEF2F2",
      info: "#2563EB",
      infoLight: "#EFF6FF",
    },
  },
  typography: {
    fontFamilies: {
      sans: "var(--font-geist-sans), system-ui, sans-serif",
      mono: "var(--font-geist-mono), monospace",
    },
    scales: {
      display: "text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]",
      pageHeading: "text-3xl sm:text-4xl font-semibold tracking-tight leading-tight",
      sectionHeading: "text-2xl sm:text-3xl font-semibold tracking-tight leading-snug",
      subheading: "text-lg sm:text-xl font-medium text-muted-foreground leading-relaxed",
      bodyLarge: "text-lg leading-relaxed text-foreground",
      body: "text-base leading-relaxed text-foreground",
      bodySmall: "text-sm leading-normal text-muted-foreground",
      caption: "text-xs leading-normal text-muted-foreground",
      label: "text-xs font-medium uppercase tracking-wider text-muted-foreground",
      button: "text-sm font-medium tracking-normal",
    },
  },
  spacing: {
    container: {
      sm: "max-w-3xl",
      md: "max-w-5xl",
      lg: "max-w-6xl",
      xl: "max-w-7xl",
      full: "max-w-full",
    },
    padding: {
      pageHorizontal: "px-4 sm:px-6 lg:px-8",
      sectionVertical: "py-12 sm:py-16 lg:py-24",
      sectionVerticalCompact: "py-8 sm:py-12 lg:py-16",
      card: "p-6 sm:p-8",
      cardCompact: "p-4 sm:p-5",
    },
    gap: {
      grid: "gap-6 sm:gap-8",
      gridCompact: "gap-4 sm:gap-6",
      stack: "space-y-6 sm:space-y-8",
      stackCompact: "space-y-4",
    },
  },
  borderRadius: {
    sm: "0.25rem", // 4px
    md: "0.375rem", // 6px
    lg: "0.5rem", // 8px (default cards & dialogs)
    xl: "0.75rem", // 12px
    full: "9999px",
  },
  transitions: {
    fast: "transition-all duration-150 ease-out",
    default: "transition-all duration-200 ease-in-out",
    slow: "transition-all duration-300 ease-in-out",
  },
} as const;

/**
 * Order status display mapping
 */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Order Placed",
  CONFIRMED: "Confirmed",
  PROCESSING: "In Queue",
  PRINTING: "3D Printing in Progress",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 12,
  ADMIN_PER_PAGE: 25,
} as const;
