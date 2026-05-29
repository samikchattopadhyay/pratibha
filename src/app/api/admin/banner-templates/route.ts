import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";

const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR"];

function requireAdmin(role: string) {
  return ADMIN_ROLES.includes(role);
}

export async function GET() {
  try {
    const session = await getEdgeSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as { role?: string }).role;
    if (!requireAdmin(role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const templates = await prisma.bannerTemplate.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("GET /api/admin/banner-templates error:", error);
    return NextResponse.json({ error: "Failed to fetch banner templates" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getEdgeSession(request);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as { role?: string }).role;
    if (!requireAdmin(role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { name, imageUrl, description, tags } = body;

    if (!name || !imageUrl) {
      return NextResponse.json({ error: "Name and imageUrl are required" }, { status: 400 });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check if slug already exists
    const existing = await prisma.bannerTemplate.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json({ error: "A template with this name already exists" }, { status: 400 });
    }

    const template = await prisma.bannerTemplate.create({
      data: {
        name,
        slug,
        imageUrl,
        description: description || null,
        tags: tags || [],
        isActive: true,
      },
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error("POST /api/admin/banner-templates error:", error);
    return NextResponse.json({ error: "Failed to create banner template" }, { status: 500 });
  }
}
