// eslint-disable-next-line @typescript-eslint/no-require-imports
const midtransClient = require("midtrans-client");

interface SnapConfig {
  isProduction: boolean;
  serverKey: string;
  clientKey: string;
}

interface SnapTransaction {
  token: string;
  redirect_url: string;
}

// Initialize Midtrans Snap client
let snapInstance: InstanceType<typeof midtransClient.Snap> | null = null;

export function getSnap() {
  if (!snapInstance) {
    if (!process.env.MIDTRANS_SERVER_KEY) {
      throw new Error("MIDTRANS_SERVER_KEY is not set");
    }
    snapInstance = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
    } as SnapConfig);
  }
  return snapInstance;
}

interface SnapTransactionParams {
  orderId: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  userId: string;
}

/**
 * Create a Snap transaction token for payment popup
 */
export async function createSnapTransaction({
  orderId,
  amount,
  customerEmail,
  customerName,
  userId,
}: SnapTransactionParams): Promise<{ token: string; redirectUrl: string }> {
  const snap = getSnap();

  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    customer_details: {
      email: customerEmail,
      first_name: customerName,
    },
    item_details: [
      {
        id: "HEROTALES_PRO",
        price: amount,
        quantity: 1,
        name: "HeroTales Pro Monthly Subscription",
      },
    ],
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
      error: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=failed`,
      pending: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=pending`,
    },
    metadata: {
      userId: userId,
      type: "subscription",
    },
  };

  const transaction: SnapTransaction = await snap.createTransaction(parameter);

  return {
    token: transaction.token,
    redirectUrl: transaction.redirect_url,
  };
}

/**
 * Verify Midtrans notification signature
 */
export function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  signatureKey: string
): boolean {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require("crypto");
  const hash = crypto
    .createHash("sha512")
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest("hex");
  return hash === signatureKey;
}

/**
 * Map Midtrans transaction status to subscription status
 */
export function mapTransactionStatus(status: string): string {
  switch (status) {
    case "capture":
    case "settlement":
      return "active";
    case "pending":
      return "pending";
    case "deny":
    case "cancel":
    case "expire":
    case "failure":
      return "free";
    default:
      return "free";
  }
}
