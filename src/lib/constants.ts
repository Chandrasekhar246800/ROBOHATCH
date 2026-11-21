/**
 * RoboHatch Core Constants & Design Tokens
 */

export const APP_CONFIG = {
  name: "RoboHatch",
  description:
    "Premium e-commerce platform for high-precision, designer 3D-printed products.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  defaultCurrency: "INR",
  currencySymbol: "₹",
} as const;

/**
 * Design Tokens as specified in design system requirements
 */
export const DESIGN_TOKENS = {
  colors: {
    primaryBackground: "#FAFAF8",
    secondaryBackground: "#F1F1EF",
    primaryText: "#171717",
    secondaryText: "#737373",
    accent: "#E87536",
    border: "#E5E5E5",
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
