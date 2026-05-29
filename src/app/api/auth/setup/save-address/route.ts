import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";

interface SaveAddressRequest {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  preferredState?: string;
}

interface SessionUser {
  id: string;
  email: string;
  role: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<{ success?: boolean; error?: string }>> {
  try {
    const session = await getEdgeSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as SessionUser).id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "PARENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: SaveAddressRequest = await request.json();
    const { address, city, state, postalCode, preferredState } = body;

    // Validate required fields
    if (!address || typeof address !== "string" || address.trim() === "") {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    if (!city || typeof city !== "string" || city.trim() === "") {
      return NextResponse.json({ error: "City is required" }, { status: 400 });
    }

    if (!state || typeof state !== "string" || state.trim() === "") {
      return NextResponse.json({ error: "State is required" }, { status: 400 });
    }

    if (!postalCode || typeof postalCode !== "string") {
      return NextResponse.json({ error: "PIN Code is required" }, { status: 400 });
    }

    // Validate PIN code format (6 digits)
    if (!/^\d{6}$/.test(postalCode)) {
      return NextResponse.json(
        { error: "PIN Code must be exactly 6 digits" },
        { status: 400 }
      );
    }

    // Get parent profile
    const parent = await prisma.parent.findUnique({
      where: { userId },
    });

    if (!parent) {
      return NextResponse.json(
        { error: "Parent profile not found. Phone step must be completed first." },
        { status: 404 }
      );
    }

    // Update parent with address
    await prisma.parent.update({
      where: { userId },
      data: {
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        preferredState: preferredState && preferredState.trim() ? preferredState.trim() : null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to save address";
    console.error("Save address error:", errorMessage);
    return NextResponse.json(
      { error: "Failed to save address" },
      { status: 500 }
    );
  }
}
