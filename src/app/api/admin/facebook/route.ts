import { NextRequest, NextResponse } from "next/server";
import { getEdgeSession } from "@/lib/auth-helper";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getEdgeSession(request);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "SUPER_ADMIN" && role !== "MODERATOR") {
      return NextResponse.json({ error: "Forbidden access: Admins only" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));

    const [totalCount, metrics] = await prisma.$transaction([
      prisma.socialMetric.count(),
      prisma.socialMetric.findMany({
        include: {
          registration: {
            include: {
              student: true,
              competitionCategory: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
        orderBy: {
          calculatedEngagement: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const formatted = metrics.map((m) => {
      const likes = m.likesCount;
      const comments = m.commentsCount;
      const shares = m.sharesCount;
      // Formula for velocity/engagement index out of 100
      const velocityIndex = Number(m.calculatedEngagement);

      return {
        id: m.id,
        studentName: m.registration?.student?.name || "Unknown",
        category: m.registration?.competitionCategory?.category?.name || "General",
        likes,
        comments,
        shares,
        velocityIndex: velocityIndex.toFixed(1),
        status: velocityIndex > 80 ? "🔥 Rising Talent" : "Standard",
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      metrics: formatted,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Facebook metrics API error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}
