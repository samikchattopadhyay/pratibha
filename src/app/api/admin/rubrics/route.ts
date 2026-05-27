import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";

const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR"];
const FILE_PATH = path.join(process.cwd(), "src", "lib", "rubric-defaults.json");

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as { role?: string }).role;
    if (!ADMIN_ROLES.includes(role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (!fs.existsSync(FILE_PATH)) {
      return NextResponse.json({ error: "Defaults file not found" }, { status: 404 });
    }

    const fileContent = fs.readFileSync(FILE_PATH, "utf-8");
    const data = JSON.parse(fileContent);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Fetch rubrics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as { role?: string }).role;
    if (!ADMIN_ROLES.includes(role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const data = await req.json();
    if (!data || typeof data !== "object") {
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }

    // Save to file
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    return NextResponse.json({ success: true, message: "Rubrics saved successfully" });
  } catch (error) {
    console.error("Save rubrics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
