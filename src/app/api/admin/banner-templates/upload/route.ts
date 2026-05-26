import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { uploadBannerImage } from "@/lib/r2";

const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function requireAdmin(role: string) {
  return ADMIN_ROLES.includes(role);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as { role?: string }).role;
    if (!requireAdmin(role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
    }

    if (!ALLOWED_MIMES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed" }, { status: 400 });
    }

    // Convert File to Buffer
    const buffer = await file.arrayBuffer();
    const bufferData = Buffer.from(buffer);

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^\w.-]/g, "").substring(0, 50);
    const fileName = `banner-${timestamp}-${sanitizedName}`;

    // Upload to R2
    const url = await uploadBannerImage(fileName, bufferData, file.type);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("POST /api/admin/banner-templates/upload error:", error);
    return NextResponse.json({ error: "Failed to upload banner image" }, { status: 500 });
  }
}
