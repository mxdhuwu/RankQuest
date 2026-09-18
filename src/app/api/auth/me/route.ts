import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getCurrentUser();
  if (!auth) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      email: true,
      name: true,
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
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // Calculate streak from test sessions completed on consecutive days
  const sessions = await prisma.testSession.findMany({
    where: { userId: user.id, status: "COMPLETED" },
    orderBy: { completedAt: "desc" },
    select: { completedAt: true },
    take: 30,
  });

  let streakDays = 0;
  if (sessions.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dates = new Set(
      sessions.map((s) => {
        if (!s.completedAt) return "";
        const d = new Date(s.completedAt);
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      })
    );

    // Check consecutive days starting today or yesterday
    let checkDate = new Date(today);
    let dateStr = `${checkDate.getFullYear()}-${checkDate.getMonth() + 1}-${checkDate.getDate()}`;

    if (!dates.has(dateStr)) {
      // Check yesterday
      checkDate.setDate(checkDate.getDate() - 1);
      dateStr = `${checkDate.getFullYear()}-${checkDate.getMonth() + 1}-${checkDate.getDate()}`;
    }

    while (dates.has(dateStr)) {
      streakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
      dateStr = `${checkDate.getFullYear()}-${checkDate.getMonth() + 1}-${checkDate.getDate()}`;
    }
  }

  const totalXP = user.subjectLevels.reduce((sum, s) => sum + s.experiencePoints, 0);

  return NextResponse.json({
    user: {
      ...user,
      streakDays: Math.max(1, streakDays), // Active day count
      totalXP,
    },
  });
}
