export type {
  Prisma,
  User,
  Account,
  Session,
  Category,
  Product,
  ProductImage,
  ProductVariant,
  Address,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Payment,
  Coupon,
  Review,
  Role,
  OrderStatus,
  PaymentStatus,
  AddressType,
  DiscountType,
} from "@prisma/client";

/**
 * Standard API Response envelope
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Standard Paginated Response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Common 3D printing metadata structure
 */
export interface Print3DMetadata {
  material?: "PLA" | "PETG" | "ABS" | "Resin" | "TPU" | string;
  layerHeightMm?: number;
  infillPercentage?: number;
  printDurationHours?: number;
  weightGrams?: number;
  dimensionsMm?: {
    x: number;
    y: number;
    z: number;
  };
}
