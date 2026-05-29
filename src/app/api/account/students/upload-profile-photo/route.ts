import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import { uploadProfilePhoto } from "@/lib/r2";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const session = await getEdgeSession(request);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== "PARENT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 });
    }

    if (!ALLOWED_MIMES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, and WebP are allowed" }, { status: 400 });
    }

    // Convert File to Buffer
    const buffer = await file.arrayBuffer();
    const bufferData = Buffer.from(buffer);

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^\w.-]/g, "").substring(0, 50);
    const fileName = `${timestamp}-${sanitizedName}`;

    // Upload to R2
    const url = await uploadProfilePhoto(fileName, bufferData, file.type);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("POST /api/account/students/upload-profile-photo error:", error);
    return NextResponse.json({ error: "Failed to upload profile photo" }, { status: 500 });
  }
}
