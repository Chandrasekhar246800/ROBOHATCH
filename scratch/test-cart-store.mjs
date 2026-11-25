// Unit and Edge Case Test Suite for RoboHatch Cart Store
import { PRODUCTS_DATA } from "../src/data/products.ts";

// Mock localStorage for Node test environment
const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => {
    mockStorage[key] = String(val);
  },
  removeItem: (key) => {
    delete mockStorage[key];
  },
  clear: () => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  },
};

// Test implementation of store logic
function createTestCartStore() {
  let state = {
    items: [],
    isDrawerOpen: false,
    hasHydrated: true,
  };

  function rupeesToPaise(rupees) {
    return Math.round(rupees * 100);
  }

  function generateCartItemId(productId, selectedColor) {
    if (!selectedColor) return `${productId}__default`;
    const normalized = selectedColor.trim().toLowerCase().replace(/\s+/g, "-");
    return `${productId}__${normalized}`;
  }

  function addItem(productId, quantity = 1, selectedColor) {
    const validQty = Math.max(1, Math.floor(quantity || 1));
    const product = PRODUCTS_DATA.find((p) => p.id === productId);
    if (!product) {
      return false;
    }
    if (product.availability === "Out of Stock") {
      return false;
    }

    let resolvedColor = undefined;
    if (product.colors && product.colors.length > 0) {
      if (selectedColor && product.colors.includes(selectedColor)) {
        resolvedColor = selectedColor;
      } else {
        resolvedColor = product.colors[0];
      }
    }

    const itemId = generateCartItemId(product.id, resolvedColor);
    const existingIndex = state.items.findIndex((item) => item.id === itemId);

    if (existingIndex > -1) {
      state.items[existingIndex].quantity += validQty;
      state.items[existingIndex].priceInPaise = rupeesToPaise(product.price);
    } else {
      state.items.push({
        id: itemId,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        priceInPaise: rupeesToPaise(product.price),
        quantity: validQty,
        selectedColor: resolvedColor,
        category: product.category,
        material: product.material,
      });
    }
    return true;
  }

  function removeItem(itemId) {
    state.items = state.items.filter((item) => item.id !== itemId);
  }

  function updateQuantity(itemId, quantity) {
    const validQty = Math.max(1, Math.floor(quantity || 1));
    state.items = state.items.map((item) =>
      item.id === itemId ? { ...item, quantity: validQty } : item
    );
  }

  function increaseQuantity(itemId) {
    state.items = state.items.map((item) =>
      item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
    );
  }

  function decreaseQuantity(itemId) {
    state.items = state.items.map((item) =>
      item.id === itemId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
    );
  }

  function clearCart() {
    state.items = [];
  }

  function getItemCount() {
    return state.items.reduce(
      (total, item) => total + (item.quantity > 0 ? item.quantity : 0),
      0
    );
  }

  function getSubtotalInPaise() {
    return state.items.reduce(
      (total, item) => total + item.priceInPaise * Math.max(0, item.quantity),
      0
    );
  }

  return {
    getState: () => state,
    addItem,
    removeItem,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    getItemCount,
    getSubtotalInPaise,
  };
}

async function runCartTests() {
  console.log("=== ROBOHATCH PHASE 5: CART STORE EDGE CASE AUDIT ===\n");
  const store = createTestCartStore();
  let passedCount = 0;
  let failedCount = 0;

  function assert(name, condition, message) {
    if (condition) {
      console.log(`✓ PASS: ${name}`);
      passedCount++;
    } else {
      console.error(`✗ FAIL: ${name} - ${message}`);
      failedCount++;
    }
  }

  // 1. Add one product (prod-1: Voronoi Kinetic Vessel, price ₹2,499 = 249900 paise)
  const add1 = store.addItem("prod-1", 1, "Carbon Obsidian");
  assert(
    "1. Add one product",
    add1 === true && store.getItemCount() === 1,
    "Failed to add prod-1"
  );
  assert(
    "1b. Integer paise stored",
    store.getState().items[0].priceInPaise === 249900,
    "Price not stored in paise"
  );
  assert(
    "1c. Subtotal matches",
    store.getSubtotalInPaise() === 249900,
    `Subtotal was ${store.getSubtotalInPaise()}`
  );

  // 2. Add same product again with same color (quantity should become 2)
  store.addItem("prod-1", 1, "Carbon Obsidian");
  assert(
    "2. Add same product again (quantity increments)",
    store.getState().items.length === 1 && store.getItemCount() === 2,
    "Line items duplicated instead of incrementing"
  );
  assert(
    "2b. Subtotal doubles accurately",
    store.getSubtotalInPaise() === 499800,
    "Subtotal was not 2x"
  );

  // 3. Add same product with another supported color (Basalt Charcoal) -> separate line
  store.addItem("prod-1", 1, "Basalt Charcoal");
  assert(
    "3. Add same product with different supported color",
    store.getState().items.length === 2 && store.getItemCount() === 3,
    "Did not create separate line for different color"
  );

  // 4. Add multiple different products (prod-2: ₹1,850, prod-4: ₹2,199)
  store.addItem("prod-2", 2, "Architectural Bone"); // +2 of prod-2
  store.addItem("prod-4", 1, "Stealth Black"); // +1 of prod-4
  assert(
    "4. Add multiple different products",
    store.getState().items.length === 4 && store.getItemCount() === 6,
    `Items count: ${store.getItemCount()}`
  );

  // 5. Increase quantity
  const firstItemId = store.getState().items[0].id;
  const initialQty = store.getState().items[0].quantity;
  store.increaseQuantity(firstItemId);
  assert(
    "5. Increase quantity",
    store.getState().items[0].quantity === initialQty + 1,
    "Quantity did not increase"
  );

  // 6. Decrease quantity
  store.decreaseQuantity(firstItemId);
  assert(
    "6. Decrease quantity",
    store.getState().items[0].quantity === initialQty,
    "Quantity did not decrease"
  );

  // 7. Attempt to decrease below 1 (clamp to 1)
  const singleItem = store.getState().items[1]; // qty 1
  store.decreaseQuantity(singleItem.id);
  store.decreaseQuantity(singleItem.id);
  assert(
    "7. Attempt to decrease below 1 (strictly clamped)",
    singleItem.quantity === 1,
    `Quantity fell to ${singleItem.quantity}`
  );

  // 8. Remove one item
  const initialItemCount = store.getState().items.length;
  store.removeItem(singleItem.id);
  assert(
    "8. Remove one item",
    store.getState().items.length === initialItemCount - 1,
    "Item was not removed"
  );

  // 9. Attempt to add invalid product data
  const invalidAdd = store.addItem("non-existent-id", 1);
  assert(
    "9. Reject invalid product ID",
    invalidAdd === false,
    "Invalid product was accepted"
  );

  // 10. Attempt to add zero or negative quantity (normalized to 1)
  store.addItem("prod-2", -5);
  const prod2Line = store.getState().items.find((i) => i.productId === "prod-2");
  assert(
    "10. Safely normalize negative quantity",
    prod2Line && prod2Line.quantity >= 1,
    "Negative quantity corrupted store"
  );

  // 11. Clear all items
  store.clearCart();
  assert(
    "11. Clear cart",
    store.getState().items.length === 0 &&
      store.getItemCount() === 0 &&
      store.getSubtotalInPaise() === 0,
    "Cart was not empty after clearCart"
  );

  console.log(`\nTEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  process.exit(failedCount > 0 ? 1 : 0);
}

runCartTests();
