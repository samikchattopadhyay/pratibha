import { NextResponse, NextRequest } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getEdgeSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;

    const parent = await prisma.parent.findUnique({
      where: { userId },
      include: {
        user: {
          select: { email: true },
        },
      },
    });

    if (!parent) {
      return NextResponse.json({ error: "Parent profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      email: parent.user.email,
      name: parent.name,
      phone: parent.phone,
      address: parent.address,
      city: parent.city,
      state: parent.state,
      postalCode: parent.postalCode,
      country: parent.country,
      profileImageUrl: parent.profileImageUrl,
    });
  } catch (error) {
    console.error("Parent profile fetch error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getEdgeSession(request);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    const body = await request.json();

    const { name, phone, address, city, state, postalCode, country, preferredState } = body;

    const updateData: {
      name?: string;
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
      preferredState?: string;
      profileImageUrl?: string;
      profileCompletedAt?: Date;
    } = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (postalCode !== undefined) updateData.postalCode = postalCode;
    if (country !== undefined) updateData.country = country;
    if (preferredState !== undefined) updateData.preferredState = preferredState;
    if (body.profileImage !== undefined && body.profileImage !== null) {
      updateData.profileImageUrl = body.profileImage;
    }

    if (address && city && state && postalCode && preferredState) {
      updateData.profileCompletedAt = new Date();
    }

    const updatedParent = await prisma.parent.update({
      where: { userId },
      data: updateData,
      include: {
        user: {
          select: { email: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      parent: {
        id: updatedParent.id,
        email: updatedParent.user.email,
        name: updatedParent.name,
        phone: updatedParent.phone,
        address: updatedParent.address,
        city: updatedParent.city,
        state: updatedParent.state,
        postalCode: updatedParent.postalCode,
        preferredState: updatedParent.preferredState,
        country: updatedParent.country,
        profileImageUrl: updatedParent.profileImageUrl,
      },
    });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      const meta = (error as { meta?: { target?: string[] } }).meta;
      const field = meta?.target?.[0] || "field";
      return NextResponse.json({ error: `${field} already in use` }, { status: 409 });
    }
    console.error("Parent profile update error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}
