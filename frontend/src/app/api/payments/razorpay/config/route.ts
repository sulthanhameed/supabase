import { razorpayConfigured, razorpayKeyId } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

/** Exposes gateway availability so the checkout can show the right UI. */
export async function GET() {
  return Response.json({ configured: razorpayConfigured(), keyId: razorpayConfigured() ? razorpayKeyId() : null });
}
