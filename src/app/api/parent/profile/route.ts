import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
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
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    const body = await request.json();

    const { name, phone, address, city, state, postalCode, country } = body;

    const updateData: {
      name?: string;
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
      profileImageUrl?: string;
    } = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (postalCode !== undefined) updateData.postalCode = postalCode;
    if (country !== undefined) updateData.country = country;
    if (body.profileImage !== undefined && body.profileImage !== null) {
      updateData.profileImageUrl = body.profileImage;
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
      email: updatedParent.user.email,
      name: updatedParent.name,
      phone: updatedParent.phone,
      address: updatedParent.address,
      city: updatedParent.city,
      state: updatedParent.state,
      postalCode: updatedParent.postalCode,
      country: updatedParent.country,
      profileImageUrl: updatedParent.profileImageUrl,
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
