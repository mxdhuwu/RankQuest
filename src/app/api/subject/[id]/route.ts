import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subjectParam = params.id.toUpperCase();
    const validSubjects = ["PHYSICS", "CHEMISTRY", "MATHEMATICS"];

    if (!validSubjects.includes(subjectParam)) {
      return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
    }

    // Fetch user level
    const subjectLevel = await prisma.subjectLevel.findUnique({
      where: {
        userId_subject: {
          userId: auth.userId,
          subject: subjectParam,
        },
      },
    });

    // Fetch all chapters & distinct topics for this subject
    const questions = await prisma.question.findMany({
      where: { subject: subjectParam },
      select: {
        id: true,
        chapter: true,
        topic: true,
        subtopic: true,
        difficulty: true,
      },
    });

    // Fetch user topic mastery records
    const topicMasteries = await prisma.topicMastery.findMany({
      where: {
        userId: auth.userId,
        subject: subjectParam,
      },
    });

    const masteryMap = new Map(topicMasteries.map((tm) => [tm.topicName, tm]));

    // Group by chapter
    const chapterMap = new Map<string, { topics: Set<string>; totalQuestions: number; difficulties: number[] }>();

    for (const q of questions) {
      if (!chapterMap.has(q.chapter)) {
        chapterMap.set(q.chapter, {
          topics: new Set(),
          totalQuestions: 0,
          difficulties: [],
        });
      }
      const entry = chapterMap.get(q.chapter)!;
      entry.topics.add(q.topic);
      entry.totalQuestions++;
      entry.difficulties.push(q.difficulty);
    }

    const currentLevel = subjectLevel?.currentLevel || 1;

    const chapters = Array.from(chapterMap.entries()).map(([chapterName, info]) => {
      const topicList = Array.from(info.topics);
      let totalMastery = 0;

      for (const t of topicList) {
        const tm = masteryMap.get(t);
        totalMastery += tm ? tm.masteryScore : Math.min(100, currentLevel * 14);
      }

      const avgMastery = topicList.length > 0 ? Math.round(totalMastery / topicList.length) : 50;

      return {
        name: chapterName,
        topicsCount: topicList.length,
        totalQuestions: info.totalQuestions,
        masteryScore: avgMastery,
        topics: topicList.slice(0, 6),
      };
    });

    return NextResponse.json({
      success: true,
      subject: subjectParam,
      currentLevel,
      experiencePoints: subjectLevel?.experiencePoints || 0,
      accuracyRate: Math.round(subjectLevel?.accuracyRate || 0),
      chapters,
      totalQuestionsAvailable: questions.length,
    });
  } catch (error: any) {
    console.error("Subject details error:", error);
    return NextResponse.json(
      { error: "Failed to load subject details." },
      { status: 500 }
    );
  }
}
