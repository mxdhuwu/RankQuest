import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";
import { AdaptiveEngine, SubmissionRecord } from "@/lib/adaptive/engine";

interface DiagnosticSubmissionPayload {
  answers: Record<
    string,
    {
      questionId: string;
      answer: string;
      timeSpentSeconds: number;
    }
  >;
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { answers } = (await req.json()) as DiagnosticSubmissionPayload;
    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ error: "No answers provided." }, { status: 400 });
    }

    const questionIds = Object.keys(answers);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
    });

    const questionMap = new Map(questions.map((q) => [q.id, q]));

    // Group answers by subject
    const subjectSubmissions: Record<string, { q: any; isCorrect: boolean; timeTaken: number; userAnswer: string }[]> = {
      PHYSICS: [],
      CHEMISTRY: [],
      MATHEMATICS: [],
    };

    for (const [qId, userResp] of Object.entries(answers)) {
      const q = questionMap.get(qId);
      if (!q) continue;

      let isCorrect = false;
      const normalizedUserAns = (userResp.answer || "").trim().toLowerCase();
      const normalizedCorrectAns = (q.correctAnswer || "").trim().toLowerCase();

      if (q.type === "SCQ") {
        isCorrect = normalizedUserAns === normalizedCorrectAns;
      } else {
        // NVQ numeric comparison with tolerance
        const userNum = parseFloat(normalizedUserAns);
        const correctNum = parseFloat(normalizedCorrectAns);
        if (!isNaN(userNum) && !isNaN(correctNum)) {
          isCorrect = Math.abs(userNum - correctNum) < 0.05;
        } else {
          isCorrect = normalizedUserAns === normalizedCorrectAns;
        }
      }

      const entry = {
        q,
        isCorrect,
        timeTaken: userResp.timeSpentSeconds || 30,
        userAnswer: userResp.answer,
      };

      if (subjectSubmissions[q.subject]) {
        subjectSubmissions[q.subject].push(entry);
      }
    }

    const placementResults: Record<string, any> = {};

    // Process each subject placement
    for (const [subject, items] of Object.entries(subjectSubmissions)) {
      const records: SubmissionRecord[] = items.map((item) => ({
        questionId: item.q.id,
        isCorrect: item.isCorrect,
        timeTakenSeconds: item.timeTaken,
        levelAtTime: item.q.difficulty,
        topic: item.q.topic,
      }));

      const placement = AdaptiveEngine.getDiagnosticPlacement(records);

      // Create or update SubjectLevel in DB
      await prisma.subjectLevel.upsert({
        where: {
          userId_subject: {
            userId: auth.userId,
            subject,
          },
        },
        create: {
          userId: auth.userId,
          subject,
          currentLevel: placement.assignedLevel,
          experiencePoints: placement.xpEarned,
          accuracyRate: placement.accuracy,
        },
        update: {
          currentLevel: placement.assignedLevel,
          experiencePoints: { increment: placement.xpEarned },
          accuracyRate: placement.accuracy,
        },
      });

      // Record TestSession for this subject diagnostic
      const correctCount = items.filter((i) => i.isCorrect).length;
      const incorrectCount = items.filter((i) => !i.isCorrect && i.userAnswer).length;
      const unattemptedCount = items.length - correctCount - incorrectCount;
      const totalTime = items.reduce((acc, curr) => acc + curr.timeTaken, 0);

      const session = await prisma.testSession.create({
        data: {
          userId: auth.userId,
          testType: "DIAGNOSTIC",
          subject,
          score: placement.score,
          totalMarks: items.length * 4,
          totalQuestions: items.length,
          correctCount,
          incorrectCount,
          unattemptedCount,
          timeSpentSeconds: totalTime,
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      // Create Submissions & initialize TopicMastery
      for (const item of items) {
        await prisma.submission.create({
          data: {
            sessionId: session.id,
            questionId: item.q.id,
            userAnswer: item.userAnswer,
            isCorrect: item.isCorrect,
            timeTakenSeconds: item.timeTaken,
            levelAtTime: item.q.difficulty,
          },
        });

        // Initialize topic mastery score
        const currentMastery = item.isCorrect ? 60 : 30;
        await prisma.topicMastery.upsert({
          where: {
            userId_topicName: {
              userId: auth.userId,
              topicName: item.q.topic,
            },
          },
          create: {
            userId: auth.userId,
            topicName: item.q.topic,
            subject,
            masteryScore: currentMastery,
            attemptsCount: 1,
            correctCount: item.isCorrect ? 1 : 0,
          },
          update: {
            masteryScore: currentMastery,
            attemptsCount: { increment: 1 },
            correctCount: item.isCorrect ? { increment: 1 } : undefined,
          },
        });
      }

      placementResults[subject] = placement;
    }

    // Set isOnboarded = true
    await prisma.user.update({
      where: { id: auth.userId },
      data: { isOnboarded: true },
    });

    return NextResponse.json({
      success: true,
      message: "Diagnostic completed and competency tiers assigned successfully!",
      placement: placementResults,
      redirectTo: "/dashboard",
    });
  } catch (error: any) {
    console.error("Diagnostic submit error:", error);
    return NextResponse.json(
      { error: "Failed to submit diagnostic assessment." },
      { status: 500 }
    );
  }
}
