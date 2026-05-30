import { NextResponse, NextRequest } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import {
  getTransactionByRazorpayOrderId,
  updateTransactionAsFailed,
  updateTransactionAndRegistrationAsSuccess,
  getRegistrationWithStudentAndCategory,
  getParentWithUser,
  getAdminUsers,
} from "@/lib/db/queries";
import crypto from "crypto";
import { createAndDispatchNotification } from "@/lib/notificationService";

export async function POST(req: Request) {
  try {
    const session = await getEdgeSession(req);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!razorpayOrderId) {
      return NextResponse.json({ error: "Required order parameters missing" }, { status: 400 });
    }

    // 1. Verify transaction in DB
    const transaction = await getTransactionByRazorpayOrderId(razorpayOrderId);

    if (!transaction) {
      return NextResponse.json({ error: "Original transaction record not found" }, { status: 404 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // 2. Perform validation (Real HMAC check or simulate if sandbox order)
    let isValid = false;

    if (razorpayOrderId.startsWith("order_sim_")) {
      isValid = true; // sandbox simulation order success
    } else if (keySecret && razorpayPaymentId && razorpaySignature) {
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      isValid = generatedSignature === razorpaySignature;
    }

    if (!isValid) {
      await updateTransactionAsFailed(razorpayOrderId);
      return NextResponse.json({ error: "Payment signature validation failed" }, { status: 400 });
    }

    // 3. Update database records as successful
    await updateTransactionAndRegistrationAsSuccess(
      razorpayOrderId,
      transaction.registrationId,
      razorpayPaymentId || "",
      razorpaySignature || ""
    );

    // 4. Send notifications (fire-and-forget)
    const registration = await getRegistrationWithStudentAndCategory(transaction.registrationId);

    if (registration) {
      const student = registration.student;
      const parent = await getParentWithUser(student.parentId);

      if (parent) {
        if (parent.user.email) {
          createAndDispatchNotification({
            userId: parent.userId,
            type: "PAYMENT_RECEIVED",
            title: "Payment Received",
            body: `Payment of ₹${transaction.amount} for ${student.name}'s registration in ${registration.competitionCategory.category.name} has been verified.`,
            actionUrl: "/account/dashboard",
            registrationId: registration.id,
            recipientEmail: parent.user.email,
          }).catch((err) =>
            console.error("Failed to send payment received notification:", err)
          );
        }
      }

      // Notify all admins
      const admins = await getAdminUsers();
      admins.forEach((admin: any) => {
        createAndDispatchNotification({
          userId: admin.id,
          type: "ADMIN_PAYMENT_CONFIRMED",
          title: "Payment Confirmed",
          body: `Payment of ₹${transaction.amount} from ${student.name} for ${registration.competitionCategory.category.name} has been verified.`,
          actionUrl: "/admin/dashboard",
          registrationId: registration.id,
          recipientEmail: admin.email,
        }).catch((err) =>
          console.error("Failed to send admin payment confirmation:", err)
        );
      });
    }

    return NextResponse.json({ message: "Payment verified and registered successfully" });
  } catch (error) {
    console.error("Payment verification failed:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}
