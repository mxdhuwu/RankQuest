import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const subjects = ["PHYSICS", "CHEMISTRY", "MATHEMATICS"];
    const testStructure: Record<string, { sectionA: any[]; sectionB: any[] }> = {};

    for (const subject of subjects) {
      // Section A: 20 SCQs
      const scqs = await prisma.question.findMany({
        where: { subject, type: "SCQ" },
        take: 20,
      });

      // Section B: 10 NVQs (or SCQ converted if NVQ count is less)
      let nvqs = await prisma.question.findMany({
        where: { subject, type: "NVQ" },
        take: 10,
      });

      if (nvqs.length < 5) {
        // Supplement with additional questions
        const extra = await prisma.question.findMany({
          where: { subject },
          skip: 20,
          take: 10 - nvqs.length,
        });
        nvqs = [...nvqs, ...extra];
      }

      testStructure[subject] = {
        sectionA: scqs.map((q) => ({
          id: q.id,
          subject: q.subject,
          chapter: q.chapter,
          topic: q.topic,
          subtopic: q.subtopic,
          difficulty: q.difficulty,
          type: "SCQ",
          stem: q.stem,
          options: JSON.parse(q.options || "[]"),
          yearTag: q.yearTag,
        })),
        sectionB: nvqs.map((q) => ({
          id: q.id,
          subject: q.subject,
          chapter: q.chapter,
          topic: q.topic,
          subtopic: q.subtopic,
          difficulty: q.difficulty,
          type: q.type === "NVQ" ? "NVQ" : "SCQ",
          stem: q.stem,
          options: q.type === "SCQ" ? JSON.parse(q.options || "[]") : [],
          yearTag: q.yearTag,
        })),
      };
    }

    return NextResponse.json({
      success: true,
      testName: "JEE Main Official Simulation Mock Test #1",
      durationMinutes: 180,
      totalMarks: 300,
      markingScheme: {
        scq: { correct: 4, incorrect: -1, unattempted: 0 },
        nvq: { correct: 4, incorrect: 0, unattempted: 0 },
      },
      subjects: testStructure,
    });
  } catch (error: any) {
    console.error("Mock test fetch error:", error);
    return NextResponse.json(
      { error: "Failed to generate mock test." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      answers = {}, // { questionId: { answer: string, timeSpentSeconds: number, status: string } }
      timeSpentSeconds = 0,
    } = await req.json();

    const questionIds = Object.keys(answers);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
    });

    const qMap = new Map(questions.map((q) => [q.id, q]));

    let totalScore = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalUnattempted = 0;

    const subjectBreakdown: Record<
      string,
      { score: number; correct: number; incorrect: number; unattempted: number; total: number }
    > = {
      PHYSICS: { score: 0, correct: 0, incorrect: 0, unattempted: 0, total: 0 },
      CHEMISTRY: { score: 0, correct: 0, incorrect: 0, unattempted: 0, total: 0 },
      MATHEMATICS: { score: 0, correct: 0, incorrect: 0, unattempted: 0, total: 0 },
    };

    const detailedSolutions: any[] = [];

    for (const [qId, userResp] of Object.entries(answers as Record<string, any>)) {
      const q = qMap.get(qId);
      if (!q) continue;

      const subData = subjectBreakdown[q.subject] || {
        score: 0,
        correct: 0,
        incorrect: 0,
        unattempted: 0,
        total: 0,
      };
      subData.total++;

      const ans = (userResp.answer || "").trim();
      let isCorrect = false;
      let marksEarned = 0;

      if (!ans) {
        totalUnattempted++;
        subData.unattempted++;
      } else {
        const normUserAns = ans.toLowerCase();
        const normCorrectAns = (q.correctAnswer || "").toLowerCase().trim();

        if (q.type === "SCQ") {
          isCorrect = normUserAns === normCorrectAns;
          marksEarned = isCorrect ? 4 : -1;
        } else {
          const uNum = parseFloat(normUserAns);
          const cNum = parseFloat(normCorrectAns);
          if (!isNaN(uNum) && !isNaN(cNum)) {
            isCorrect = Math.abs(uNum - cNum) < 0.05;
          } else {
            isCorrect = normUserAns === normCorrectAns;
          }
          marksEarned = isCorrect ? 4 : 0;
        }

        if (isCorrect) {
          totalCorrect++;
          subData.correct++;
        } else {
          totalIncorrect++;
          subData.incorrect++;
        }

        totalScore += marksEarned;
        subData.score += marksEarned;
      }

      detailedSolutions.push({
        questionId: q.id,
        subject: q.subject,
        chapter: q.chapter,
        topic: q.topic,
        difficulty: q.difficulty,
        type: q.type,
        stem: q.stem,
        options: JSON.parse(q.options || "[]"),
        correctAnswer: q.correctAnswer,
        userAnswer: ans || null,
        isCorrect,
        marksEarned,
        solution: q.solution,
      });
    }

    // Estimate Percentile based on JEE Main historical score distribution
    // 250+ -> 99.8+, 200+ -> 99.0+, 150+ -> 97.0+, 100+ -> 92.0+, 60+ -> 80.0+
    let estimatedPercentile = 60.0;
    if (totalScore >= 260) estimatedPercentile = 99.9;
    else if (totalScore >= 220) estimatedPercentile = 99.4;
    else if (totalScore >= 180) estimatedPercentile = 98.7;
    else if (totalScore >= 140) estimatedPercentile = 96.5;
    else if (totalScore >= 100) estimatedPercentile = 92.0;
    else if (totalScore >= 70) estimatedPercentile = 85.0;
    else if (totalScore >= 40) estimatedPercentile = 75.0;
    else estimatedPercentile = Math.max(25.0, Math.round((totalScore / 300) * 100));

    // Save TestSession
    const session = await prisma.testSession.create({
      data: {
        userId: auth.userId,
        testType: "FULL_MOCK",
        subject: "ALL",
        score: totalScore,
        totalMarks: 300,
        totalQuestions: questionIds.length,
        correctCount: totalCorrect,
        incorrectCount: totalIncorrect,
        unattemptedCount: totalUnattempted,
        timeSpentSeconds,
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    // Record submissions
    for (const sol of detailedSolutions) {
      await prisma.submission.create({
        data: {
          sessionId: session.id,
          questionId: sol.questionId,
          userAnswer: sol.userAnswer,
          isCorrect: sol.isCorrect,
          timeTakenSeconds: answers[sol.questionId]?.timeSpentSeconds || 60,
          levelAtTime: sol.difficulty,
        },
      });
    }

    // Award XP
    const xpBonus = Math.max(100, totalCorrect * 25 + (totalScore > 100 ? 200 : 50));
    await prisma.subjectLevel.updateMany({
      where: { userId: auth.userId },
      data: {
        experiencePoints: { increment: Math.round(xpBonus / 3) },
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      totalScore,
      maxMarks: 300,
      totalCorrect,
      totalIncorrect,
      totalUnattempted,
      accuracy: totalCorrect + totalIncorrect > 0 ? Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100) : 0,
      estimatedPercentile,
      subjectBreakdown,
      xpAwarded: xpBonus,
      solutions: detailedSolutions,
    });
  } catch (error: any) {
    console.error("Mock test submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit mock test." },
      { status: 500 }
    );
  }
}
