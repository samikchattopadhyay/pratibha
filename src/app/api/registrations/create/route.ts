import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import Razorpay from "razorpay";
import { createAndDispatchNotification } from "@/lib/notificationService";

// Initialize Razorpay client. If keys are missing, we log it and proceed with simulated mode.
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const razorpay = keyId && keySecret
  ? new Razorpay({ key_id: keyId, key_secret: keySecret })
  : null;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { studentId, competitionCategoryId, fbPostUrl } = body;

    if (!studentId || !competitionCategoryId || !fbPostUrl) {
      return NextResponse.json({ error: "Please fill in all registration parameters" }, { status: 400 });
    }

    // 1. Verify student exists and belongs to the parent
    const userId = (session.user as { id?: string }).id || "";
    const parent = await prisma.parent.findUnique({
      where: { userId },
    });

    if (!parent) {
      return NextResponse.json({ error: "Parent profile not found" }, { status: 404 });
    }

    const student = await prisma.student.findFirst({
      where: { id: studentId, parentId: parent.id },
    });

    if (!student) {
      return NextResponse.json({ error: "Student profile not found under this account" }, { status: 404 });
    }

    // 2. Fetch category and fee info
    const compCategory = await prisma.competitionCategory.findUnique({
      where: { id: competitionCategoryId },
      include: {
        competition: true,
        category: true,
      },
    });

    if (!compCategory) {
      return NextResponse.json({ error: "Selected competition category is invalid" }, { status: 400 });
    }

    const amount = Number(compCategory.competition.entryFeeINR);

    // 3. Generate unique Roll ID E.g. PP-2026-REC-1029
    const year = new Date().getFullYear();
    const catCode = compCategory.category.name.substring(0, 3).toUpperCase();
    const randDigits = Math.floor(1000 + Math.random() * 9000);
    const registrationId = `PP-${year}-${catCode}-${randDigits}`;

    // 4. Create Registration in transaction
    const registration = await prisma.$transaction(async (tx) => {
      const reg = await tx.registration.create({
        data: {
          studentId,
          competitionCategoryId,
          fbPostUrl,
          registrationId,
          paymentStatus: "PENDING",
          status: "PENDING_VERIFICATION",
        },
      });

      return reg;
    });

    // 5. Generate Razorpay Order ID (or dummy fallback if unconfigured)
    let orderId = `order_sim_${Math.random().toString(36).substring(2, 11)}`;

    if (razorpay) {
      try {
        const order = await razorpay.orders.create({
          amount: amount * 100, // Amount in paise
          currency: "INR",
          receipt: registration.id,
          notes: {
            registrationId: registration.registrationId,
            studentName: student.name,
          },
        });
        orderId = order.id;
      } catch (payErr) {
        console.error("Razorpay orders creation failed, utilizing sandbox order:", payErr);
      }
    } else {
      console.log(`Razorpay credentials unconfigured. Generated simulation order: ${orderId}`);
    }

    // 6. Record transaction in database
    await prisma.transaction.create({
      data: {
        registrationId: registration.id,
        razorpayOrderId: orderId,
        amount: amount,
        status: "PENDING",
      },
    });

    // 7. Send notifications (fire-and-forget)
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.email) {
      createAndDispatchNotification({
        userId,
        type: "REGISTRATION_CREATED",
        title: "Registration Created",
        body: `${student.name} has been registered for ${compCategory.category.name}. Roll ID: ${registration.registrationId}`,
        actionUrl: "/parent/dashboard",
        registrationId: registration.id,
        recipientEmail: user.email,
      }).catch((err) => console.error("Failed to send registration created notification:", err));
    }

    // Notify all admins
    const admins = await prisma.user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "MODERATOR"] } },
    });
    admins.forEach((admin) => {
      createAndDispatchNotification({
        userId: admin.id,
        type: "ADMIN_NEW_REGISTRATION",
        title: "New Registration",
        body: `${student.name} registered for ${compCategory.category.name}. Roll ID: ${registration.registrationId}`,
        actionUrl: "/admin/dashboard",
        registrationId: registration.id,
        recipientEmail: admin.email,
      }).catch((err) => console.error("Failed to send admin notification:", err));
    });

    return NextResponse.json({
      registrationId: registration.registrationId,
      orderId,
      amount,
      currency: "INR",
    });
  } catch (error) {
    console.error("Initiate registration failed:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}
