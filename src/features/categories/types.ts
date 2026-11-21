import type { Category } from "@/types";

export type CategoryWithChildren = Category & {
  children?: Category[];
  _count?: {
    products: number;
  };
};
