import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR"];

const DEFAULT_CATEGORIES = [
  { name: "Bengali Recitation", grouping: "SPOKEN_WORD" },
  { name: "Rabindra Sangeet", grouping: "MUSIC_VOCAL" },
  { name: "Nazrul Geeti", grouping: "MUSIC_VOCAL" },
  { name: "Classical Dance (Bharatanatyam)", grouping: "PERFORMING_ARTS" },
  { name: "Kathak Dance", grouping: "PERFORMING_ARTS" },
  { name: "Odissi Dance", grouping: "PERFORMING_ARTS" },
  { name: "Manipuri Dance", grouping: "PERFORMING_ARTS" },
  { name: "Mohiniyattam Dance", grouping: "PERFORMING_ARTS" },
  { name: "Drawing & Painting", grouping: "VISUAL_ARTS" },
  { name: "Watercolor Painting", grouping: "VISUAL_ARTS" },
  { name: "Sculpture", grouping: "VISUAL_ARTS" },
  { name: "Folk Song", grouping: "MUSIC_VOCAL" },
  { name: "Devotional Song", grouping: "MUSIC_VOCAL" },
  { name: "Instrumental Music", grouping: "MUSIC_INSTRUMENTAL" },
  { name: "Tabla", grouping: "MUSIC_INSTRUMENTAL" },
  { name: "Harmonium", grouping: "MUSIC_INSTRUMENTAL" },
  { name: "Sitar", grouping: "MUSIC_INSTRUMENTAL" },
  { name: "Flute (Bansuri)", grouping: "MUSIC_INSTRUMENTAL" },
  { name: "Story Writing", grouping: "LITERARY_ARTS" },
  { name: "Essay Writing", grouping: "LITERARY_ARTS" },
  { name: "Elocution", grouping: "SPOKEN_WORD" },
  { name: "Group Dance", grouping: "PERFORMING_ARTS" },
  { name: "Group Song", grouping: "MUSIC_VOCAL" },
];

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as { role?: string }).role;
    if (!ADMIN_ROLES.includes(role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Check if categories already exist
    const existingCount = await prisma.category.count();
    if (existingCount > 0) {
      return NextResponse.json(
        { message: "Categories already exist. Seeding skipped.", count: existingCount },
        { status: 200 }
      );
    }

    // Create default categories
    const created = await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((cat) => ({
        name: cat.name,
        slug: cat.name
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .substring(0, 100),
        grouping: cat.grouping as string,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json(
      { message: "Categories seeded successfully", count: created.count },
      { status: 201 }
    );
  } catch (error) {
    console.error("Seed categories error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
