import { NextResponse, NextRequest } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import {
  getParentWithUserEmail,
  updateParent,
} from "@/lib/db/queries";

export async function GET() {
  try {
    const session = await getEdgeSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id!;

    const parent = await getParentWithUserEmail(userId);

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

    const userId = (session.user as { id?: string }).id!;
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

    // Get parent ID first
    const parent = await getParentWithUserEmail(userId);
    if (!parent) {
      return NextResponse.json({ error: "Parent profile not found" }, { status: 404 });
    }

    const result = await updateParent(parent.id, updateData);
    const updatedParent = result[0];

    // Fetch with user email
    const updatedParentWithEmail = await getParentWithUserEmail(userId);

    return NextResponse.json({
      success: true,
      parent: {
        id: updatedParentWithEmail!.id,
        email: updatedParentWithEmail!.user.email,
        name: updatedParentWithEmail!.name,
        phone: updatedParentWithEmail!.phone,
        address: updatedParentWithEmail!.address,
        city: updatedParentWithEmail!.city,
        state: updatedParentWithEmail!.state,
        postalCode: updatedParentWithEmail!.postalCode,
        preferredState: updatedParentWithEmail!.preferredState,
        country: updatedParentWithEmail!.country,
        profileImageUrl: updatedParentWithEmail!.profileImageUrl,
      },
    });
  } catch (error) {
    console.error("Parent profile update error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}
