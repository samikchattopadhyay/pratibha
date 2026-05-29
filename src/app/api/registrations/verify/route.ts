import { NextResponse, NextRequest } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";
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
    const transaction = await prisma.transaction.findUnique({
      where: { razorpayOrderId },
      include: { registration: true },
    });

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
      // Mark transaction failed
      await prisma.transaction.update({
        where: { razorpayOrderId },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ error: "Payment signature validation failed" }, { status: 400 });
    }

    // 3. Update database records as successful
    await prisma.$transaction(async (tx) => {
      // Update transaction status
      await tx.transaction.update({
        where: { razorpayOrderId },
        data: {
          razorpayPaymentId,
          razorpaySignature,
          status: "SUCCESS",
        },
      });

      // Update registration payment status
      await tx.registration.update({
        where: { id: transaction.registrationId },
        data: { paymentStatus: "SUCCESS" },
      });
    });

    // 4. Send notifications (fire-and-forget)
    const registration = await prisma.registration.findUnique({
      where: { id: transaction.registrationId },
      include: {
        student: true,
        competitionCategory: {
          include: { category: true },
        },
      },
    });

    if (registration) {
      const student = registration.student;
      const parent = await prisma.parent.findFirst({
        where: { id: student.parentId },
      });

      if (parent) {
        const user = await prisma.user.findUnique({
          where: { id: parent.userId },
        });

        if (user?.email) {
          createAndDispatchNotification({
            userId: parent.userId,
            type: "PAYMENT_RECEIVED",
            title: "Payment Received",
            body: `Payment of ₹${transaction.amount} for ${student.name}'s registration in ${registration.competitionCategory.category.name} has been verified.`,
            actionUrl: "/account/dashboard",
            registrationId: registration.id,
            recipientEmail: user.email,
          }).catch((err) =>
            console.error("Failed to send payment received notification:", err)
          );
        }
      }

      // Notify all admins
      const admins = await prisma.user.findMany({
        where: { role: { in: ["SUPER_ADMIN", "MODERATOR"] } },
      });
      admins.forEach((admin) => {
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
