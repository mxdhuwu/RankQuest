import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";
import { AdaptiveEngine, QuestionRecord } from "@/lib/adaptive/engine";

export async function POST(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, topic, attemptedIds = [] } = await req.json();

    const normalizedSubject = (subject || "PHYSICS").toUpperCase();

    // Get user's current level in subject
    const subjectLevel = await prisma.subjectLevel.findUnique({
      where: {
        userId_subject: {
          userId: auth.userId,
          subject: normalizedSubject,
        },
      },
    });

    const currentLevel = subjectLevel?.currentLevel || 1;

    // Fetch candidate questions for this subject
    const questions = await prisma.question.findMany({
      where: {
        subject: normalizedSubject,
        ...(topic ? { topic } : {}),
      },
      take: 200,
    });

    const pool: QuestionRecord[] = questions.map((q) => ({
      id: q.id,
      subject: q.subject,
      chapter: q.chapter,
      topic: q.topic,
      subtopic: q.subtopic,
      difficulty: q.difficulty,
      type: q.type,
      stem: q.stem,
      options: q.options,
      correctAnswer: q.correctAnswer,
      solution: q.solution,
      yearTag: q.yearTag,
    }));

    const nextQ = AdaptiveEngine.calculateNextQuestion(
      currentLevel,
      new Set(attemptedIds),
      pool,
      topic
    );

    if (!nextQ) {
      return NextResponse.json({
        success: true,
        question: null,
        message: "No more unattempted questions available in this session.",
        currentLevel,
      });
    }

    return NextResponse.json({
      success: true,
      currentLevel,
      userXP: subjectLevel?.experiencePoints || 0,
      question: {
        id: nextQ.id,
        subject: nextQ.subject,
        chapter: nextQ.chapter,
        topic: nextQ.topic,
        subtopic: nextQ.subtopic,
        difficulty: nextQ.difficulty,
        type: nextQ.type,
        stem: nextQ.stem,
        options: JSON.parse(nextQ.options || "[]"),
        yearTag: nextQ.yearTag,
      },
    });
  } catch (error: any) {
    console.error("Practice next error:", error);
    return NextResponse.json(
      { error: "Failed to generate next adaptive question." },
      { status: 500 }
    );
  }
}
