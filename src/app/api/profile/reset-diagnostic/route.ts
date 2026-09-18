import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Set isOnboarded to false
    await prisma.user.update({
      where: { id: auth.userId },
      data: { isOnboarded: false },
    });

    // Reset subject levels back to L1
    await prisma.subjectLevel.updateMany({
      where: { userId: auth.userId },
      data: {
        currentLevel: 1,
        experiencePoints: 0,
        accuracyRate: 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Diagnostic status reset successfully! Routing to diagnostic suite.",
      redirectTo: "/diagnostic",
    });
  } catch (error: any) {
    console.error("Reset diagnostic error:", error);
    return NextResponse.json(
      { error: "Failed to reset diagnostic status." },
      { status: 500 }
    );
  }
}
