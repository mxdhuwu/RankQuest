import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";
import { AdaptiveEngine, SubmissionRecord } from "@/lib/adaptive/engine";

export async function POST(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      questionId,
      userAnswer,
      timeTakenSeconds = 30,
      currentStreak = 0,
      recentHistory = [],
    } = await req.json();

    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found." }, { status: 404 });
    }

    // Evaluate correctness
    let isCorrect = false;
    const normalizedUserAns = (userAnswer || "").trim().toLowerCase();
    const normalizedCorrectAns = (question.correctAnswer || "").trim().toLowerCase();

    if (question.type === "SCQ") {
      isCorrect = normalizedUserAns === normalizedCorrectAns;
    } else {
      const userNum = parseFloat(normalizedUserAns);
      const correctNum = parseFloat(normalizedCorrectAns);
      if (!isNaN(userNum) && !isNaN(correctNum)) {
        isCorrect = Math.abs(userNum - correctNum) < 0.05;
      } else {
        isCorrect = normalizedUserAns === normalizedCorrectAns;
      }
    }

    // Fetch user current level
    let subjectLevel = await prisma.subjectLevel.findUnique({
      where: {
        userId_subject: {
          userId: auth.userId,
          subject: question.subject,
        },
      },
    });

    const currentLevel = subjectLevel?.currentLevel || 1;

    // Build rolling history
    const history: SubmissionRecord[] = [
      ...recentHistory,
      {
        questionId: question.id,
        isCorrect,
        timeTakenSeconds,
        levelAtTime: question.difficulty,
        topic: question.topic,
      },
    ];

    // Evaluate level shift via AdaptiveEngine
    const levelEval = AdaptiveEngine.evaluateLevelShift(currentLevel, history, currentStreak);

    // Update SubjectLevel in database
    const updatedSubjectLevel = await prisma.subjectLevel.upsert({
      where: {
        userId_subject: {
          userId: auth.userId,
          subject: question.subject,
        },
      },
      create: {
        userId: auth.userId,
        subject: question.subject,
        currentLevel: levelEval.newLevel,
        experiencePoints: levelEval.xpAwarded,
        accuracyRate: levelEval.accuracy,
      },
      update: {
        currentLevel: levelEval.newLevel,
        experiencePoints: { increment: levelEval.xpAwarded },
        accuracyRate: levelEval.accuracy,
      },
    });

    // Update TopicMastery
    const existingMastery = await prisma.topicMastery.findUnique({
      where: {
        userId_topicName: {
          userId: auth.userId,
          topicName: question.topic,
        },
      },
    });

    const newMasteryScore = AdaptiveEngine.calculateUpdatedMastery(
      existingMastery?.masteryScore || 50,
      isCorrect,
      question.difficulty
    );

    await prisma.topicMastery.upsert({
      where: {
        userId_topicName: {
          userId: auth.userId,
          topicName: question.topic,
        },
      },
      create: {
        userId: auth.userId,
        topicName: question.topic,
        subject: question.subject,
        masteryScore: newMasteryScore,
        attemptsCount: 1,
        correctCount: isCorrect ? 1 : 0,
      },
      update: {
        masteryScore: newMasteryScore,
        attemptsCount: { increment: 1 },
        correctCount: isCorrect ? { increment: 1 } : undefined,
      },
    });

    // Record submission under a practice session or default
    let activeSession = await prisma.testSession.findFirst({
      where: {
        userId: auth.userId,
        testType: "ADAPTIVE_QUIZ",
        status: "IN_PROGRESS",
      },
    });

    if (!activeSession) {
      activeSession = await prisma.testSession.create({
        data: {
          userId: auth.userId,
          testType: "ADAPTIVE_QUIZ",
          subject: question.subject,
          status: "IN_PROGRESS",
        },
      });
    }

    await prisma.submission.create({
      data: {
        sessionId: activeSession.id,
        questionId: question.id,
        userAnswer,
        isCorrect,
        timeTakenSeconds,
        levelAtTime: question.difficulty,
      },
    });

    return NextResponse.json({
      success: true,
      isCorrect,
      correctAnswer: question.correctAnswer,
      solution: question.solution,
      levelShift: levelEval,
      newLevel: levelEval.newLevel,
      newXP: updatedSubjectLevel.experiencePoints,
      streak: levelEval.streak,
    });
  } catch (error: any) {
    console.error("Practice submit error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate practice submission." },
      { status: 500 }
    );
  }
}
