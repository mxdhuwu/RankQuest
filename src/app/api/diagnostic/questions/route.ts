import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const subjects = ["PHYSICS", "CHEMISTRY", "MATHEMATICS"];
    const diagnosticSuite: Record<string, any[]> = {};

    for (const subject of subjects) {
      // Pick 10 calibrated questions:
      // 2 Level 1 questions, 3 Level 2 questions, 3 Level 3 questions, 2 Level 4/5 questions
      const l1 = await prisma.question.findMany({
        where: { subject, difficulty: 1, type: "SCQ" },
        take: 2,
      });

      const l2 = await prisma.question.findMany({
        where: { subject, difficulty: 2, type: "SCQ" },
        take: 3,
      });

      const l3 = await prisma.question.findMany({
        where: { subject, difficulty: 3 },
        take: 3,
      });

      const l4 = await prisma.question.findMany({
        where: { subject, difficulty: { gte: 4 } },
        take: 2,
      });

      const combined = [...l1, ...l2, ...l3, ...l4];

      // Format safely for test runner (hide correctAnswer and solution)
      diagnosticSuite[subject] = combined.map((q) => ({
        id: q.id,
        subject: q.subject,
        chapter: q.chapter,
        topic: q.topic,
        subtopic: q.subtopic,
        difficulty: q.difficulty,
        type: q.type,
        stem: q.stem,
        options: JSON.parse(q.options || "[]"),
        yearTag: q.yearTag,
      }));
    }

    return NextResponse.json({
      success: true,
      suite: diagnosticSuite,
    });
  } catch (error: any) {
    console.error("Diagnostic fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load diagnostic suite." },
      { status: 500 }
    );
  }
}
