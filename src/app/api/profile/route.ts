import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        name: true,
        targetYear: true,
        avatar: true,
        isOnboarded: true,
        createdAt: true,
        subjectLevels: {
          select: {
            subject: true,
            currentLevel: true,
            experiencePoints: true,
            accuracyRate: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const testCount = await prisma.testSession.count({
      where: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      profile: {
        ...user,
        testCount,
      },
    });
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Failed to load profile." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, targetYear, avatar } = await req.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: auth.userId },
      data: {
        name: name.trim(),
        targetYear: targetYear || "2026",
        avatar: avatar || "compass",
      },
      select: {
        id: true,
        email: true,
        name: true,
        targetYear: true,
        avatar: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully!",
      user: updated,
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
