/**
 * Independent Application Instance Worker for Concurrency Testing
 *
 * Runs as an isolated Node.js OS process with its own memory heap, module cache,
 * and Prisma connection pool, communicating strictly through PostgreSQL.
 */

import { initiatePaymentAttempt } from "../src/features/payment/services/payment-service.ts";
import { ConfigurableFlatRateShippingCalculator } from "../src/features/pricing/lib/shipping-calculation.ts";

const workerId = process.argv[2] || "worker-1";
const userId = process.argv[3];
const addressId = process.argv[4] || "addr-user-a-ka";

// Mock Razorpay client that generates unique order IDs and simulates network latency
const mockRzpClient = {
  orders: {
    create: async (params) => {
      // Simulate real gateway network latency (100ms)
      await new Promise((r) => setTimeout(r, 100));
      return {
        id: `order_test_worker_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
        amount: params.amount,
        currency: params.currency,
        receipt: params.receipt,
        notes: params.notes,
      };
    },
  },
};

const user = {
  id: userId,
  name: "Alex Chen",
  email: "alex.chen@example.com",
};

async function runWorker() {
  try {
    const result = await initiatePaymentAttempt(
      {
        items: [{ productId: "prod-1", quantity: 1 }],
        deliveryAddressId: addressId,
        testOverrides: {
          taxVerificationOverrides: { "prod-1": "VERIFIED" },
          taxRateOverrides: { "prod-1": 18 },
          hsnCodeOverrides: { "prod-1": "3926.90.99" },
          shippingCalculatorOverride: new ConfigurableFlatRateShippingCalculator({
            flatRateInPaise: 15000,
          }),
          sellerOriginOverride: {
            sellerStateCode: "KA",
            sellerStateName: "Karnataka",
            country: "IN",
            isConfigured: true,
          },
          razorpayClientOverride: mockRzpClient,
        },
      },
      user
    );

    const payload = {
      workerId,
      success: result.success,
      orderId: result.orderId,
      paymentId: result.paymentId,
      razorpayOrderId: result.razorpayOrderId,
      amountInPaise: result.amountInPaise,
    };

    if (process.send) {
      process.send(payload);
    } else {
      console.log(JSON.stringify(payload));
    }
    process.exit(0);
  } catch (err) {
    const payload = {
      workerId,
      success: false,
      error: err.message,
    };
    if (process.send) {
      process.send(payload);
    } else {
      console.error(JSON.stringify(payload));
    }
    process.exit(1);
  }
}

runWorker();
