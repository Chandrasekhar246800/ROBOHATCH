export interface CheckoutAddress {
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

export interface ValidatedCheckoutItem {
  id: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  selectedColor?: string;
  quantity: number;
  unitPriceInPaise: number;
  lineTotalInPaise: number;
  availability: string;
  isAvailable: boolean;
  material: string;
}

export interface CheckoutValidationSummary {
  items: ValidatedCheckoutItem[];
  itemCount: number;
  subtotalInPaise: number;
  hasUnavailableItems: boolean;
  unavailableNames: string[];
  isEmpty: boolean;
}
